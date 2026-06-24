import express from "express";
import { updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const userRouter = express.Router();

userRouter.put("/profile", protectRoute, updateProfile);

export default userRouter;