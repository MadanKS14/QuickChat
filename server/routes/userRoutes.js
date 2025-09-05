import express from "express";
import { signup, login, updateProfile, getMe } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

// Auth routes
userRouter.post("/signup", signup);
userRouter.post("/login", login);

// Protected routes
userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/me", protectRoute, getMe);

export default userRouter;