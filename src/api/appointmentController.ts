import { RequestHandler } from "express";
import { models } from "../models/index"

export const bookAppointment: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { teacherId, scheduleId, day, startTime, endTime } = req.body;

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
            console.log('isSlotAvailable', JSON.parse(JSON.stringify(isSlotAvailable)));

            if (isSlotAvailable) {
                const isAlreadyBooked = await models.Shifts.findOne({
                    where: {
                        scheduleId,
                        day,
                        startTime,
                        endTime,
                        isBooked: true,
                        bookedBy: userId,
                        status: 'booked',
                    },
                });

                console.log('isAlreadyBooked', JSON.parse(JSON.stringify(isAlreadyBooked)));
                if (isAlreadyBooked) {
                    res.status(400).json({ success: false, error: 'Shift is already booked' });
                } else {
                    await models.Shifts.update(
                        { isBooked: true, bookedBy: userId },
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

                    console.log('bookedUserDetails', JSON.parse(JSON.stringify(bookedUserDetails)));
                    res.status(200).json({
                        success: true,
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


export default {
    bookAppointment
}