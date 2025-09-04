import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getMessages, markMessagesAsSeen, sendMessage, getUsersForSidebar } from "../controllers/messageController.js";

const router = express.Router();

// --- THIS IS THE NEW ROUTE ---
// It specifically handles the request from the frontend to get all users for the sidebar.
router.get("/users", protectRoute, getUsersForSidebar);

// Existing Routes
router.get("/:id", protectRoute, getMessages);
// Note: In your ChatContext, you use a PUT request to mark messages as seen. 
// You might need to change this from router.get to router.put in the future.
router.get("/mark/:id", protectRoute, markMessagesAsSeen); 
router.post("/send/:id", protectRoute, sendMessage);

export default router;

