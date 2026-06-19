import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, markMessagesAsSeen, sendMessage, getUsersForSidebar } from "../controllers/messageController.js";

const router = express.Router();

router.get("/users", protectRoute, getUsersForSidebar);
router.put("/seen/:id", protectRoute, markMessagesAsSeen);
router.post("/send/:id", protectRoute, sendMessage);
router.get("/:id", protectRoute, getMessages);

export default router;
