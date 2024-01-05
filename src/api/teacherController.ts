import { RequestHandler } from "express";
import { models } from "../models/index"

export const becomeTeacher: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { firstName, lastName, phoneNumber, aboutMyself, location, schedules } = req.body;

        const teacher = await models.Teacher.create({
            userId,
            firstName,
            lastName,
            phoneNumber,
            aboutMyself,
            location
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


export const updateProfile: RequestHandler = async (req: any, res: any, next: any) => {
    try {

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error updating the profle' });
    }
}

export const getAllTeachers: RequestHandler = async (req: any, res: any, next: any) => {
    try {

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: 'Error Getting All Teachers' });
    }
}


export default {
    becomeTeacher,
    updateProfile,
    getAllTeachers
}