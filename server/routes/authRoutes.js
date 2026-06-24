import express from "express";
import { signup, login, getMe } from "../controllers/userController.js";
import { protectRoute } from "../middleware/auth.js";

const authRouter = express.Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.get("/me", protectRoute, getMe);

export default authRouter;