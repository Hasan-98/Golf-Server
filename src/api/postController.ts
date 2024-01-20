import { RequestHandler } from "express";
import { models } from "../models/index"
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
            return res.status(404).json({ error: 'User not found' });
        }
        const userFolder = `user-${foundUser?.email}`;
        const mediaFiles = req.files;
        const mediaUrls = [];
        for (let i = 0; mediaFiles && Array.isArray(mediaFiles) && i < mediaFiles.length; i++) {
            const file = mediaFiles[i];
            const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

            if (!BUCKET_NAME) {
                throw new Error('AWS_BUCKET_NAME is not defined');
            }

            const type = file.mimetype?.split('/')[1];
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
        res.status(500).json({ error: 'Error creating post' });
    }
}

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
                    as: 'posts',
                    attributes: ['id', 'email' , 'nickName'],
                },
                {
                    model: models.Like,
                    as: 'PostLikes',
                },
                {
                    model: models.Comment,
                    as: 'PostComments',
                },
            ],
        });
        res.status(200).json({
            message: "Posts fetched successfully",
            posts,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching posts' });
    }
}
export const getPostById: RequestHandler = async (req, res, next) => {
    try {
        const { id } = req.params;
        const post = await models.Post.findOne({
            where: { id },
            include: [
                {
                    model: models.User,
                    as: 'posts',
                    attributes: ['id', 'email' , 'nickName'],
                },
                {
                    model: models.Like,
                    as: 'PostLikes',
                },
                {
                    model: models.Comment,
                    as: 'PostComments',
                },
            ],
        });
        res.status(200).json({
            message: "Post fetched successfully",
            post,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching post' });
    }
}

export default {
    createPost,
    getPosts,
    getPostById
}