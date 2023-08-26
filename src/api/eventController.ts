import express, { RequestHandler }  from 'express';
import jwt from 'jsonwebtoken';
import {models} from "../models/index"


// get list of previous created events 
// get event by id 
// get event names

export const createEvent: RequestHandler = async (req, res, next) => {
  const creatorId = Number(req.query.creatorId);  
  try {
      const user = await models.User.findByPk(creatorId); 
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const event = await models.Event.create({
      ...req.body,
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

 export default {
    createEvent,
  }