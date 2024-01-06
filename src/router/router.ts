// router.ts

import express, { Router } from 'express';
import { register, login, userById } from '../api/UserController';
import {
    createEvent, getAllEvents, getEventsColData,
    getEventById, markAsFavorite, getFavoriteEvents, joinEvent, getJoinedEvents, getPublicEvents
} from '../api/eventController';
import { addComment, addLike } from '../api/communicationController';
import { becomeTeacher, updateProfile, getAllTeachers, getTeacherById } from '../api/teacherController';
import { bookAppointment, getTeacherBookedAppointments, getUserBookedAppointments } from '../api/appointmentController';
import passport from '../auth/passport';
const router: Router = express.Router();

router.post('/register', register);
router.post('/login', login)
router.get('/user/:id', passport.authenticate('jwt', { session: false }), userById)
router.post('/createEvent', passport.authenticate('jwt', { session: false }), createEvent)
router.get('/getAllEvents', passport.authenticate('jwt', { session: false }), getAllEvents)
router.get('/get-event-col-data', passport.authenticate('jwt', { session: false }), getEventsColData)
router.get('/get-event-by-id/:id', passport.authenticate('jwt', { session: false }), getEventById)
router.patch('/is-favourite-event/:id', passport.authenticate('jwt', { session: false }), markAsFavorite)
router.get('/get-favourite-events', passport.authenticate('jwt', { session: false }), getFavoriteEvents)
router.get('/get-public-events', getPublicEvents)
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
export default router;
