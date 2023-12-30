import express, { RequestHandler }  from 'express';
import jwt from 'jsonwebtoken';
import { Op } from 'sequelize';
import {models} from "../models/index"

import AWS from 'aws-sdk';

// Initialize AWS S3 with your credentials
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const createEvent: RequestHandler = async (req, res, next) => {
  let userID: any = req.user;
  userID = JSON.parse(JSON.stringify(userID));
  try {
    
    const foundUser = await models.User.findOne({ where: { id : userID.id } });
    const { imageUrl, ...eventData } = req.body;
    const userFolder = `user-${foundUser?.email}`;
    const user = await models.User.findByPk(userID.id);
    const imageUrls = [];
    for (let i = 0; i < imageUrl.length; i++) {
      const base64Image = imageUrl[i];
      const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

      if (!BUCKET_NAME) {
        throw new Error('AWS_BUCKET_NAME is not defined');
      }

      const type = imageUrl[i]?.split(';')[0]?.split('/')[1];
      const name = `${userFolder}/${Date.now()}-${i}.${type}`;
      const params = {
        Bucket: BUCKET_NAME,
        Key: name,
        Body: Buffer.from(base64Image.replace(/^data:image\/\w+;base64,/, ""),'base64'),
        ContentType: `image/${type}`,
      };
      const { Location } = await s3.upload(params).promise();
      imageUrls.push(Location);
    }
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const event = await models.Event.create({
      ...eventData,
      imageUrl: imageUrls, 
      creatorId: user.id,
    });

    if (event) {
      return res.status(201).json({ message: 'Event created successfully', event });
    } else {
      return res.status(500).json({ error: 'Cannot create event at the moment' });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Cannot create event at the moment' });
  }
};

export const getEventsColData: RequestHandler = async (req, res, next) => {
  try {
    const events = await models.Event.findAll({
      attributes: ['id', 'eventName'],
    });
    if (events) {
      return res.status(200).json({ events });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Cannot get event at the moment' });
  }
}

export const getEventById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event= await models.Event.findByPk(id);
    if (event) {
      return res.status(200).json({ 
        imageUrl : event.imageUrl,
        eventVideoUrl: event.eventVideoUrl,
      });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Cannot get event at the moment' });
  }
}

export const markAsFavorite: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { id } = req.params;
  
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const event = await models.Event.findByPk(id);
    if (!foundUser || !event) {
      return res.status(404).json({ error: 'User or event not found' });
    }

    await event.update({ isFavorite: !event.isFavorite });

    if (event.isFavorite) {
      return res.status(200).json({ message: 'Event marked as favorite' });
    } else {
      return res.status(200).json({ message: 'Event removed from favorites' });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Cannot mark event as favorite at the moment' });
  }
};

export const getAllEvents: RequestHandler = async (req, res, next) => {
  try {
    const { page, pageSize, eventStartDate, eventEndDate, status } = req.query;

    const filters: any = {};
    if (eventStartDate && eventEndDate) {
      filters.eventStartDate = { [Op.gte]: eventStartDate };
      filters.eventEndDate = { [Op.lte]: eventEndDate };
    }
    const currentDate = new Date();
    
    if (status === 'upcoming') {
      filters.eventStartDate = { [Op.gte]: currentDate };
    } else if (status === 'past') {
      filters.eventEndDate = { [Op.lt]: currentDate };
    } else if (status === 'live') {
      filters.eventStartDate = { [Op.lte]: currentDate };
      filters.eventEndDate = { [Op.gte]: currentDate };
    }

    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const events = await models.Event.findAndCountAll({
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: [],
        },
        {
          model: models.User,
          as: 'participants',
          attributes: [],
        },
        {
          model: models.Comment,
          as: 'comments',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: [],
            },
          ],
        },
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: [],
            },
          ],
        },
      ],
      where: filters,
      limit: parseInt(pageSize as string),
      offset: offset,
    });

    if (events) {
      return res.status(200).json({
        events: events.rows,
        count: events.count,
      });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Cannot get event at the moment' });
  }
};

export const getFavoriteEvents: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { page, pageSize } = req.query;

    const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const events = await models.Event.findAndCountAll({
      include: [
        {
          model: models.User,
          as: 'creator',
          attributes: [],
        },
        {
          model: models.User,
          as: 'participants',
          attributes: [],
        },
        {
          model: models.Comment,
          as: 'comments',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: [],
            },
          ],
        },
        {
          model: models.Like,
          as: 'likes',
          include: [
            {
              model: models.User,
              as: 'user',
              attributes: [],
            },
          ],
        },
      ],
      where: { isFavorite: true },
      limit: parseInt(pageSize as string),
      offset: offset,
    });

    if (events) {
      return res.status(200).json({
        events: events.rows,
        count: events.count,
      });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Cannot get event at the moment' });
  }
}

// export const joinEvent: RequestHandler = async (req, res, next) => {
//   try {
//     const userID: any = req.user;
//     const { eventId } = req.body;

//     const foundUser = await models.User.findOne({ where: { id: userID.id } });
//     const event = await models.Event.findByPk(eventId);

//     if (!foundUser || !event) {
//       return res.status(404).json({ error: 'User or event not found' });
//     }

//     const isParticipant = await event.hasParticipant(foundUser);
//     if (isParticipant) {
//       return res.status(400).json({ error: 'User is already a participant in the event' });
//     }

//     await event.addParticipant(foundUser);

//     return res.status(200).json({ message: 'User joined the event successfully' });
//   } catch (err) {
//     console.error('Error:', err);
//     return res.status(500).json({ error: 'Cannot join event at the moment' });
//   }
// };


 export default {
    createEvent,
    getAllEvents,
    getEventsColData,
    getEventById,
    markAsFavorite,
    getFavoriteEvents,
  }