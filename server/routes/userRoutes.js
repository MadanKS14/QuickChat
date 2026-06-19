import express from "express";
import { updateProfile, getMe } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.put("/update-profile", protectRoute, updateProfile);
userRouter.get("/me", protectRoute, getMe);

export default userRouter;
