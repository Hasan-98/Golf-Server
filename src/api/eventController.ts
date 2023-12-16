import express, { RequestHandler }  from 'express';
import jwt from 'jsonwebtoken';
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
        Body: Buffer.from(base64Image, 'base64'),
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

export const getAllEvents: RequestHandler = async (req, res, next) => {
  try {
    console.log('get called')
    const events = await models.Event.findAll({
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
      
    });
    // download image from s3 which i uploaded in create event
    if (events){
      return res.status(200).json({ events });
    }
  } catch (err) {
    console.error('Error:', err);
    return res.status(500).json({ error: 'Cannot get event at the moment' });

  }
};
 export default {
    createEvent,
    getAllEvents
  }