import { RequestHandler } from "express";
import { models } from "../models/index";
const { Op } = require("sequelize");
import AWS from "aws-sdk";
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const createPost: RequestHandler = async (req, res, next) => {
  try {
    const { category, tags, text } = req.body;
    let userId: any = req.user;
    userId = JSON.parse(JSON.stringify(userId));
    const foundUser = await models.User.findOne({ where: { id: userId.id } });
    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const userFolder = `user-${foundUser?.email}`;
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

    const post = await models.Post.create({
      userId: userId.id,
      category,
      text,
      tags,
      mediaFile: mediaUrls,
    });

    res.status(201).json({
      message: "Post Created Successfully",
      post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating post" });
  }
};

export const getMyPosts: RequestHandler = async (req, res, next) => {
  try {
    let userId: any = req.user;
    userId = JSON.parse(JSON.stringify(userId));
    const foundUser = await models.User.findOne({ where: { id: userId.id } });
    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const posts = await models.Post.findAll({
      where: { userId: userId.id },
      include: [
        {
          model: models.User,
          as: "posts",
          required: false,
          attributes: ["id", "email", "nickName", "imageUrl"],
        },
        {
          model: models.Like,
          required: false,
          as: "PostLikes",
        },
        {
          model: models.Comment,
          required: false,
          as: "PostComments",
        },
      ],
    });
    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching posts" });
  }
};
export const getPosts: RequestHandler = async (req, res, next) => {
  try {
    const category = req.query.category;

    const posts = await models.Post.findAll({
      where: {
        category: category as string | undefined,
      },
      include: [
        {
          model: models.User,
          as: "posts",
          required: false,
          attributes: ["id", "email", "nickName", "imageUrl"],
        },
        {
          model: models.Like,
          required: false,
          as: "PostLikes",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
        {
          model: models.Comment,
          required: false,
          as: "PostComments",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
      ],
    });
    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching posts" });
  }
};
export const getPostById: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await models.Post.findOne({
      where: { id },
      include: [
        {
          model: models.User,
          as: "posts",
          attributes: ["id", "email", "nickName", "imageUrl"],
        },
        {
          model: models.Like,
          as: "PostLikes",
        },
        {
          model: models.Comment,
          as: "PostComments",
          include: [
            {
              model: models.User,
              as: "user",
              attributes: ["id", "nickName", "imageUrl"],
            },
          ],
        },
      ],
    });
    res.status(200).json({
      message: "Post fetched successfully",
      post,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching post" });
  }
};

export const updatePost: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await models.Post.findOne({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    const updatedPost = await post.update(req.body);
    res.status(200).json({
      message: "Post updated successfully",
      updatedPost,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating post" });
  }
};

export const deletePost: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params;
    const post = await models.Post.findOne({ where: { id } });
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    // Delete associated comments before deleting the post
    await models.Comment.destroy({ where: { postId: id } });
    await models.Like.destroy({ where: { postId: id } });
    await post.destroy();
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error deleting post" });
  }
};
export const getAllPosts: RequestHandler = async (req, res, next) => {
  try {
    const posts = await models.Post.findAll({
      attributes: { exclude: ["category"] },
      include: [
        {
          model: models.User,
          as: "posts",
          required: false,
          attributes: ["id", "email", "nickName", "imageUrl"],
        },
        {
          model: models.Like,
          required: false,
          as: "PostLikes",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
        {
          model: models.Comment,
          required: false,
          as: "PostComments",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
      ],
    });
    res.status(200).json({
      message: "Posts fetched successfully",
      posts,
      count: posts.length,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching posts" });
  }
};
export const getTopLikedPost: RequestHandler = async (req, res, next) => {
  try {
    let posts: any= await models.Post.findAll({
      attributes: { exclude: ["category"] },
      include: [
        {
          model: models.User,
          as: "posts",
          required: false,
          attributes: ["id", "email", "nickName", "imageUrl"],
        },
        {
          model: models.Like,
          required: false,
          as: "PostLikes",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
        {
          model: models.Comment,
          required: false,
          as: "PostComments",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
      ],
    });

     posts.sort((a: any, b: any) => b.PostLikes.length - a.PostLikes.length);

     const topLikedPosts = posts.slice(0, 3);
 
     res.status(200).json({
       message: "Top liked post fetched successfully",
       topLikedPosts,
     });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching top liked post" });
  }
};
export const getTopCommetedPost: RequestHandler = async (req, res, next) => {
  try {
    let comments: any= await models.Post.findAll({
      attributes: { exclude: ["category"] },
      include: [
        {
          model: models.User,
          as: "posts",
          required: false,
          attributes: ["id", "email", "nickName", "imageUrl"],
        },
        {
          model: models.Like,
          required: false,
          as: "PostLikes",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
        {
          model: models.Comment,
          required: false,
          as: "PostComments",
          include: [
            {
              model: models.User,
              attributes: ["nickName", "imageUrl"],
              as: "user",
            },
          ],
        },
      ],
    });

    comments.sort((a: any, b: any) => b.PostComments.length - a.PostComments.length);

     const topCommentedPosts = comments.slice(0, 3);
 
     res.status(200).json({
       message: "Top Commented post fetched successfully",
       topCommentedPosts,
     });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching top commented post" });
  }
};
export default {
  createPost,
  getPosts,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
  getMyPosts,
  getTopLikedPost,
  getTopCommetedPost
};
