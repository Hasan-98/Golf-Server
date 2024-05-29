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
    const { firstName, movieUrl, portfolioUrl } = req.body;
    const userFolder = `teacher-${firstName}`;
    const { profileImage, introductionVideo } = req.files;
    const portfolioVideos = req.files["portfolioVideo[]"];

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

      let profileImagePath, introductionVideoPath;
      const portfolioVideoPaths: any = [];

      // Upload profile image if it exists
      if (profileImage && profileImage.length > 0) {
        profileImagePath = await uploadFile(profileImage[0], "profile");
      }

      // Upload introduction video if it exists
      if (introductionVideo && introductionVideo.length > 0) {
        introductionVideoPath = await uploadFile(
          introductionVideo[0],
          "introduction"
        );
      }

      // Upload portfolio videos if they exist
      if (portfolioVideos && portfolioVideos.length > 0) {
        for (let i = 0; i < portfolioVideos.length; i++) {
          const portfolioVideoPath = await uploadFile(
            portfolioVideos[i],
            `portfolio${i + 1}`
          );
          portfolioVideoPaths.push(portfolioVideoPath);
        }
      }

      // Build the update object
      const updateObject: any = {};

      if (movieUrl !== undefined) {
        updateObject.movieUrl = movieUrl;
      }

      if (portfolioUrl !== undefined) {
        updateObject.portfolioUrl = portfolioUrl;
      }

      if (profileImagePath !== undefined) {
        updateObject.profileImage = profileImagePath;
      }

      if (portfolioVideoPaths.length > 0) {
        updateObject.portfolioVideo = portfolioVideoPaths.join(",");
      }

      if (introductionVideoPath !== undefined) {
        updateObject.introductionVideo = introductionVideoPath;
      }

      // Update the teacher record with the file paths
      const updatedTeacher = await existingTeacher.update(updateObject);

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
    const {
      page,
      pageSize,
      rating,
      location,
      availability,
      search,
      status,
      level,
    } = req.query;

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

      const existingSchedules = await models.Schedules.findAll({
        where: { teacherId: existingTeacher.id },
      });
      const existingScheduleIds = existingSchedules.map(
        (schedule) => schedule.id
      );

      for (const schedule of schedules) {
        let scheduleId;
        if (schedule.id && existingScheduleIds.includes(schedule.id)) {
          // Update existing schedule
          await models.Schedules.update(
            {
              startDate: schedule.startDate,
              endDate: schedule.endDate,
            },
            {
              where: { id: schedule.id },
            }
          );
          scheduleId = schedule.id;
        } else {
          // Insert new schedule
          const newSchedule = await models.Schedules.create({
            teacherId: existingTeacher.id,
            startDate: schedule.startDate,
            endDate: schedule.endDate,
          });
          scheduleId = newSchedule.id;
        }

        const existingShifts = await models.Shifts.findAll({
          where: { scheduleId },
        });
        const existingShiftIds = existingShifts.map((shift) => shift.id);

        for (const shift of schedule.shifts) {
          if (shift.id && existingShiftIds.includes(shift.id)) {
            // Update existing shift
            await models.Shifts.update(
              {
                day: shift.day,
                startTime: shift.startTime,
                endTime: shift.endTime,
              },
              {
                where: { id: shift.id },
              }
            );
          } else {
            // Insert new shift
            await models.Shifts.create({
              scheduleId,
              day: shift.day,
              startTime: shift.startTime,
              endTime: shift.endTime,
            });
          }
        }
      }

      // Delete schedules and shifts that were removed by the user
      const newScheduleIds = (schedules as { id: number }[]).map(
        (schedule) => schedule.id
      );
      const schedulesToDelete = existingSchedules.filter(
        (schedule) => !newScheduleIds.includes(schedule.id)
      );
      for (const schedule of schedulesToDelete) {
        await models.Schedules.destroy({ where: { id: schedule.id } });
        await models.Shifts.destroy({ where: { scheduleId: schedule.id } });
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

export const deleteTeacher: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const existingTeacher = await models.Teacher.findOne({ where: { userId } });

    if (!existingTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    await models.Teacher.destroy({ where: { userId } });
    return res.status(200).json({ message: "Teacher deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error deleting teacher" });
  }
};

export const deleteShift: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { shiftId } = req.body;
    const userId = req.user.id; // Assuming user id is available in req.user

    const teacher = await models.Teacher.findOne({ where: { userId: userId } });

    if (!teacher) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const shift = await models.Shifts.findOne({
      where: { id: shiftId },
      include: [
        {
          model: models.Schedules,
          as: "schedule",
          where: { teacherId: teacher.id },
        },
      ],
    });

    if (!shift) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const deletedRows = await models.Shifts.destroy({ where: { id: shiftId } });

    if (deletedRows > 0) {
      res.status(200).json({ message: "Shift deleted successfully" });
    } else {
      return res.status(404).json({ error: "Shift not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error deleting shift" });
  }
};
export const deleteSchedule: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { scheduleId } = req.body;
    const userId = req.user.id; // Assuming user id is available in req.user

    const teacher = await models.Teacher.findOne({ where: { userId: userId } });

    if (!teacher) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const schedule = await models.Schedules.findOne({
      where: { id: scheduleId },
    });

    if (!schedule || schedule.teacherId !== teacher.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const deletedRows = await models.Schedules.destroy({
      where: { id: scheduleId },
    });

    if (deletedRows > 0) {
      res.status(200).json({ message: "Schedule deleted successfully" });
    } else {
      return res.status(404).json({ error: "Schedule not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error deleting schedule" });
  }
};

export const addGigs: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { title, description, price } = req.body;

    const existingTeacher = await models.Teacher.findOne({ where: { userId } });
    if (!existingTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherGigs = await models.Gigs.findAll({
      where: { teacherId: existingTeacher.id },
    });
    if (teacherGigs.length >= 5) {
      return res.status(400).json({
        error: "Gigs Limit Exceeded. You can only have a maximum of 5 gigs",
      });
    }

    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    if (!BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME is not defined");
    }

    const userFolder = `user-${userId.email}`;
    const mediaFiles = req.files;
    const imageUrls = [];

    for (
      let i = 0;
      mediaFiles && Array.isArray(mediaFiles) && i < mediaFiles.length;
      i++
    ) {
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
      imageUrl: imageUrls.join(","),
    });

    return res
      .status(201)
      .json({ message: "Gig added successfully", gig: newGig });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error adding gigs" });
  }
};

export const getGigsByTeacher: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { id } = req.params;
    const existingTeacher = await models.Teacher.findOne({ where: { id } });
    if (!existingTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherGigs = await models.Gigs.findAndCountAll({
      where: { teacherId: existingTeacher.id },
    });
    return res
      .status(200)
      .json({ gigs: teacherGigs.rows, count: teacherGigs.count });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error fetching gigs" });
  }
};

export const deleteGig: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const existingTeacher = await models.Teacher.findOne({ where: { userId } });
    if (!existingTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const gig = await models.Gigs.findOne({
      where: { id, teacherId: existingTeacher.id },
    });
    if (!gig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    await models.Gigs.destroy({ where: { id } });
    return res.status(200).json({ message: "Gig deleted successfully" });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error deleting gig" });
  }
};

export const updateGig: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, price } = req.body;

    const existingTeacher = await models.Teacher.findOne({ where: { userId } });
    if (!existingTeacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }

    const teacherGigs = await models.Gigs.findAll({
      where: { teacherId: existingTeacher.id },
    });
    if (teacherGigs.length > 5) {
      return res.status(400).json({
        error: "Gigs Limit Exceeded. You can only have a maximum of 5 gigs",
      });
    }

    const existingGig = await models.Gigs.findOne({ where: { id } });
    if (!existingGig) {
      return res.status(404).json({ error: "Gig not found" });
    }

    const BUCKET_NAME = process.env.AWS_BUCKET_NAME;
    if (!BUCKET_NAME) {
      throw new Error("AWS_BUCKET_NAME is not defined");
    }

    const userFolder = `user-${userId.email}`;
    const mediaFiles = req.files;
    let imageUrls = existingGig.imageUrl.split(",");

    if (mediaFiles && Array.isArray(mediaFiles) && mediaFiles.length > 0) {
      imageUrls = [];

      for (let i = 0; i < mediaFiles.length; i++) {
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
    }

    await models.Gigs.update(
      {
        title,
        description,
        price,
        imageUrl: imageUrls.join(","),
      },
      {
        where: { id },
      }
    );

    const updatedGig = await models.Gigs.findOne({ where: { id } });

    return res
      .status(200)
      .json({ message: "Gig updated successfully", gig: updatedGig });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error updating gig" });
  }
};

export const getAllTeachersGigs: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const teachers = await models.Teacher.findAll({
      include: [
        {
          model: models.Gigs,
          as: "teacherGigs",
          required: true,
        },
      ],
    });

    if (!teachers) {
      return res.status(404).json({ error: "No teachers found" });
    }

    return res.status(200).json({ teachers });
  } catch (err) {
    console.error("Error:", err);
    return res
      .status(500)
      .json({ error: "Cannot get teachers and their gigs at the moment" });
  }
};
export default {
  becomeTeacher,
  updateProfile,
  getTeacherById,
  getAllTeachers,
  updateTeacherProfile,
  addGigs,
  deleteTeacher,
  deleteGig,
  updateGig,
  getGigsByTeacher,
  getAllTeachersGigs,
  deleteShift,
  deleteSchedule,
};
