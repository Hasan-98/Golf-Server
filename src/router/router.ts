// router.ts

import express, { Router } from 'express';
import { register , login , userById } from '../api/UserController';
import { createEvent, getAllEvents} from '../api/eventController';
import passport from '../auth/passport';
const router: Router = express.Router();

router.post('/register', register);
router.post('/login' , login)
router.get('/user/:id' ,passport.authenticate('jwt', { session: false }), userById)
router.post('/createEvent' ,passport.authenticate('jwt', { session: false }), createEvent)
router.get('/getAllEvents' ,passport.authenticate('jwt', { session: false }), getAllEvents)


export default router;
