import { RequestHandler } from "express";
import { models } from "../models/index";

export const getAllScoreCards: RequestHandler = async (req, res, next) => {
  try {
    const scoreCards = await models.ScoreCard.findAll({
      include: [
        {
          model: models.User,
          as: "userScoreCard",
          attributes: [],
        },
        {
          model: models.Event,
          as: "eventScoreCard",
          attributes: [],
        },
      ],
      order : [['totalScore' , 'DESC']]
    });

    return res.status(200).json(scoreCards);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot get score cards at the moment" });
  }
};

export const getScoreCardByEvent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const foundEvent = await models.Event.findOne({ where: { id } });

    if (!foundEvent) {
      return res.status(400).json({ error: `Event with id ${id} not found` });
    }

    const scoreCards = await models.ScoreCard.findAll({
      where: {
        eventId: id,
      },
      include: [
        {
          model: models.User,
          as: "userScoreCard",
          attributes: [],
        },
      ],
    });

    return res.status(200).json(scoreCards);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot get score cards at the moment" });
  }
};
export const getScoreCardByUser: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;

    const foundUser = await models.User.findOne({ where: { id } });

    if (!foundUser) {
      return res.status(400).json({ error: `User with id ${id} not found` });
    }

    const scoreCards = await models.ScoreCard.findAll({
      where: {
        userId: id,
      },
      include: [
        {
          model: models.Event,
          as: "eventScoreCard",
          attributes: [],
        },
      ],
    });

    return res.status(200).json(scoreCards);
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot get score cards at the moment" });
  }
};

export const addScoreCard: RequestHandler = async (req, res, next) => {
  try {
    const scoreCards = req.body.map((scoreCard: any) => ({
      ...scoreCard,
      scorePerShot: JSON.stringify(scoreCard.scorePerShot),
      handiCapPerShot: JSON.stringify(scoreCard.handiCapPerShot),
    }));

    for (const scoreCard of scoreCards) {
      const foundUser = await models.User.findOne({
        where: { id: scoreCard.userId },
      });
      const foundEvent = await models.Event.findOne({
        where: { id: scoreCard.eventId },
      });

      if (!foundUser) {
        return res
          .status(400)
          .json({ error: `User with id ${scoreCard.userId} not found` });
      }

      if (!foundEvent) {
        return res
          .status(400)
          .json({ error: `Event with id ${scoreCard.eventId} not found` });
      }
    }

    const createdScoreCards = await models.ScoreCard.bulkCreate(scoreCards);

    res.status(201).send({
      message: "Score Cards added successfully",
      scoreCards: createdScoreCards,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error adding score cards" });
  }
};
export const updateScoreCard: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { userId, eventId, scorePerShot, handiCapPerShot, totalScore , handiCapValue , netValue  } = req.body;

    const foundUser = await models.User.findOne({ where: { id: userId } });
    const foundEvent = await models.Event.findOne({ where: { id: eventId } });

    if (!foundUser) {
      return res
        .status(400)
        .json({ error: `User with id ${userId} not found` });
    }

    if (!foundEvent) {
      return res
        .status(400)
        .json({ error: `Event with id ${eventId} not found` });
    }

    const scoreCard = await models.ScoreCard.update({
      scorePerShot: JSON.stringify(scorePerShot),
      handiCapPerShot: JSON.stringify(handiCapPerShot),
      totalScore,
      handiCapValue,
      netValue,
    }, {
      where: {
        id,
      },
    });

    res.status(201).send({
      message: "Score Card updated successfully",
      scoreCard,
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Error updating score card" });
  }
};

export default {
  getAllScoreCards,
  getScoreCardByEvent,
  getScoreCardByUser,
  addScoreCard,
  updateScoreCard,
};
