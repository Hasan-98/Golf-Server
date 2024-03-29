import { RequestHandler } from "express";
import { models } from "../models";

export const addComment: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { eventId, content } = req.body;
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const event = await models.Event.findByPk(eventId);
    if (!foundUser || !event) {
      return res.status(404).json({ error: "User or event not found" });
    }

    const comment = await models.Comment.create({
      content,
      userId: userID.id,
      eventId: event.id,
    });
    if (comment) {
      return res
        .status(201)
        .json({ message: "Comment created successfully", comment, foundUser });
    } else {
      return res
        .status(500)
        .json({ error: "Cannot create comment at the moment" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot create comment at the moment" });
  }
};
export const editComment: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { commentId, content } = req.body;
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const comment = await models.Comment.findByPk(commentId);
    if (!foundUser || !comment) {
      return res.status(404).json({ error: "User or comment not found" });
    }

    const updatedComment = await comment.update({ content });
    if (updatedComment) {
      return res
        .status(200)
        .json({ message: "Comment updated successfully", updatedComment });
    } else {
      return res
        .status(500)
        .json({ error: "Cannot update comment at the moment" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot update comment at the moment" });
  }
};

export const deleteComment: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { commentId } = req.body;
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const comment = await models.Comment.findByPk(commentId);
    if (!foundUser || !comment) {
      return res.status(404).json({ error: "User or comment not found" });
    }

    const deletedComment: any = await comment.destroy();
    if (deletedComment) {
      return res
        .status(200)
        .json({ message: "Comment deleted successfully", deletedComment });
    } else {
      return res
        .status(500)
        .json({ error: "Cannot delete comment at the moment" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot delete comment at the moment" });
  }
};
export const addLike: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { eventId, Count } = req.body;
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const event = await models.Event.findByPk(eventId);

    if (!foundUser || !event) {
      return res.status(404).json({ error: "User or event not found" });
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

    return res
      .status(200)
      .json({ message: "Like updated successfully", foundUser });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot create or update like at the moment" });
  }
};

export const addPostLike: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { postId, Count } = req.body;
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const post = await models.Post.findByPk(postId);

    if (!foundUser || !post) {
      return res.status(404).json({ error: "User or post not found" });
    }

    const [like, created] = await models.Like.findOrCreate({
      where: {
        userId: userID.id,
        postId: post.id,
      },
      defaults: {
        counter: Count,
      },
    });

    if (!created) {
      await like.update({
        counter: Count,
      });
    }

    return res.status(200).json({
      message: "Like updated successfully",
      foundUser,
    });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot create or update like at the moment" });
  }
};

export const addPostComment: RequestHandler = async (req, res, next) => {
  try {
    const userID: any = req.user;
    const { postId, content } = req.body;
    const foundUser = await models.User.findOne({ where: { id: userID.id } });
    const post = await models.Post.findByPk(postId);
    if (!foundUser || !post) {
      return res.status(404).json({ error: "User or post not found" });
    }

    const comment = await models.Comment.create({
      content,
      userId: userID.id,
      postId: post.id,
    });
    if (comment) {
      return res
        .status(201)
        .json({ message: "Comment created successfully", comment, foundUser });
    } else {
      return res
        .status(500)
        .json({ error: "Cannot create comment at the moment" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot create comment at the moment" });
  }
};

export default {
  addComment,
  addLike,
  addPostLike,
  addPostComment,
  editComment,
  deleteComment,

};
