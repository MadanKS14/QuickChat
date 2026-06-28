import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessages,
  markMessagesAsSeen,
  sendMessage,
  getUsersForSidebar,
  editMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/seen/:id", protectRoute, markMessagesAsSeen);
messageRouter.put("/edit/:id",protectRoute,editMessage);

export default messageRouter;