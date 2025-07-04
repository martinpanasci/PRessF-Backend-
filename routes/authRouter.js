// File: server/routes/authRouter.js
import express from 'express';
import { loginUser, getUserFromToken, logoutUser, registerUser } from '../controllers/authController.js';

const router = express.Router();

//router.post('/register', registerUser);
router.post('/login', loginUser);
router.get("/user", getUserFromToken);
router.post("/logout", logoutUser);
router.post("/register", registerUser);


export default router;
