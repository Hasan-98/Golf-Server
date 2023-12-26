
import { RequestHandler } from 'express';
import { models } from '../models';

export const addComment: RequestHandler = async (req, res, next) => {
    try {
      const userID: any = req.user;
      const { eventId, content } = req.body;
      const foundUser = await models.User.findOne({ where: { id : userID.id } });
      const event = await models.Event.findByPk(eventId);
      if (!foundUser || !event) {
        return res.status(404).json({ error: 'User or event not found' });
      }
  
      const comment = await models.Comment.create({
        content,
        userId: userID.id,
        eventId: event.id,
      });
      if (comment) {
        return res.status(201).json({ message: 'Comment created successfully', comment });
      } else {
        return res.status(500).json({ error: 'Cannot create comment at the moment' });
      }
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Cannot create comment at the moment' });
    }
  };

  export const addLike: RequestHandler = async (req, res, next) => {
    try {
      const userID: any = req.user;
      const { eventId, Count } = req.body;
      const foundUser = await models.User.findOne({ where: { id: userID.id } });
      const event = await models.Event.findByPk(eventId);
  
      if (!foundUser || !event) {
        return res.status(404).json({ error: 'User or event not found' });
      }
  
      const [like, created] = await models.Like.findOrCreate({
        where: {
          userId: userID.id,
          eventId: event.id,
        },
        defaults: {
          counter: Count,
        },
      });
  
      if (!created) {
        await like.update({ counter: Count });
      }
  
      return res.status(200).json({ message: 'Like updated successfully' });
    } catch (err) {
      console.error('Error:', err);
      return res.status(500).json({ error: 'Cannot create or update like at the moment' });
    }
  };
  
  export default {
    addComment,
    addLike
  }