import { RequestHandler } from "express";
import { models } from "../models/index";
import { io } from "../index";
import { Op } from "sequelize";
export const bookAppointment: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { scheduleId, day, startTime, endTime, date} = req.body;

    const existingStudent = await models.User.findOne({
      where: { id: userId },
    });

    if (existingStudent) {
      const isSlotAvailable = await models.Shifts.findOne({
        where: {
          scheduleId,
          day,
          startTime,
          date,
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
            date,
            endTime,
            isBooked: true,
            bookedBy: userId,
            status: ["PENDING", "BOOKED"],
          },
        });

        if (isAlreadyBooked) {
          res
            .status(400)
            .json({ success: false, error: "Shift is already booked" });
        } else {
          await models.Shifts.update(
            { isBooked: true, bookedBy: userId, status: "PENDING" },
            {
              where: {
                scheduleId,
                day,
                date,
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
          io.emit("appointmentBooked", {
            teacherId,
            appointment: {
              schedule,
              day,
              date,
              startTime,
              endTime,
              student: bookedUserDetails,
            },
          });
          //          io.to(clientId).emit('appointmentBooked', { teacherId, appointment: { schedule, day, startTime, endTime, student: bookedUserDetails } });
          await models.Notification.create({
            userId: userId,
            teacherId: teacherId,
            message: `You have a new appointment request from ${bookedUserDetails?.nickName}`,
            isRead: false,
          });
          res.status(200).json({
            message: "Appointment booked successfully",
            bookedUser: bookedUserDetails?.nickName,
          });
        }
      } else {
        res.status(400).json({
          success: false,
          error: "Selected time slot is not available",
        });
      }
    } else {
      res.status(404).json({ success: false, error: "User is not a student" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error booking appointment" });
  }
};
export const acceptAppointment: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { scheduleId, day, startTime, endTime, status, date,  studentId, notificationId } = req.body;

    const existingTeacher = await models.Teacher.findOne({
      where: { userId },
    });

    if (existingTeacher) {
      const isSlotAvailable = await models.Shifts.findOne({
        where: {
          scheduleId,
          day,
          startTime,
          date,
          endTime,
          isBooked: true,
          bookedBy: studentId,
          status: "PENDING",
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
              date,
              endTime,
              isBooked: true,
              bookedBy: studentId,
              status: "PENDING",
            },
          }
        );
        io.emit("appointmentBooked", {
          studentId,
          appointment: {
            day,
            date,
            startTime,
            endTime,
            status,
          },
        });

        const existingNotification = await models.Notification.findOne({
          where: {
            id: notificationId
          },
        });

        if (existingNotification) {
          await existingNotification.update({
            message: `Your appointment request has been ${status}`,
            isRead: true,
          });
        }
        res.status(200).json({
          message: "Appointment accepted successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Selected time slot is not available",
        });
      }
    } else {
      res.status(404).json({ success: false, error: "User is not a teacher" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error accepting appointment" });
  }
};

export const declineAppointment: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { scheduleId, day, startTime, endTime, studentId,  date ,status, notificationId } = req.body;

    const existingTeacher = await models.Teacher.findOne({
      where: { userId },
    });

    if (existingTeacher) {
      const isSlotBooked = await models.Shifts.findOne({
        where: {
          scheduleId,
          day,
          date,
          startTime,
          endTime,
          isBooked: true,
          bookedBy: studentId,
          status: "PENDING",
        },
      });

      if (isSlotBooked) {
        await models.Shifts.update(
          { 
            status,
            isBooked: false,
            bookedBy: null || undefined
          },
          {
            where: {
              scheduleId,
              day,
              date,
              startTime,
              endTime,
              isBooked: true,
              bookedBy: studentId,
              status: "PENDING",
            },
          }
        );

        io.emit("appointmentDeclined", {
          studentId,
          appointment: {
            day,
            date,
            startTime,
            endTime,
            status,
          },
        });

        const existingNotification = await models.Notification.findOne({
          where: {
            id: notificationId
          },
        });

        if (existingNotification) {
          await existingNotification.update({
            message: `Your appointment request has been ${status}`,
            isRead: true,
          });
        }

        res.status(200).json({
          message: `Appointment ${status.toLowerCase()} successfully`,
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Selected time slot is not booked or already accepted",
        });
      }
    } else {
      res.status(404).json({ success: false, error: "User is not a teacher" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: `Error ${status.toLowerCase()} the appointment` });
  }
};


// get notifications for user or teacher
export const getNotifications: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const teacherId = req.query.teacherId;
    const eventId = req.query.eventId;
    const reservationId = req.query.reservationId;
    const organizerId = req.query.organizerId;
    const existingUser = await models.User.findOne({
      where: { id: userId },
    });

    if (existingUser) {
      const whereConditions: any[] = [];

      if (eventId) {
        whereConditions.push({ eventId: eventId });
      }
      if (teacherId) {
        whereConditions.push({ teacherId: teacherId });
      }
      if (reservationId) {
        whereConditions.push({ reservationId: reservationId });
      }
      if (organizerId) {
        whereConditions.push({ organizerId: organizerId });
      }
      if (userId) {
        whereConditions.push({ userId: userId });
      }

      const notifications = await models.Notification.findAll({
        where: {
          [Op.or]: whereConditions
        },
        include: [
          {
            model: models.User,
            attributes: ['id', 'nickname', 'imageUrl'],
          },
        ],
        order: [['updated_at', 'DESC']],
      });

      res.status(200).json({ notifications });
    } else {
      res.status(400).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error getting notifications" });
  }
};
export const getTeacherBookedAppointments: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const existingTeacher = await models.Teacher.findOne({ where: { userId } });

    if (existingTeacher) {
      const bookedAppointments = await models.Shifts.findAll({
        where: {
          isBooked: true,
          status: ["BOOKED", "PENDING", 'COMPLETED', 'DECLINED' , 'CANCELLED'],
        },
        include: [
          {
            model: models.User,
            as: "bookedShifts",
            attributes: ["nickName", "email", "imageUrl"],
          },
          {
            model: models.Schedules,
            where: { teacherId: existingTeacher.id },
            attributes: [],
          },
        ],
      });

      res
        .status(200)
        .json({ bookedAppointments, count: bookedAppointments.length });
    } else {
      res.status(404).json({ success: false, error: "User is not a teacher" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Error getting teacher booked appointments",
    });
  }
};

export const getUserBookedAppointments: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const existingUser = await models.User.findOne({ where: { id: userId } });
    if (existingUser) {
      const bookedAppointments = await models.Shifts.findAll({
        where: {
          isBooked: true,
          bookedBy: userId,
          status: ["BOOKED", "PENDING", 'COMPLETED', 'DECLINED' , 'CANCELLED'],
        },
        include: [
          {
            model: models.Schedules,
            include: [
              {
                model: models.Teacher,
                include: [
                  {
                    model: models.User,
                    as: "teacher",
                    attributes: ["nickName", "email", "imageUrl"],
                  },
                ],
              },
            ],
          },
        ],
      });

      res.status(200).json({ bookedAppointments });
    } else {
      res.status(404).json({ success: false, error: "User is not a student" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Error getting user booked appointments",
    });
  }
};

export const getUserReservedGigs: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const user = await models.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const reservedGigs = await models.Reservation.findAll({
      where: { userId: user.id },
      include: [
        {
          model: models.Teacher,
          as: "teacherReservations",
        },
        {
          model: models.Gigs,
          as: "gigReservations",
        },
      ],
    });

    return res.status(200).json({ reservedGigs });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Error fetching reserved gigs" });
  }
}

export const favoriteTeacher: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
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
        message: "Teacher marked as favorite successfully",
      });
    } else {
      res
        .status(400)
        .json({ success: false, error: "User or teacher not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error marking teacher as favorite" });
  }
};

export const feedbackTeacher: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { teacherId, rating, feedback } = req.body;

    const existingUser = await models.User.findOne({
      where: { id: userId },
    });

    const existingTeacher = await models.Teacher.findOne({
      where: { id: teacherId },
    });

    if (existingUser && existingTeacher) {
      await models.TeacherRating.create({
        userId: userId,
        teacherId: teacherId,
        rating: rating,
        feedback: feedback,
      });

      res.status(200).json({
        message: "Feedback submitted successfully",
      });
    } else {
      res
        .status(400)
        .json({ success: false, error: "User or teacher not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error submitting feedback" });
  }
}
export const updateAppointmentStatus: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const { scheduleId, day, startTime, endTime, date,   status } = req.body;

    const existingTeacher = await models.Teacher.findOne({
      where: { userId },
    });

    if (existingTeacher) {
      const isSlotAvailable = await models.Shifts.findOne({
        where: {
          scheduleId,
          day,
          date,
          startTime,
          endTime,
          isBooked: true,
          bookedBy: userId,
          status: "PENDING",
        },
      });

      if (isSlotAvailable) {
        await models.Shifts.update(
          { status: status },
          {
            where: {
              scheduleId,
              day,
              date,
              startTime,
              endTime,
              isBooked: true,
              bookedBy: userId,
              status: "PENDING",
            },
          }
        );

        res.status(200).json({
          message: "Appointment accepted successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          error: "Selected time slot is not available",
        });
      }
    } else {
      res.status(404).json({ success: false, error: "User is not a teacher" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error accepting appointment" });
  }
};

export const getTeacherAppointmentsCount: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
  try {
    const userId = req.user.id;
    const existingTeacher = await models.Teacher.findOne({ where: { userId } });

    if (existingTeacher) {
      const completedAppointments = await models.Shifts.count({
        where: {
          isBooked: true,
          status: "COMPLETED",
        },
        include: [
          {
            model: models.Schedules,
            where: { teacherId: existingTeacher.id },
            attributes: [],
          },
        ],
      });

      const upcomingAppointments = await models.Shifts.count({
        where: {
          isBooked: true,
          status: "BOOKED",
        },
        include: [
          {
            model: models.Schedules,
            where: {
              teacherId: existingTeacher.id,
              startDate: {
                [Op.gte]: new Date().toISOString(),
              },
            },
            attributes: [],
          },
        ],
      });

      const pendingAppointments = await models.Shifts.count({
        where: {
          isBooked: true,
          status: "PENDING",
        },
        include: [
          {
            model: models.Schedules,
            where: { teacherId: existingTeacher.id },
            attributes: [],
          },
        ],
      });

      res.status(200).json({
        completedAppointments,
        upcomingAppointments,
        pendingAppointments,
      });
    } else {
      res.status(404).json({ success: false, error: "User is not a teacher" });
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({
      success: false,
      error: "Error getting teacher appointments count",
    });
  }
};

export const completeAppointment: RequestHandler = async (req: any, res: any, next: any) => {
    try {
        const userId = req.user.id;
        const { scheduleId, day, startTime, endTime, date, status , rating} = req.body;

        const existingTeacher = await models.Teacher.findOne({
            where: { userId },
        });

        if (existingTeacher) {
            const isSlotAvailable = await models.Shifts.findOne({
                where: {
                    scheduleId,
                    day,
                    startTime,
                    date,
                    endTime,
                    isBooked: true,
                    bookedBy: userId,
                    status: 'BOOKED',
                },
            });

            if (isSlotAvailable) {
                await models.Shifts.update(
                    { status: status },
                    {
                        where: {
                            scheduleId,
                            day,
                            date,
                            startTime,
                            endTime,
                            isBooked: true,
                            bookedBy: userId,
                            status: 'BOOKED',
                        },
                    }
                );

                res.status(200).json({
                    message: 'Appointment Completed successfully',
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

export const getFavoriteTeachers: RequestHandler = async (
  req: any,
  res: any,
  next: any
) => {
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
            attributes: ["id", "firstName", "lastName"],
            include: [
              {
                model: models.User,
                as: "teacher",
                attributes: ["imageUrl"],
              },
            ],
          },
        ],
      });

      res.status(200).json({ favoriteTeachers });
    } else {
      res.status(400).json({ success: false, error: "User not found" });
    }
  } catch (error) {
    console.error("Error:", error);
    res
      .status(500)
      .json({ success: false, error: "Error getting favorite teachers" });
  }
};

export default {
  getNotifications,
  bookAppointment,
  declineAppointment,
  getTeacherBookedAppointments,
  getUserBookedAppointments,
  getUserReservedGigs,
  acceptAppointment,
  completeAppointment,
  favoriteTeacher,
  getFavoriteTeachers,
  updateAppointmentStatus,
  getTeacherAppointmentsCount,
  feedbackTeacher,
};
