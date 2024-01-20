// router.ts

import express, { Router } from 'express';
import { register, login, userById } from '../api/UserController';
import {
    createEvent, getAllEvents, getEventsColData,
    getEventById, markAsFavorite, getFavoriteEvents, joinEvent, getJoinedEvents, getPublicEvents,
    getEventPlaces, getEventsByUserId
} from '../api/eventController';
import { addComment, addLike, addPostComment, addPostLike } from '../api/communicationController';
import { becomeTeacher, updateProfile, getAllTeachers, getTeacherById } from '../api/teacherController';
import {
    bookAppointment, getTeacherBookedAppointments, getUserBookedAppointments, acceptAppointment,
    favoriteTeacher, getFavoriteTeachers, updateAppointmentStatus, getTeacherAppointmentsCount
} from '../api/appointmentController';
import multer from 'multer';

const upload = multer();
import {
    createPost,
    getPosts,
    getPostById
} from '../api/postController';
import passport from '../auth/passport';
const router: Router = express.Router();

router.post('/register', upload.single('image'), register);
router.post('/login', login)
router.get('/user/:id', passport.authenticate('jwt', { session: false }), userById)
router.post('/createEvent', passport.authenticate('jwt', { session: false }), upload.array('files'), createEvent);
router.get('/getAllEvents', passport.authenticate('jwt', { session: false }), getAllEvents)
router.get('/get-event-col-data', passport.authenticate('jwt', { session: false }), getEventsColData)
router.get('/get-event-by-id/:id', passport.authenticate('jwt', { session: false }), getEventById)
router.patch('/is-favourite-event/:id', passport.authenticate('jwt', { session: false }), markAsFavorite)
router.get('/get-favourite-events', passport.authenticate('jwt', { session: false }), getFavoriteEvents)
router.get('/get-public-events', getPublicEvents)
router.get('/get-all-teachers-public', getAllTeachers)
router.get('/get-public-posts', getPosts)
router.get('/get-public-teacher-appointments-count', getTeacherAppointmentsCount)
router.post('/join-event/:id', passport.authenticate('jwt', { session: false }), joinEvent)
router.get('/get-joined-events', passport.authenticate('jwt', { session: false }), getJoinedEvents)
router.post('/add-comment', passport.authenticate('jwt', { session: false }), addComment)
router.post('/add-like', passport.authenticate('jwt', { session: false }), addLike)
router.post('/become-teacher', passport.authenticate('jwt', { session: false }), becomeTeacher)
router.get('/get-all-teachers', passport.authenticate('jwt', { session: false }), getAllTeachers)
router.get('/get-teacher-by-id/:id', passport.authenticate('jwt', { session: false }), getTeacherById)
router.put('/update-profile', passport.authenticate('jwt', { session: false }), updateProfile)
router.post('/book-appointment', passport.authenticate('jwt', { session: false }), bookAppointment)
router.get('/get-teacher-booked-appointments', passport.authenticate('jwt', { session: false }), getTeacherBookedAppointments)
router.get('/get-user-booked-appointments', passport.authenticate('jwt', { session: false }), getUserBookedAppointments)
router.post('/accept-appointment', passport.authenticate('jwt', { session: false }), acceptAppointment)
router.put('/update-appointment-status', passport.authenticate('jwt', { session: false }), updateAppointmentStatus)
router.get('/get-teacher-appointments-count', passport.authenticate('jwt', { session: false }), getTeacherAppointmentsCount)
router.post('/favorite-teacher', passport.authenticate('jwt', { session: false }), favoriteTeacher)
router.get('/get-favorite-teachers', passport.authenticate('jwt', { session: false }), getFavoriteTeachers)
router.post('/create-post', upload.array('mediaFiles'), passport.authenticate('jwt', { session: false }), createPost);
router.get('/get-posts', passport.authenticate('jwt', { session: false }), getPosts)
router.get('/get-post-by-id/:id', passport.authenticate('jwt', { session: false }), getPostById)
router.post('/add-post-comment', passport.authenticate('jwt', { session: false }), addPostComment)
router.post('/add-post-like', passport.authenticate('jwt', { session: false }), addPostLike)
router.get('/get-event-places', passport.authenticate('jwt', { session: false }), getEventPlaces)
router.get('/get-public-event-places', getEventPlaces)
router.get('/get-events-by-user-id', passport.authenticate('jwt', { session: false }), getEventsByUserId)
export default router;
