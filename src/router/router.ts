// router.ts

import express, { Router } from "express";
import {
  register,
  login,
  userById,
  getTotalUsers,
  editUserProfile,
  editProfilePic,
} from "../api/UserController";
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
  updateEventMedia,
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
  deleteTeacher,
} from "../api/teacherController";
import {
  bookAppointment,
  getTeacherBookedAppointments,
  getUserBookedAppointments,
  acceptAppointment,
  favoriteTeacher,
  getFavoriteTeachers,
  updateAppointmentStatus,
  getTeacherAppointmentsCount,
  getNotifications,
} from "../api/appointmentController";
import {
  getAllTeams,
  updateTeamMember,
  getTeamsByEvent,
  getTeamById,
} from "../api/teamController";
import multer from "multer";
const upload = multer();
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getAllPosts,
  getMyPosts,
  getAllPostsOfUser,
  updatePostMedia
} from "../api/postController";

import {
  getAllScoreCards,
  getScoreCardByEvent,
  getScoreCardByUser,
  addScoreCard,
  updateScoreCard,
} from "../api/scoreCardController";

import passport from "../auth/passport";
const router: Router = express.Router();

router.post("/register", upload.single("image"), register);
router.post("/login", login);
router.get(
  "/user/:id",
  passport.authenticate("jwt", { session: false }),
  userById
);
router.post(
  "/createEvent",
  passport.authenticate("jwt", { session: false }),
  upload.array("files[]"),
  createEvent
);
router.put(
  "/update-event-media",
  passport.authenticate("jwt", { session: false }),
  upload.array("mediaFiles"),
  updateEventMedia
);
router.delete(
  "/delete-teacher",
  passport.authenticate("jwt", { session: false }),
  deleteTeacher
);
router.post(
  "/add-gigs",
  passport.authenticate("jwt", { session: false }),
  upload.array("mediaFiles"),
  addGigs
);
router.get(
  "/get-total-users",
  passport.authenticate("jwt", { session: false }),
  getTotalUsers
);

router.get(
  "/get-user-all-events/:id",
  passport.authenticate("jwt", { session: false }),
  getAllUserEvents
);
router.put(
  "/update-notification-response",
  passport.authenticate("jwt", { session: false }),
  updateNotificationResponse
);
router.put(
  "/approve-join-request",
  passport.authenticate("jwt", { session: false }),
  approveJoinRequest
);
router.get(
  "/search-event-by-name",
  passport.authenticate("jwt", { session: false }),
  searchEventByName
);
router.get(
  "/get-joined-and-wait-list/:id",
  passport.authenticate("jwt", { session: false }),
  getJoinedAndWaitList
);
router.put(
  "/edit-user-profile/:id",
  passport.authenticate("jwt", { session: false }),
  editUserProfile
);
router.put(
  "/edit-profile-pic/:id",
  passport.authenticate("jwt", { session: false }),
  upload.single("image"),
  editProfilePic
);
router.get(
  "/get-all-posts",
  passport.authenticate("jwt", { session: false }),
  getAllPosts
);

router.get("/get-public-all-posts", getAllPosts);
router.get(
  "/get-my-posts",
  passport.authenticate("jwt", { session: false }),
  getMyPosts
);
router.get(
  '/get-user-all-posts/:id',
  passport.authenticate("jwt", { session: false }),
  getAllPostsOfUser
)
router.get(
  "/getAllEvents",
  passport.authenticate("jwt", { session: false }),
  getAllEvents
);
router.delete(
  "/delete-event-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  deleteEventById
);
router.put(
  "/update-event-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  upload.array("files[]"),
  updateEventById
);
router.get(
  "/get-event-col-data",
  passport.authenticate("jwt", { session: false }),
  getEventsColData
);
router.get(
  "/get-event-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  getEventById
);
router.get("/get-public-event-by-id/:id", getEventById);
router.patch(
  "/is-favourite-event/:id",
  passport.authenticate("jwt", { session: false }),
  markAsFavorite
);
router.get(
  "/get-favourite-events",
  passport.authenticate("jwt", { session: false }),
  getFavoriteEvents
);
router.get("/get-public-events", getAllEvents);
router.get("/get-all-teachers-public", getAllTeachers);
router.get("/get-public-posts", getPosts);
router.get(
  "/get-public-teacher-appointments-count",
  getTeacherAppointmentsCount
);
router.post(
  "/join-event/:id",
  passport.authenticate("jwt", { session: false }),
  joinEvent
);
router.get(
  "/get-joined-events",
  passport.authenticate("jwt", { session: false }),
  getJoinedEvents
);
router.post(
  "/add-comment",
  passport.authenticate("jwt", { session: false }),
  addComment
);
router.post(
  "/add-like",
  passport.authenticate("jwt", { session: false }),
  addLike
);
router.post(
  "/become-teacher",
  passport.authenticate("jwt", { session: false }),
  becomeTeacher
);
router.put(
  "/update-teacher-profile",
  passport.authenticate("jwt", { session: false }),
  upload.fields([
    { name: "profileImage", maxCount: 1 },
    { name: "portfolioVideo", maxCount: 5 },
    { name: "introductionVideo", maxCount: 1 },
  ]),
  updateTeacherProfile
);
router.get(
  "/get-all-teachers",
  passport.authenticate("jwt", { session: false }),
  getAllTeachers
);
router.get(
  "/get-teacher-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  getTeacherById
);
router.put(
  "/update-profile",
  passport.authenticate("jwt", { session: false }),
  updateProfile
);

router.get(
  "/get-notifications",
  passport.authenticate("jwt", { session: false }),
  getNotifications
);
router.post(
  "/book-appointment",
  passport.authenticate("jwt", { session: false }),
  bookAppointment
);
router.get(
  "/get-teacher-booked-appointments",
  passport.authenticate("jwt", { session: false }),
  getTeacherBookedAppointments
);
router.get(
  "/get-user-booked-appointments",
  passport.authenticate("jwt", { session: false }),
  getUserBookedAppointments
);
router.post(
  "/accept-appointment",
  passport.authenticate("jwt", { session: false }),
  acceptAppointment
);
router.put(
  "/update-appointment-status",
  passport.authenticate("jwt", { session: false }),
  updateAppointmentStatus
);
router.get(
  "/get-teacher-appointments-count",
  passport.authenticate("jwt", { session: false }),
  getTeacherAppointmentsCount
);
router.post(
  "/favorite-teacher",
  passport.authenticate("jwt", { session: false }),
  favoriteTeacher
);
router.get(
  "/get-favorite-teachers",
  passport.authenticate("jwt", { session: false }),
  getFavoriteTeachers
);
router.post(
  "/create-post",
  upload.array("mediaFiles"),
  passport.authenticate("jwt", { session: false }),
  createPost
);
router.put(
  "/update-post-media",
  passport.authenticate("jwt", { session: false }),
  upload.array("mediaFiles"),
  updatePostMedia
);
router.put(
  "/update-post/:id",
  upload.array("mediaFiles"),
  passport.authenticate("jwt", { session: false }),
  updatePost
);
router.delete(
  "/delete-post/:id",
  passport.authenticate("jwt", { session: false }),
  deletePost
);
router.get(
  "/get-posts",
  passport.authenticate("jwt", { session: false }),
  getPosts
);
router.get(
  "/get-post-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  getPostById
);
router.post(
  "/add-post-comment",
  passport.authenticate("jwt", { session: false }),
  addPostComment
);
router.post(
  "/add-post-like",
  passport.authenticate("jwt", { session: false }),
  addPostLike
);
router.put(
  "/edit-comment",
  passport.authenticate("jwt", { session: false }),
  editComment
);

router.delete(
  "/delete-comment/:id",
  passport.authenticate("jwt", { session: false }),
  deleteComment
);
router.get(
  "/get-event-places",
  passport.authenticate("jwt", { session: false }),
  getEventPlaces
);
router.get("/get-public-event-places", getEventPlaces);
router.get(
  "/get-events-by-user-id",
  passport.authenticate("jwt", { session: false }),
  getEventsByUserId
);
router.get(
  "/get-event-payment-details/:id",
  passport.authenticate("jwt", { session: false }),
  getEventPaymentDetails
);
router.get("/get-public-all-teams", getAllTeams);
router.get(
  "/get-all-teams",
  passport.authenticate("jwt", { session: false }),
  getAllTeams
);
router.put(
  "/update-team-member",
  passport.authenticate("jwt", { session: false }),
  updateTeamMember
);

router.get(
  "/get-teams-by-id/:id",
  passport.authenticate("jwt", { session: false }),
  getTeamById
);
router.get(
  "/get-teams-by-event/:id",
  passport.authenticate("jwt", { session: false }),
  getTeamsByEvent
);
router.get("/get-public-teams-by-event/:id", getTeamsByEvent);

router.post(
  "/add-score-card",
  passport.authenticate("jwt", { session: false }),
  addScoreCard
);
router.get(
  "/get-all-score-cards",
  passport.authenticate("jwt", { session: false }),
  getAllScoreCards
);
router.get(
  "/get-all-public-score-cards",
  getAllScoreCards
);
router.get(
  "/get-score-card-by-event/:id",
  passport.authenticate("jwt", { session: false }),
  getScoreCardByEvent
);
router.get(
  "/get-score-card-by-user/:id",
  passport.authenticate("jwt", { session: false }),
  getScoreCardByUser
);
router.get(
  "/get-public-score-card-by-event/:id",
  getScoreCardByEvent
);
router.get(
  "/get-public-score-card-by-user/:id",
  getScoreCardByUser
);

router.put(
  "/update-score-card/:id",
  passport.authenticate("jwt", { session: false }),
  updateScoreCard
);
export default router;
