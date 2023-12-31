import { RequestHandler } from "express";
import { models } from "../models/index"

export const bookAppointment: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { scheduleId, day, startTime, endTime } = req.body;

        const existingStudent = await models.User.findOne({
            where: { id: userId },
        });

        if (existingStudent) {
            const isSlotAvailable = await models.Shifts.findOne({
                where: {
                    scheduleId,
                    day,
                    startTime,
                    endTime,
                    isBooked: false,
                },
            });

            if (isSlotAvailable) {
                const isAlreadyBooked = await models.Shifts.findOne({
                    where: {
                        scheduleId,
                        day,
                        startTime,
                        endTime,
                        isBooked: true,
                        bookedBy: userId,
                        status: ['active', 'booked'],
                    },
                });


                if (isAlreadyBooked) {
                    res.status(400).json({ success: false, error: 'Shift is already booked' });
                } else {
                    await models.Shifts.update(
                        { isBooked: true, bookedBy: userId, status: 'active' },
                        {
                            where: {
                                scheduleId,
                                day,
                                startTime,
                                endTime,
                                isBooked: false,
                            },
                        }
                    );

                    const bookedUserDetails = await models.User.findOne({
                        where: {
                            id: userId,
                        },
                    });
                    const schedule = await models.Schedules.findOne({
                        where: {
                            id: scheduleId,
                        },
                    });

                    const teacherId = schedule?.teacherId;

                    const io = req.app.get('io');
                    io.emit('appointmentBooked', { teacherId, appointment: { schedule, day, startTime, endTime, student: bookedUserDetails } });
                    //io.disconnect();

                    res.status(200).json({
                        message: 'Appointment booked successfully',
                        bookedUser: bookedUserDetails?.nickName,
                    });
                }
            } else {
                res.status(400).json({ success: false, error: 'Selected time slot is not available' });
            }
        } else {
            res.status(404).json({ success: false, error: 'User is not a student' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error booking appointment' });
    }
}

export const getTeacherBookedAppointments: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const existingTeacher = await models.Teacher.findOne({ where: { userId } });

        if (existingTeacher) {
            const bookedAppointments = await models.Shifts.findAll({
                where: {
                    isBooked: true,
                    status: 'active',
                },
                include: [
                    {
                        model: models.User,
                        as: 'bookedShifts',
                        attributes: ['nickName', 'email'],
                    },
                    {
                        model: models.Schedules,
                        where: { teacherId: existingTeacher.id },
                        attributes: [],
                    },
                ],
            });

            res.status(200).json({ bookedAppointments });
        } else {
            res.status(404).json({ success: false, error: 'User is not a teacher' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error getting teacher booked appointments' });
    }
}

export const getUserBookedAppointments: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const existingUser = await models.Teacher.findOne({ where: { userId } });
        if (existingUser) {
            const bookedAppointments = await models.Shifts.findAll({
                where: {
                    isBooked: true,
                    bookedBy: userId,
                    status: 'active',
                },
                include: [
                    {
                        model: models.User,
                        as: 'bookedShifts',
                        attributes: ['nickName', 'email'],
                    },
                ],
            });

            res.status(200).json({ bookedAppointments });
        } else {
            res.status(404).json({ success: false, error: 'User is not a student' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error getting user booked appointments' });
    }
}

export const acceptAppointment: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { scheduleId, day, startTime, endTime , status} = req.body;

        const existingTeacher = await models.Teacher.findOne({
            where: { userId },
        });

        if (existingTeacher) {
            const isSlotAvailable = await models.Shifts.findOne({
                where: {
                    scheduleId,
                    day,
                    startTime,
                    endTime,
                    isBooked: true,
                    bookedBy: userId,
                    status: 'active',
                },
            });

            if (isSlotAvailable) {
                await models.Shifts.update(
                    { status: status },
                    {
                        where: {
                            scheduleId,
                            day,
                            startTime,
                            endTime,
                            isBooked: true,
                            bookedBy: userId,
                            status: 'active',
                        },
                    }
                );

                res.status(200).json({
                    message: 'Appointment accepted successfully',
                });
            } else {
                res.status(400).json({ success: false, error: 'Selected time slot is not available' });
            }
        } else {
            res.status(404).json({ success: false, error: 'User is not a teacher' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error accepting appointment' });
    }
}

export const favoriteTeacher: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { teacherId } = req.body;

        const existingUser = await models.User.findOne({
            where: { id: userId },
        });

        const existingTeacher = await models.Teacher.findOne({
            where: { id: teacherId },
        });

        if (existingUser && existingTeacher) {
            await models.Favorite.create({
                userId: userId,
                teacherId: teacherId,
            });

            res.status(200).json({
                message: 'Teacher marked as favorite successfully',
            });
        } else {
            res.status(400).json({ success: false, error: 'User or teacher not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error marking teacher as favorite' });
    }
}

export const getFavoriteTeachers: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const existingUser = await models.User.findOne({
            where: { id: userId },
        });

        if (existingUser) {
            const favoriteTeachers = await models.Favorite.findAll({
                where: {
                    userId: userId,
                },
                include: [
                    {
                        model: models.Teacher,
                        as: 'favoritedByUsers',
                        attributes: ['firstName', 'lastName'],
                    },
                ],
            });

            res.status(200).json({ favoriteTeachers });
        } else {
            res.status(400).json({ success: false, error: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Error getting favorite teachers' });
    }
}


export default {
    bookAppointment,
    getTeacherBookedAppointments,
    getUserBookedAppointments,
    acceptAppointment,
    favoriteTeacher,
    getFavoriteTeachers,
}