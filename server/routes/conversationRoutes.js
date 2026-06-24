import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getConversations } from "../controllers/conversationController.js";

const conversationRouter = express.Router();

conversationRouter.get("/", protectRoute, getConversations);

export default conversationRouter;