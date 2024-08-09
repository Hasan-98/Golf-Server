import { RequestHandler } from 'express';
import Pusher from 'pusher';
import PushNotifications from '@pusher/push-notifications-server';
import { Sequelize, Op } from 'sequelize';
import { models } from '../models';

const pusher = new Pusher({
  appId: "1845624",
  key: "06eee6fdace6c672f8b2",
  secret: "5905b272dd0236a2e68a",
  cluster: "ap3",
  useTLS: true
});

const beamsClient = new PushNotifications({
  instanceId: '2f55c6b0-0852-4c60-896e-f4036ef33af1',
  secretKey: '3E1854748BFE490436140A4D6E9221F9AE3F816FDF358833210ABCDCD6829334'
});

export const postChat: RequestHandler = async (req, res, next) => {
  const { channel, event, message, sender, receiver } = req.body;

  if (!channel || !event || !message || !sender || !receiver) {
    return res.status(400).send('Missing required fields');
  }

  try {
    const fullMessage = {
      channel,
      event,
      message,
      sender,
      receiver,
      timestamp: new Date()
    };

    // Save message to the database
    await models.Chat.create(fullMessage);

    // Trigger event with Pusher
    await pusher.trigger(channel, event, fullMessage);

    // Send push notification
    await beamsClient.publishToInterests([`user-${receiver}`], {
      web: {
        notification: {
          title: `${sender}`,
          body: message,
          deep_link: 'http://localhost:3000' // Your frontend URL
        }
      }
    });

    res.status(200).send('Event and notification triggered successfully');
  } catch (err) {
    res.status(500).send('Error: ' + err);
  }
};

export const getChat: RequestHandler = async (req, res, next) => {
  const sender = req.query.sender as string;
  const receiver = req.query.receiver as string;

  try {
    // Fetch chat messages between sender and receiver
    const userMessages = await models.Chat.findAll({
      where: {
        [Op.or]: [
          {
            sender: sender,
            receiver: receiver
          },
          {
            sender: receiver,
            receiver: sender
          }
        ]
      }
    });

    // Fetch details of sender and receiver
    const users = await models.User.findAll({
      where: {
        id: {
          [Op.in]: [sender, receiver]
        }
      }
    });

    // Map users to easily access them by id
    const usersMap: { [key: string]: any } = {};
    users.forEach(user => {
      usersMap[user.id] = user;
    });

    // Extract sender and receiver details from usersMap
    const senderDetails = usersMap[sender];
    const receiverDetails = usersMap[receiver];

    // Respond with messages and user details
    res.status(200).json({
      userMessages,
      sender: senderDetails,
      receiver: receiverDetails
    });
  } catch (err) {
    res.status(500).send('Error fetching messages: ' + err);
  }
};



export const getUsersWithMessages: RequestHandler = async (req, res, next) => {
  const receiver = req.query.receiver as string;

  if (!receiver) {
    return res.status(400).send('Missing receiver ID');
  }

  try {
    // Fetch messages involving the receiver
    const messages = await models.Chat.findAll({
      where: {
        [Op.or]: [
          { sender: receiver },
          { receiver: receiver }
        ]
      },
      order: [['timestamp', 'DESC']] 
    });

    // Map to store messages per user
    const usersMap: { [key: string]: any[] } = {};

    messages.forEach((msg: any) => {
      if (!usersMap[msg.sender]) {
        usersMap[msg.sender] = [];
      }
      if (!usersMap[msg.receiver]) {
        usersMap[msg.receiver] = [];
      }
      usersMap[msg.sender].push(msg);
      usersMap[msg.receiver].push(msg);
    });

    // Extract user IDs and fetch user details
    const userIds = Object.keys(usersMap).filter(userId => userId !== receiver);
    const users = await models.User.findAll({
      where: {
        id: {
          [Op.in]: userIds
        }
      }
    });

    // Create a map for user details
    const usersDetailsMap: { [key: string]: any } = {};
    users.forEach(user => {
      usersDetailsMap[user.id] = user;
    });

    // Merge user details with messages
    const usersWithMessages = Object.keys(usersMap).map(userId => ({
      user: usersDetailsMap[userId] || { id: userId, name: 'Unknown' }, 
      messages: usersMap[userId].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) 
    }));

    // Filter out the receiver from the result
    const filteredUsersWithMessages = usersWithMessages.filter(u => u.user.id !== receiver);

    res.status(200).json(filteredUsersWithMessages);
  } catch (err) {
    res.status(500).send('Error fetching users with messages: ' + err);
  }
};


