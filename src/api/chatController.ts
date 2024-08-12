import { RequestHandler } from 'express';
import Pusher from 'pusher';
import PushNotifications from '@pusher/push-notifications-server';
import { Sequelize, Op } from 'sequelize';
import { models } from '../models';

const pusher = new Pusher({
  appId: process.env.APP_ID!,
  key: process.env.KEY!,
  secret: process.env.SECRET!,
  cluster: process.env.CLUSTER!,
  useTLS: true
});

const beamsClient = new PushNotifications({
  instanceId: process.env.INTEGRATION_KEY!,
  secretKey: process.env.SECRET_KEY!
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
      is_read: false,
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

export const markAllMessagesAsRead: RequestHandler = async (req, res, next) => {
  const { sender, receiver } = req.body;

  // Validate input
  if (!sender || !receiver) {
    return res.status(400).json({ message: 'Sender and receiver IDs are required.' });
  }

  try {
    // Update messages where is_read is false
    const [updatedCount] = await models.Chat.update(
      { is_read: true },
      {
        where: {
          [Op.or]: [
            { sender, receiver },
            { sender: receiver, receiver: sender }
          ],
          is_read: false // Only target unread messages
        }
      }
    );

    if (updatedCount === 0) {
        return res.status(200).json({});
    }

    // Successfully updated messages
    res.status(200).json({ message: `${updatedCount} message(s) marked as read.` });
  } catch (error) {
    console.error('Error updating message read status:', error);
    res.status(500).json({ message: 'An error occurred while updating message read status.', error });
  }
};

export const updateMessageStatus: RequestHandler = async (req, res, next) => {
  const { messageId, isRead } = req.body;

  // Validate input
  if (!messageId || typeof isRead !== 'boolean') {
    return res.status(400).json({ message: 'Message ID and read status are required.' });
  }

  try {
    // Update the message read status
    const [updatedCount] = await models.Chat.update(
      { is_read: isRead },
      {
        where: { id: messageId }
      }
    );

    if (updatedCount === 0) {
        return res.status(404).json({ message: 'Message not found or status unchanged.' });
    }

    res.status(200).json({ message: `Message ${messageId} marked as ${isRead ? 'read' : 'unread'}.` });
  } catch (error) {
    console.error('Error updating message read status:', error);
    res.status(500).json({ message: 'An error occurred while updating message read status.', error });
  }
};

export const deleteMessage: RequestHandler = async (req, res, next) => {
  const { messageId } = req.params;

  // Validate input
  if (!messageId) {
    return res.status(400).json({ message: 'Message ID is required.' });
  }

  try {
    // Delete the message
    const deletedCount = await models.Chat.destroy({
      where: { id: messageId }
    });

    if (deletedCount === 0) {
      return res.status(404).json({ message: 'Message not found.' });
    }

    res.status(200).json({ message: `Message ${messageId} deleted successfully.` });
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({ message: 'An error occurred while deleting the message.', error });
  }
};

export const updateMessage: RequestHandler = async (req, res, next) => {
  const { messageId } = req.params;
  const { message, isRead } = req.body; // Example fields to update

  // Validate input
  if (!messageId || (!message && typeof isRead !== 'boolean')) {
    return res.status(400).json({ message: 'Message ID and at least one field to update are required.' });
  }

  try {
    // Update the message
    const [updatedCount] = await models.Chat.update(
      { message, is_read: isRead },
      {
        where: { id: messageId },
        returning: true, // To get the updated message back (optional)
      }
    );

    if (updatedCount === 0) {
      return res.status(404).json({ message: 'Message not found or nothing to update.' });
    }

    res.status(200).json({ message: `Message ${messageId} updated successfully.` });
  } catch (error) {
    console.error('Error updating message:', error);
    res.status(500).json({ message: 'An error occurred while updating the message.', error });
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
    let usersWithMessages = Object.keys(usersMap).map(userId => ({
      user: usersDetailsMap[userId] || { id: userId, name: 'Unknown' }, 
      messages: usersMap[userId].sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) 
    }));

    // Filter out the receiver from the result
    usersWithMessages = usersWithMessages.filter(u => u.user.id !== receiver);

    // Sort users by the most recent message timestamp
    usersWithMessages.sort((a, b) => {
      const aLatestMessage = new Date(a.messages[0].timestamp).getTime();
      const bLatestMessage = new Date(b.messages[0].timestamp).getTime();
      return bLatestMessage - aLatestMessage;
    });

    res.status(200).json(usersWithMessages);
  } catch (err) {
    res.status(500).send('Error fetching users with messages: ' + err);
  }
};

export const updateUserPresence: RequestHandler = async (req, res, next) => {

  const { userId, status } = req.body; // 'online' or 'offline'

  if (!userId || !status) {
    return res.status(400).json({ message: 'User ID and status are required.' });
  }

  // Trigger event to update user presence status
  pusher.trigger('presence-channel', 'user-status', {
    user_id: userId,
    status: status,
  });

  res.status(200).json({ message: `User ${userId} is now ${status}.` });
};

export const getAllOnlineUsers: RequestHandler = async (req, res, next) => {
  try {
    // Fetch online users from the presence channel
    const result = await pusher.get({
      path: `/channels/presence-channel/users`,
    });

    // Log the raw response for debugging
    console.log('Pusher response:', result);

    // Convert ReadableStream to string
    const resultBody = await new Promise<string>((resolve, reject) => {
      let data = '';
      result.body.on('data', (chunk: string) => {
        data += chunk;
      });
      result.body.on('end', () => {
        resolve(data);
      });
      result.body.on('error', (err: Error) => {
        reject(err);
      });
    });

    // Log the response body for debugging
    console.log('Response body:', resultBody);

    // Parse the string as JSON
    const parsedData = JSON.parse(resultBody);
    console.log('Parsed data:', parsedData);

    const onlineUsers = parsedData.users.map((user: any) => user.id);

    res.status(200).json({ onlineUsers });
  } catch (error) {
    console.error('Error fetching online users:', error);
    res.status(500).json({ message: 'An error occurred while fetching online users.', error });
  }
};
export const authsd: RequestHandler = async (req: any, res, next) => {
  const { socket_id, channel_name } = req.body;

  if (!socket_id || !channel_name) {
    return res.status(400).json({ message: 'Socket ID and channel name are required.' });
  }

  const userId = req.user.id; // Access the userId from the decoded token

  if (!userId) {
    return res.status(401).json({ message: 'User is not authenticated.' });
  }

  const presenceData = {
    user_id: userId,
    user_info: {
      name: "ss",
    },
  };

  const auth = pusher.authenticate(socket_id, channel_name, presenceData);

  res.send(auth);
};
