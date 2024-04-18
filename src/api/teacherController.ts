import { RequestHandler } from "express";
import { models } from "../models/index";
import { Op } from "sequelize";

import AWS from "aws-sdk";
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

export const updateTeacherProfile: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { firstName } = req.body;
    const userFolder = `teacher-${firstName}`;
    const { profileImage, introductionVideo } = req.files;
    const portfolioVideos = req.files['portfolioVideo'];

    // Find the teacher record
    const existingTeacher = await models.Teacher.findOne({ where: { userId } });

    // Update the teacher record
    if (existingTeacher) {
      const BUCKET_NAME = process.env.AWS_BUCKET_NAME;

      if (!BUCKET_NAME) {
        throw new Error("AWS_BUCKET_NAME is not defined");
      }

      const uploadFile = async (file: Express.Multer.File, type: string) => {
        const fileType = file.mimetype?.split("/")[1];
        const name = `${userFolder}/${Date.now()}-${type}.${fileType}`;
        const params = {
          Bucket: BUCKET_NAME,
          Key: name,
          Body: file.buffer,
          ContentType: file.mimetype,
        };
        const uploadResult = await s3.upload(params).promise();
        return uploadResult.Location;
      };

      // Upload profile image
      const profileImagePath = await uploadFile(profileImage[0], 'profile');

      // Upload introduction video
      const introductionVideoPath = await uploadFile(introductionVideo[0], 'introduction');

      // Upload portfolio videos
      const portfolioVideoPaths: any = [];
      for (let i = 0; i < portfolioVideos.length; i++) {
        const portfolioVideoPath = await uploadFile(portfolioVideos[i], `portfolio${i + 1}`);
        portfolioVideoPaths.push(portfolioVideoPath);
      }

      // Update the teacher record with the file paths
      const updatedTeacher = await existingTeacher.update({
        profileImage: profileImagePath,
        portfolioVideo: portfolioVideoPaths.join(','),
        introductionVideo: introductionVideoPath,
      });

      res.status(201).json({
        message: "Teacher Profile Updated successfully",
        teacher: updatedTeacher,
      });
    } else {
      res.status(404).json({ error: "Teacher not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error updating teacher profile" });
  }
};


export const becomeTeacher: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phoneNumber,
      aboutMyself,
      location,
      hourlyRate,
      schedules,
      level,
    } = req.body;

    const teacher = await models.Teacher.create({
      userId,
      firstName,
      lastName,
      phoneNumber,
      aboutMyself,
      location,
      hourlyRate,
      level,
    });

    const shiftsToCreate: any = [];

    for (const schedule of schedules) {
      const createdSchedule = await models.Schedules.create({
        teacherId: teacher.id,
        startDate: schedule.startDate,
        endDate: schedule.endDate,
      });

      for (const shift of schedule.shifts) {
        shiftsToCreate.push({
          scheduleId: createdSchedule.id,
          day: shift.day,
          startTime: shift.startTime,
          endTime: shift.endTime,
        });
      }
    }

    await models.Shifts.bulkCreate(shiftsToCreate);

    res.status(201).json({
      message: "Teacher created successfully",
      teacher: {
        ...teacher.toJSON(),
        schedules: schedules.map((schedule: any) => ({
          ...schedule,
          shifts: schedule.shifts.map((shift: any) => ({ ...shift })),
        })),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error creating teacher" });
  }
};

export const getTeacherById: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { id } = req.params;

    const teacher = await models.Teacher.findByPk(id, {
      include: [
        {
          model: models.Schedules,
          as: "schedules",
          include: [
            {
              model: models.Shifts,
              as: "shifts",
            },
          ],
        },
      ],
    });

    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    res.status(200).json({
      teacher,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching teacher" });
  }
};
export const getAllTeachers: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { page, pageSize, rating, location, availability, search, status, level } =
      req.query;

    const offset =
      (parseInt(page as string) - 1) * parseInt(pageSize as string);

    const whereClause = {
      ...(rating && { rating: { [Op.gte]: rating } }),
      ...(location && { location: { [Op.like]: `%${location}` } }),
      ...(level && { level: { [Op.like]: `%${level}` } }),
      ...(search && {
        [Op.or]: [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
        ],
      }),
    };

    let teachers = await models.Teacher.findAll({
      where: whereClause,
      include: [
        {
          model: models.Schedules,
          as: "schedules",
          include: [
            {
              model: models.Shifts,
              as: "shifts",
              where: {
                ...(availability === "true" ? { isBooked: false } : undefined),
                ...(status && { status }),
              },
              required: true,
            },
          ],
        },
        {
          model: models.User,
          as: "teacher",
          attributes: ["imageUrl"],
        },
      ],
      limit: parseInt(pageSize as string),
      offset: offset,
    });
    teachers = JSON.parse(JSON.stringify(teachers));
    teachers = teachers.map((tech: any) => {
      const { teacher, ...rest } = tech;
      return {
        ...rest,
        imageUrl: teacher.imageUrl,
        schedules: tech.schedules.map((schedule: any) => ({
          ...schedule,
          shifts: schedule.shifts.map((shift: any) => ({ ...shift })),
        })),
      };
    });

    res.status(200).json({ teachers, count: teachers.length });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error Getting All Teachers" });
  }
};
export const updateProfile: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const {
      firstName,
      lastName,
      phoneNumber,
      aboutMyself,
      location,
      level,
      schedules,
    } = req.body;
    const existingTeacher = await models.Teacher.findOne({ where: { userId } });

    if (existingTeacher) {
      // Update teacher's profile
      await models.Teacher.update(
        {
          firstName,
          lastName,
          phoneNumber,
          aboutMyself,
          level,
          location,
        },
        {
          where: { userId },
        }
      );

      for (const schedule of schedules) {
        await models.Schedules.upsert(
          {
            teacherId: existingTeacher.id,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
          },
          {
            fields: ["startDate", "endDate"],
          }
        );

        for (const shift of schedule.shifts) {
          await models.Shifts.upsert(
            {
              scheduleId: existingTeacher.id,
              day: shift.day,
              startTime: shift.startTime,
              endTime: shift.endTime,
            },
            {
              fields: ["day", "startTime", "endTime"],
            }
          );
        }
      }

      res.status(200).json({ message: "Profile updated successfully" });
    } else {
      return res.status(404).json({ error: "User is not a teacher" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error updating the profile" });
  }
};

export const addGigs: RequestHandler = async (req: any, res: any, next: any) => {
  try {
    const userId = req.user.id;
    const { title, description, price } = req.body;

    const existingTeacher = await models.Teacher.findOne({ where: { userId } });
    if (!existingTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherGigs = await models.Gigs.findAll({ where: { teacherId: existingTeacher.id } });
    if (teacherGigs.length >= 5) {
      return res.status(400).json({ error: "Gigs Limit Exceeded. You can only have a maximum of 5 gigs" });
    }

    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    if (!BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME is not defined");
    }

    const userFolder = `user-${userId.email}`;
    const mediaFiles = req.files;
    const imageUrls = [];

    for (let i = 0; mediaFiles && Array.isArray(mediaFiles) && i < mediaFiles.length; i++) {
      const file = mediaFiles[i];
      const type = file.mimetype?.split("/")[1];
      const name = `${userFolder}/${Date.now()}-${i}.${type}`;
      const params = {
        Bucket: BUCKET_NAME,
        Key: name,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const { Location } = await s3.upload(params).promise();
      imageUrls.push(Location);
    }

    const newGig = await models.Gigs.create({
      teacherId: existingTeacher.id,
      title,
      description,
      price,
      imageUrl: imageUrls.join(',')
    });

    return res.status(201).json({ message: "Gig added successfully", gig: newGig });

  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error adding gigs" });
  }
}
export default {
  becomeTeacher,
  updateProfile,
  getTeacherById,
  getAllTeachers,
  updateTeacherProfile,
  addGigs,
};
