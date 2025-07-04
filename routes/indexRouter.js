import { Router } from 'express';
import { home } from '../controllers/indexController.js'; // test

import routinesRouter from './routinesRouter.js';
import authRouter from './authRouter.js';
import userRoutes from './usersRouter.js';

const router = Router();

router.get('/', home);
router.use('/auth', authRouter);
router.use('/routines', routinesRouter);
router.use('/user', userRoutes); 

export default router;
