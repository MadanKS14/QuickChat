import express from "express";
import { signup, login, getMe, updateProfile } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const authRouter = express.Router();

// Auth routes
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", protectRoute, getMe);
authRouter.put("/update-profile", protectRoute, updateProfile);

export default authRouter;
