import express, { RequestHandler }  from 'express';
import jwt from 'jsonwebtoken';
import {models} from "../models/index"

import { v4 as uuidv4 } from 'uuid'; // for generating unique filenames
import AWS from 'aws-sdk';

// Initialize AWS S3 with your credentials
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// get event by id 
// get event names

export const createEvent: RequestHandler = async (req, res, next) => {
  let userID : any= req.user;
  userID = JSON.parse(JSON.stringify(userID))
  try {
      const {image} = req.body;
      const user = await models.User.findByPk(userID.id); 
      s3.upload(
        {
          Bucket: process.env.AWS_BUCKET_NAME as string,
          Key: uuidv4() + '.png',
          Body: image,
          ACL: 'public-read',
        },
        (error: any, data: any) => {
          if (error) {
            res.status(500).json({ error: error });
          }
          if (data) {
            console.log(data);
            res.status(201).json({ image: data.Location });
          }
        }
      );
      console.info(JSON.parse(JSON.stringify(user)))
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

export const getEvent: RequestHandler = async (req, res, next) => {
}
 export default {
    createEvent,
  }