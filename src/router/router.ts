// router.ts

import express, { Router } from 'express';
import { register , login , userById } from '../api/UserController';
import { createEvent, getAllEvents , getEventsColData , getEventById , markAsFavorite , getFavoriteEvents} from '../api/eventController';
import { addComment, addLike} from '../api/communicationController';
import passport from '../auth/passport';
const router: Router = express.Router();

router.post('/register', register);
router.post('/login' , login)
router.get('/user/:id' ,passport.authenticate('jwt', { session: false }), userById)
router.post('/createEvent' ,passport.authenticate('jwt', { session: false }), createEvent)
router.get('/getAllEvents' ,passport.authenticate('jwt', { session: false }), getAllEvents)
router.get('/get-event-col-data' ,passport.authenticate('jwt', { session: false }), getEventsColData)
router.get('/get-event-by-id/:id' ,passport.authenticate('jwt', { session: false }), getEventById)
router.patch('/is-favourite-event/:id' , passport.authenticate('jwt', { session: false }), markAsFavorite)
router.get('/get-favourite-events' ,passport.authenticate('jwt', { session: false }), getFavoriteEvents)
router.post('/add-comment' ,passport.authenticate('jwt', { session: false }), addComment)
router.post('/add-like' ,passport.authenticate('jwt', { session: false }), addLike)
export default router;
