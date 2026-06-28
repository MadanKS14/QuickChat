import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  getMessages,
  markMessagesAsSeen,
  sendMessage,
  getUsersForSidebar,
  editMessage,
  deleteMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.get("/:id", protectRoute, getMessages);
messageRouter.put("/seen/:id", protectRoute, markMessagesAsSeen);
messageRouter.put("/edit/:id",protectRoute,editMessage);
messageRouter.delete("/delete/:id",protectRoute,deleteMessage);

export default messageRouter;