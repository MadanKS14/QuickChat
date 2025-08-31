import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, markMessagesAsSeen, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

// Routes
router.get("/:id", protectRoute, getMessages);
router.get("/mark/:id", protectRoute, markMessagesAsSeen);
router.post("/send/:id", protectRoute, sendMessage);

export default router;
