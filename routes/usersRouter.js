// userRouter.js
import express from "express";
import { requireAuth } from "../middlewares/authMiddleware.js";

import { getUserProfile, updateUserProfile, updatePassword } from "../controllers/usersController.js";

const router = express.Router();

// 🔐 Aplica middleware a todas las rutas
router.use(requireAuth);

router.get("/profile", getUserProfile);
router.put("/update", updateUserProfile); 
router.put("/update-password", updatePassword);


export default router;