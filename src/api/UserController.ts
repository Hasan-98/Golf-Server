import express, { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { models } from "../models/index";
import AWS from "aws-sdk";
import axios from "axios";
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});
export const register: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { nickName, email, password } = req.body;
    const passwordRegex = /^(?=.*[!@#$%^&*])(?=.*[a-zA-Z]).{5,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        error:
          "Password must be at least 5 characters long and contain at least one special character",
      });
    }

    const alreadyExistsUser = await models.User.findOne({ where: { email } });
    if (alreadyExistsUser) {
      return res
        .status(409)
        .json({ message: "User with email already exists!" });
    }

    const token = jwt.sign({ email }, "secret");

    // Handle file upload
    const userFolder = `user-${email}`;
    const file = req.file;
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

    if (!BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME is not defined");
    }

    const type = file.mimetype?.split("/")[1];
    const name = `${userFolder}/${Date.now()}.${type}`;
    const params = {
      Bucket: BUCKET_NAME,
      Key: name,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    const { Location } = await s3.upload(params).promise();
    const imageUrl = Location;

    const newUser = {
      nickName,
      email,
      password,
      token,
      imageUrl,
    };

    const savedCustomer = await models.User.create(newUser);

    if (savedCustomer) {
      return res.status(200).json({ message: "Thanks for registering" });
    } else {
      return res
        .status(500)
        .json({ error: "Cannot register user at the moment!" });
    }
  } catch (err) {
    console.log("Error: ", err);
    return res
      .status(500)
      .json({ error: "Cannot register user at the moment!" });
  }
};

export const editProfilePic: RequestHandler = async (req, res, next) => {
  try {
    let userId: any = req.user;
    userId = JSON.parse(JSON.stringify(userId));

    const foundUser: any = await models.User.findOne({ where: { id: userId.id } });
    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }
    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    if (!BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME is not defined");
    }
    const userFolder = `user-${foundUser.email}`;
    const file = req.file;
    const type = file?.mimetype?.split("/")[1];
    const name = `${userFolder}/${Date.now()}.${type}`;
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: name,
      Body: file?.buffer,
      ContentType: file?.mimetype,
    };

    const { Location } = await s3.upload(uploadParams).promise();
    foundUser.imageUrl = Location;

    await foundUser.save();

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: foundUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating profile picture" });
  }
};
export const login: RequestHandler = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    const userWithEmail = await models.User.findOne({ where: { email } }).catch(
      (err: Error) => {
        console.log("Error: ", err);
      }
    );
    if (!userWithEmail) {
      return res
        .status(400)
        .json({ message: "Email or password does not match!" });
    }
    if (userWithEmail.password !== password) {
      return res
        .status(400)
        .json({ message: "Email or password does not match!" });
    }
    // if (userWithEmail.role === 'admin') {
    //   return res.status(403).json({ error: 'User is admin, Use Admin Portal' });
    // }
    const { id } = userWithEmail;
    const jwtToken = jwt.sign(
      { id: userWithEmail.id, email: userWithEmail.email },
      "secret"
    );
    const teacher = await models.Teacher.findOne({
      where: { userId: userWithEmail.id },
    });
    const teacherId = teacher ? teacher.id : null;

    res.status(200).json({
      message: "Welcome Back!",
      id,
      jwtToken,
      teacherId,
      role: userWithEmail.role
    });
  } catch (err) {
    console.log("Error: ", err);
    return res
      .status(500)
      .json({ error: "Cannot Login user at the moment!" });
  }
};
export const adminLogin: RequestHandler = async (req: any, res: any, next: any) => {
  try {
    const { email, password } = req.body;
    const userWithEmail = await models.User.findOne({ where: { email } }).catch(
      (err: Error) => {
        console.log("Error: ", err);
      }
    );
    if (!userWithEmail) {
      return res
        .status(400)
        .json({ message: "Email or password does not match!" });
    }
    if (userWithEmail.password !== password) {
      return res
        .status(400)
        .json({ message: "Email or password does not match!" });
    }

    if (userWithEmail.role !== 'admin') {
      return res.status(403).json({ error: 'User is not an admin' });
    }

    const { id } = userWithEmail;
    const jwtToken = jwt.sign(
      { id: userWithEmail.id, email: userWithEmail.email },
      "secret"
    );
    const teacher = await models.Teacher.findOne({
      where: { userId: userWithEmail.id },
    });
    const teacherId = teacher ? teacher.id : null;

    res.status(200).json({
      message: "Welcome Back!",
      id,
      jwtToken,
      teacherId,
      role: userWithEmail.role
    });
  } catch (err) {
    console.log("Error: ", err);
    return res
      .status(500)
      .json({ error: "Cannot Login user at the moment!" });
  }
};
export const userById: any = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const foundUser = await models.User.findOne({ where: { id } });

    if (!foundUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ user: foundUser });
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ error: "Unable to retrieve user profile at this time" });
  }
};
export const editUserProfile: any = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    const user = await models.User.findOne({ where: { id } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const updatedUser = await user.update(req.body);
    res.status(200).json({ user: updatedUser });
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ error: "Unable to update user profile at this time" });
  }
};
export const getTotalUsers: any = async (req: any, res: any) => {
  try {
    const users = await models.User.findAll({
      attributes: { exclude: ["password", "token"] },
    });
    res.status(200).json({ users: users, count: users.length });
  } catch (err) {
    console.log("Error: ", err);
    res
      .status(500)
      .json({ error: "Unable to retrieve user profile at this time" });
  }
};

export const translatePage: any = async (req: any, res: any) => {
  const { text, target } = req.body;
  try {
    const response = await axios.post(
      'https://translation.googleapis.com/language/translate/v2',
      null,
      {
        params: {
          q: text,
          target: target,
          key: process.env.GOOGLE_API_KEY,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error("Translation error:", error);
    res.status(500).json({ error: "Translation failed" });
  }
};
export default {
  register,
  login,
  adminLogin,
  editProfilePic,
  userById,
  getTotalUsers,
  editUserProfile,
  translatePage,
};
