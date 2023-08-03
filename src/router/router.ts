// router.ts

import express, { Router } from 'express';
import { register , login , userById } from '../api/UserController';
import passport from '../auth/passport';
const router: Router = express.Router();

router.post('/register', register);
router.post('/login' , login)
router.get('/user/:id' ,passport.authenticate('jwt', { session: false }), userById)

export default router;
