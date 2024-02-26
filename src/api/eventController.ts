import express, { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { models } from "../models/index";

import AWS from "aws-sdk";

// Initialize AWS S3 with your credentials
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const createEvent: RequestHandler = async (req, res, next) => {
  let userID: any = req.user;
  userID = JSON.parse(JSON.stringify(userID));
  try {
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const { ...eventData } = req.body;
    const userFolder = `user-${foundUser?.email}`;
    const user = await models.User.findByPk(userID.id);
    const mediaFiles = req.files;
    const mediaUrls = [];
    for (
      let i = 0;
      mediaFiles && Array.isArray(mediaFiles) && i < mediaFiles.length;
      i++
    ) {      
      const file = mediaFiles[i];
      const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
      
      if (!BUCKET_NAME) {
        throw new Error("AWS_BUCKET_NAME is not defined");
      }
      

      const type = file.mimetype?.split("/")[1];
      const name = `${userFolder}/${Date.now()}-${i}.${type}`;

      const params = {
        Bucket: BUCKET_NAME,
        Key: name,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const { Location } = await s3.upload(params).promise();
      mediaUrls.push(Location);
    }
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const membersPerTeam = eventData.capacity / eventData.teamSize;

    const event = await models.Event.create({
      ...eventData,
      imageUrl: mediaUrls,
      creatorId: user.id,
      userEventId: user.id,
      capacity: membersPerTeam,
    });

    const numberOfTeams =
      eventData.capacity % eventData.teamSize === 0
        ? eventData.teamSize
        : eventData.teamSize + 1;

    for (let i = 0; i < numberOfTeams; i++) {
      await models.Team.create({
        eventId: event.id,
        name: `Team ${i + 1}`,
        membersPerTeam: membersPerTeam,
      });
    }
    if (event) {
      return res
        .status(201)
        .json({ message: "Event created successfully", event });
    } else {
      return res
        .status(500)
        .json({ error: "Cannot create event at the moment" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot create event at the moment" });
  }
};

export const getEventsColData: RequestHandler = async (req, res, next) => {
  try {
    const events = await models.Event.findAll({
      attributes: ["id", "eventName", "place"],
    });
    if (events) {
      return res.status(200).json({ events });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get event at the moment" });
  }
};

export const getEventPaymentDetails: RequestHandler = async (
  req,
  res,
  next
) => {
  try {
    const { id } = req.params;
    const event = await models.Event.findByPk(id);
    if (event) {
      const paymentDetails = {
        paymentType: event.paymentType,
        bankName: event.bankName,
        branchName: event.branchName,
        branchNumber: event.branchNumber,
        accountHolderName: event.accountHolderName,
        accountNumber: event.accountNumber,
        paypalId: event.paypalId,
        participationFee: event.participationFee,
      };
      return res.status(200).json(paymentDetails);
    } else {
      return res.status(404).json({ error: "Event not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot get event payment details at the moment" });
  }
};
export const getEventById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await models.Event.findByPk(id);
    if (event) {
      return res.status(200).json({
        event,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get event at the moment" });
  }
};
export const markAsFavorite: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { id } = req.params;

    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const event = await models.Event.findByPk(id);
    if (!foundUser || !event) {
      return res.status(404).json({ error: "User or event not found" });
    }

    await event.update({ isFavorite: !event.isFavorite });

    if (event.isFavorite) {
      return res.status(200).json({ message: "Event marked as favorite" });
    } else {
      return res.status(200).json({ message: "Event removed from favorites" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot mark event as favorite at the moment" });
  }
};

export const getAllEvents: RequestHandler = async (req, res, next) => {
  try {
    const { page, pageSize, eventStartDate, eventEndDate, status, place } =
      req.query;

    const filters: any = {};
    if (eventStartDate && eventEndDate) {
      filters.eventStartDate = { [Op.gte]: eventStartDate };
      filters.eventEndDate = { [Op.lte]: eventEndDate };
    }
    const currentDate = new Date();

    if (status === "upcoming") {
      filters.eventStartDate = { [Op.gte]: currentDate };
    } else if (status === "past") {
      filters.eventEndDate = { [Op.lt]: currentDate };
    } else if (status === "live") {
      filters.eventStartDate = { [Op.lte]: currentDate };
      filters.eventEndDate = { [Op.gte]: currentDate };
    }

    if (place) {
      filters.place = { [Op.in]: place };
    }
    const offset =
      (parseInt(page as string) - 1) * parseInt(pageSize as string);

     
    const events = await models.Event.findAndCountAll({
      include: [
        {
          model: models.User,
          as: "creator",
          attributes: ["nickName"],
        },
        {
          model: models.User,
          as: "participants",
          attributes: [],
        },
        {
          model: models.Comment,
          as: "comments",
          include: [
            {
              model: models.User,
              as: "user",
              attributes: ['nickname'],
            },
          ],
        },
        {
          model: models.Like,
          as: "likes",
          include: [
            {
              model: models.User,
              as: "user",
              attributes: [],
            },
          ],
        },
      ],
      where: filters,
      limit: parseInt(pageSize as string),
      offset: offset,
    });
  
   
    let eId: number[] = events.rows.map(event => event.id as number);
    let teams = await models.Team.findAll({
      where: {
        eventId: eId,
      },
      include: [
        {
          model: models.TeamMember,
          as: "members",
          attributes: ["userId", "teamId"],
          include: [
            {
              model: models.User,
              as: "users",
              attributes: ["id", "nickName", "imageUrl"],
            },
          ],
        },
      ],
    });
    let totalJoinedMembers = 0;
    teams = JSON.parse(JSON.stringify(teams));
    teams = teams.map((team: any) => {
      team.members = team.members.map((member: any) => {
        member.nickName = member.users.nickName;
        member.imageUrl = member.users.imageUrl;
        
        delete member.users;
        return member;
      });
      team.membersCount = team.members.length;
      totalJoinedMembers += team.membersCount;
      return team;
    });

    const eventsWithTeamMemberCount = events.rows.map(event => ({
      ...event.toJSON(),
      teamMemberCount: totalJoinedMembers,
      teams: teams
    }));
    if (events) {
      return res.status(200).json({
        events: eventsWithTeamMemberCount,
        count: events.count,
      });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get event at the moment" });
  }
};

export const getFavoriteEvents: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { page, pageSize } = req.query;

    const offset =
      (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const events = await models.Event.findAndCountAll({
      include: [
        {
          model: models.User,
          as: "creator",
          attributes: [],
        },
        {
          model: models.User,
          as: "participants",
          attributes: [],
        },
        {
          model: models.Comment,
          as: "comments",
          include: [
            {
              model: models.User,
              as: "user",
              attributes: [],
            },
          ],
        },
        {
          model: models.Like,
          as: "likes",
          include: [
            {
              model: models.User,
              as: "user",
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
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get event at the moment" });
  }
};

export const joinEvent: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { id } = req.params;
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const event = await models.Event.findByPk(id);
    if (!foundUser || !event) {
      return res.status(404).json({ error: "User or event not found" });
    }

    const alreadyJoined = await models.UserEvent.findOne({
      where: {
        user_id: userID.id,
        event_id: id,
      },
    });
    if (alreadyJoined) {
      return res.status(400).json({ error: "User already joined this event" });
    }

    await models.UserEvent.create({
      user_id: userID.id,
      event_id: id,
    });

    const teams = await models.Team.findAll({ where: { eventId: event.id } });
    let assigned = false;
    for (let i = 0; i < teams.length && !assigned; i++) {
      const team = teams[i];
      const members = await models.TeamMember.findAll({
        where: { teamId: team.id },
      });
      if (members.length < (team.membersPerTeam ?? 0)) {
        await models.TeamMember.create({
          userId: foundUser.id,
          teamId: team.id,
        });
        assigned = true;
      }
    }

    if (!assigned) {
      return res
        .status(500)
        .json({ error: "No available teams for user to join" });
    }
    return res.status(200).json({ message: "User successfully joined event" });
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot join event at the moment" });
  }
};

export const getPublicEvents: RequestHandler = async (req, res, next) => {
  try {
    const { page, pageSize, eventStartDate, eventEndDate, status } = req.query;

    const filters: any = {};
    if (eventStartDate && eventEndDate) {
      filters.eventStartDate = { [Op.gte]: eventStartDate };
      filters.eventEndDate = { [Op.lte]: eventEndDate };
    }
    const currentDate = new Date();

    if (status === "upcoming") {
      filters.eventStartDate = { [Op.gte]: currentDate };
    } else if (status === "past") {
      filters.eventEndDate = { [Op.lt]: currentDate };
    } else if (status === "live") {
      filters.eventStartDate = { [Op.lte]: currentDate };
      filters.eventEndDate = { [Op.gte]: currentDate };
    }

    const offset =
      (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const events = await models.Event.findAndCountAll({
      include: [
        {
          model: models.User,
          as: "creator",
          attributes: [],
        },
        {
          model: models.User,
          as: "participants",
          attributes: [],
        },
        {
          model: models.Comment,
          as: "comments",
          include: [
            {
              model: models.User,
              as: "user",
              attributes: [],
            },
          ],
        },
        {
          model: models.Like,
          as: "likes",
          include: [
            {
              model: models.User,
              as: "user",
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
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get event at the moment" });
  }
};

export const getJoinedEvents: RequestHandler = async (req, res, next) => {
  const userID: any = req.user;
  const foundUser = await models.User.findOne({ where: { id: userID.id } });
  if (!foundUser) {
    return res.status(404).json({ error: "User not found" });
  }

  const events = await models.Event.findAll({
    include: {
      model: models.User,
      where: { id: userID.id },
    },
  });
  return res.status(200).json(events);
};

export const getEventPlaces: RequestHandler = async (req, res, next) => {
  try {
    const events = await models.Event.findAll({
      attributes: ["place"],
    });
    if (events) {
      return res.status(200).json({ events });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get event at the moment" });
  }
};

export const getEventsByUserId: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { page, pageSize, eventStartDate, eventEndDate, status } = req.query;
    const filters: any = {};
    if (eventStartDate && eventEndDate) {
      filters.eventStartDate = { [Op.gte]: eventStartDate };
      filters.eventEndDate = { [Op.lte]: eventEndDate };
    }
    const currentDate = new Date();

    if (status === "upcoming") {
      filters.eventStartDate = { [Op.gte]: currentDate };
    } else if (status === "past") {
      filters.eventEndDate = { [Op.lt]: currentDate };
    } else if (status === "live") {
      filters.eventStartDate = { [Op.lte]: currentDate };
      filters.eventEndDate = { [Op.gte]: currentDate };
    }
    const offset =
      (parseInt(page as string) - 1) * parseInt(pageSize as string);
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    filters.userEventId = userID.id;

    const events = await models.Event.findAndCountAll({
      where: filters,
      offset: offset,
      limit: parseInt(pageSize as string),
    });
    return res.status(200).json(events);
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Cannot get event at the moment" });
  }
};
export default {
  createEvent,
  getAllEvents,
  getEventsColData,
  getEventById,
  markAsFavorite,
  getFavoriteEvents,
  joinEvent,
  getPublicEvents,
  getJoinedEvents,
  getEventPlaces,
  getEventsByUserId,
  getEventPaymentDetails,
};
