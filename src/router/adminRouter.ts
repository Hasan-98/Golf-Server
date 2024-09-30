import express from "express";
import passport from "../auth/passport";
import multer from "multer";
const upload = multer();
import jwt from "jsonwebtoken";
import { models } from "../models/index";
const adminRouter = express.Router();
import {
  register,
  adminLogin,
  login,
  userById,
  getTotalUsers,
  editUserProfile,
  editProfilePic,
} from "../api/UserController";
import {
  addCategory,
  getAdminCategories,
  getAllCategories,
  assignCategoriesToUser,
  unassignCategoriesFromUser,
  updateCategory,
  deleteCategory,
} from "../api/categoryController";
import {
  createEvent,
  getAllEvents,
  getEventsColData,
  getEventById,
  markAsFavorite,
  getFavoriteEvents,
  joinEvent,
  getJoinedAndWaitList,
  approveJoinRequest,
  getJoinedEvents,
  getEventPlaces,
  getEventsByUserId,
  getEventPaymentDetails,
  deleteEventById,
  searchEventByName,
  updateEventById,
  getAllUserEvents,
  updateNotificationResponse,
  getEventPayment,
  setUpEventPayment,
  updateEventPayment,
  getTeacherPayment,
  setUpTeacherPayment,
  updateTeacherPayment,
  updateEventMedia,
  addEventCeremonyDetails,
  getCeremonyDetails,
} from "../api/eventController";
import {
  addComment,
  addLike,
  addPostComment,
  addPostLike,
  editComment,
  deleteComment,
} from "../api/communicationController";
import {
  becomeTeacher,
  updateTeacherProfile,
  updateProfile,
  getAllTeachers,
  getTeacherById,
  addGigs,
  deleteGig,
  getGigById,
  updateGig,
  getGigsByTeacher,
  getAllTeachersGigs,
  deleteSchedule,
  deleteShift,
  deleteTeacher,
} from "../api/teacherController";
import {
  bookAppointment,
  getTeacherBookedAppointments,
  getUserBookedAppointments,
  acceptAppointment,
  declineAppointment,
  favoriteTeacher,
  getFavoriteTeachers,
  updateAppointmentStatus,
  getTeacherAppointmentsCount,
  getNotifications,
} from "../api/appointmentController";
import {
  getAllTeams,
  updateTeamMember,
  deleteTeamMember,
  getTeamsByEvent,
  getTeamById,
} from "../api/teamController";
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getAllPosts,
  getMyPosts,
  getAllPostsOfUser,
  updatePostMedia,
} from "../api/postController";

import {
  getAllScoreCards,
  getScoreCardByEvent,
  getScoreCardByUser,
  addScoreCard,
  updateScoreCard,
} from "../api/scoreCardController";
const isAdmin = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "Authorization header is missing" });
  }
  const token = authHeader.split(" ")[1];
  let userId;
  try {
    const decoded: any = jwt.verify(token, "secret");
    userId = decoded.id;
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
  const user = await models.User.findOne({ where: { id: userId } });
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  if (user.role !== "admin") {
    return res.status(403).json({ error: "User is not an admin" });
  }
  next();
};
adminRouter.post("/login", login);
adminRouter.use(passport.authenticate("jwt", { session: false }), isAdmin);
adminRouter.get("/user/:id", userById);
adminRouter.get("/total-users", getTotalUsers);
//adminRouter.put("/edit-user-profile", editUserProfile);
//adminRouter.put("/edit-profile-pic", upload.single("image"), editProfilePic);
adminRouter.post("/register", register);
adminRouter.post("/create-event", upload.array("mediaFiles[]"), createEvent);
adminRouter.get("/get-all-events", getAllEvents);
adminRouter.get("/get-events-col-data", getEventsColData);
adminRouter.get("/get-event-by-id/:id", getEventById);
adminRouter.put("/mark-as-favorite", markAsFavorite);
adminRouter.get("/get-favorite-events", getFavoriteEvents);
adminRouter.put("/join-event", joinEvent);
adminRouter.get("/get-joined-and-wait-list", getJoinedAndWaitList);
adminRouter.put("/approve-join-request", approveJoinRequest);
adminRouter.get("/get-joined-events", getJoinedEvents);
adminRouter.get("/get-event-places", getEventPlaces);
adminRouter.get("/get-events-by-user-id", getEventsByUserId);
adminRouter.get("/get-event-payment-details", getEventPaymentDetails);
adminRouter.delete("/delete-event-by-id/:id", deleteEventById);
adminRouter.get("/search-event-by-name", searchEventByName);
// adminRouter.put(
//   "/update-event-by-id/:id",
//   upload.array("mediaFiles[]"),
//   updateEventById
// );
adminRouter.get("/get-all-user-events", getAllUserEvents);
adminRouter.put("/update-notification-response", updateNotificationResponse);
// adminRouter.put(
//   "/update-event-media",
//   upload.array("mediaFiles[]"),
//   updateEventMedia
// );
adminRouter.get("/get-event-payment", getEventPayment);
adminRouter.post("/set-up-event-payment", setUpEventPayment);
adminRouter.put("/update-event-payment", updateEventPayment);
adminRouter.get("/get-teacher-payment", getTeacherPayment);
adminRouter.post("/set-up-teacher-payment", setUpTeacherPayment);
adminRouter.put("/update-teacher-payment", updateTeacherPayment);
adminRouter.post("/add-event-ceremony-details",upload.array("mediaFiles[]"), addEventCeremonyDetails);
adminRouter.get("/get-ceremony-details/:id", getCeremonyDetails);

adminRouter.post("/add-comment", addComment);
adminRouter.post("/add-like", addLike);
adminRouter.post("/add-post-comment", addPostComment);
adminRouter.post("/add-post-like", addPostLike);
adminRouter.put("/edit-comment", editComment);
adminRouter.post("/add-score-card", addScoreCard);
adminRouter.delete("/delete-comment", deleteComment);
adminRouter.post("/become-teacher", becomeTeacher);
adminRouter.put("/update-teacher-profile", updateTeacherProfile);
adminRouter.put("/update-profile", updateProfile);
adminRouter.get("/get-all-teachers", getAllTeachers);
adminRouter.get("/get-teacher-by-id/:id", getTeacherById);
adminRouter.delete("/delete-teacher/:id", deleteTeacher);
adminRouter.post("/book-appointment", bookAppointment);
adminRouter.get(
  "/get-teacher-booked-appointments",
  getTeacherBookedAppointments
);
adminRouter.get("/get-user-booked-appointments", getUserBookedAppointments);
adminRouter.put("/accept-appointment", acceptAppointment);
adminRouter.put("/decline-appointment", declineAppointment);
adminRouter.put("/favorite-teacher", favoriteTeacher);
adminRouter.get("/get-favorite-teachers", getFavoriteTeachers);
adminRouter.put("/update-appointment-status", updateAppointmentStatus);
adminRouter.get("/get-teacher-appointments-count", getTeacherAppointmentsCount);
adminRouter.get("/get-notifications", getNotifications);
adminRouter.get("/get-all-teams", getAllTeams);
adminRouter.put("/update-team-member", updateTeamMember);
adminRouter.delete("/delete-team-member", deleteTeamMember);
adminRouter.get("/get-teams-by-event", getTeamsByEvent);
adminRouter.get("/get-team-by-id/:id", getTeamById);
adminRouter.post("/create-post", upload.array("mediaFiles[]"), createPost);
adminRouter.get("/get-posts", getPosts);
adminRouter.get("/get-post-by-id/:id", getPostById);
//adminRouter.put("/update-post/:id", upload.array("mediaFiles"), updatePost);
adminRouter.delete("/delete-post/:id", deletePost);
adminRouter.get("/get-all-posts", getAllPosts);
adminRouter.get("/get-my-posts", getMyPosts);
adminRouter.get("/get-all-posts-of-user", getAllPostsOfUser);
adminRouter.put(
  "/update-post-media",
  upload.array("mediaFiles[]"),
  updatePostMedia
);
adminRouter.get("/get-all-score-cards", getAllScoreCards);
adminRouter.get("/get-score-card-by-event", getScoreCardByEvent);
adminRouter.get("/get-score-card-by-user", getScoreCardByUser);
adminRouter.post("/add-score-card", addScoreCard);
adminRouter.put("/update-score-card", updateScoreCard);
adminRouter.delete("/delete-gig/:id", deleteGig);
adminRouter.delete("/delete-schedule", deleteSchedule);
adminRouter.delete("/delete-shift", deleteShift);
adminRouter.post("/add-gigs", upload.array("mediaFiles[]"), addGigs);
adminRouter.put("/update-gig/:id", upload.array("mediaFiles[]"), updateGig);
adminRouter.get("/get-gigs-by-teacher/:id", getGigsByTeacher);
adminRouter.get("/get-all-teachers-gigs", getAllTeachersGigs);
adminRouter.get("/get-gig-by-id/:id", getGigById);

adminRouter.post("/add-category", addCategory);
adminRouter.get("/get-admin-categories", getAdminCategories);
adminRouter.get("/get-all-categories", getAllCategories);
adminRouter.put("/assign-categories-to-user/:id", assignCategoriesToUser);
adminRouter.put("/unassign-categories-from-user/:id", unassignCategoriesFromUser);
adminRouter.delete("/delete-category/:id", deleteCategory);
adminRouter.put("/update-category/:id", updateCategory);

export default adminRouter;
