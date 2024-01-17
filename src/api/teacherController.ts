import { RequestHandler } from "express";
import { models } from "../models/index"
import { Op } from 'sequelize';

export const becomeTeacher: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phoneNumber, aboutMyself, location, hourlyRate, schedules } = req.body;

        const teacher = await models.Teacher.create({
            userId,
            firstName,
            lastName,
            phoneNumber,
            aboutMyself,
            location,
            hourlyRate
        });

        const shiftsToCreate: any = [];

        for (const schedule of schedules) {
            const createdSchedule = await models.Schedules.create({
                teacherId: teacher.id,
                startDate: schedule.startDate,
                endDate: schedule.endDate
            });

            for (const shift of schedule.shifts) {
                shiftsToCreate.push({
                    scheduleId: createdSchedule.id,
                    day: shift.day,
                    startTime: shift.startTime,
                    endTime: shift.endTime
                });
            }
        }

        await models.Shifts.bulkCreate(shiftsToCreate);

        res.status(201).json({
            message: 'Teacher created successfully',
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
        res.status(500).json({ error: 'Error creating teacher' });
    }
};


export const getTeacherById: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const { id } = req.params;

        const teacher = await models.Teacher.findByPk(id, {
            include: [
                {
                    model: models.Schedules,
                    as: 'schedules',
                    include: [
                        {
                            model: models.Shifts,
                            as: 'shifts',
                        },
                    ],
                },
            ],
        });

        if (!teacher) {
            return res.status(404).json({ error: 'Teacher not found' });
        }

        res.status(200).json({
            teacher,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching teacher' });
    }
};
export const getAllTeachers: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const { page, pageSize, rating, location, availability, search, status } = req.query;

        const offset = (parseInt(page as string) - 1) * parseInt(pageSize as string);

        const whereClause = {
            ...(rating && { rating: { [Op.gte]: rating } }),
            ...(location && { location }),
            ...(search && {
                [Op.or]: [
                    { firstName: { [Op.like]: `%${search}%` } },
                    { lastName: { [Op.like]: `%${search}%` } },
                ],
            }),
        };

        const teachers = await models.Teacher.findAll({
            where: whereClause,
            include: [
                {
                    model: models.Schedules,
                    as: 'schedules',
                    include: [
                        {
                            model: models.Shifts,
                            as: 'shifts',
                            where: {
                                ...(availability === 'true' ? { isBooked: false } : undefined),
                                ...(status && { status }),
                            },
                            required: true
                        },
                    ],
                },
            ],
            limit: parseInt(pageSize as string),
            offset: offset,
        });

        res.status(200).json({ teachers, count: teachers.length });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error Getting All Teachers' });
    }
};
export const updateProfile: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phoneNumber, aboutMyself, location, schedules } = req.body;
        const existingTeacher = await models.Teacher.findOne({ where: { userId } });

        if (existingTeacher) {
            // Update teacher's profile
            await models.Teacher.update(
                {
                    firstName,
                    lastName,
                    phoneNumber,
                    aboutMyself,
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
                        fields: ['startDate', 'endDate'],
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
                            fields: ['day', 'startTime', 'endTime'],
                        }
                    );
                }
            }

            res.status(200).json({ message: 'Profile updated successfully' });
        } else {
            return res.status(404).json({ error: 'User is not a teacher' });
        }
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error updating the profile' });
    }
};


export default {
    becomeTeacher,
    updateProfile,
    getTeacherById,
    getAllTeachers
}