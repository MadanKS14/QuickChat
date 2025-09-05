import Message from "../models/Message.js";
import User from "../models/User.js"; // You will need to import the User model
import { getReceiverSocketId, io } from "../server.js";
import cloudinary from "../lib/cloudinary.js";

/**
 * Send a message
 */
export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        let imageUrl = "";
        if (image) {
            const uploadedResponse = await cloudinary.uploader.upload(image, {
                folder: "quickchat_messages",
            });
            imageUrl = uploadedResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        // Return a structured success response
        res.status(201).json({ success: true, newMessage });
    } catch (error) {
        console.error("Error in sendMessage:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Get messages for a user
 */
export const getMessages = async (req, res) => {
    try {
        const senderId = req.user._id;
        const { id: receiverId } = req.params;

        const messages = await Message.find({
            $or: [
                { senderId, receiverId },
                { senderId: receiverId, receiverId: senderId },
            ],
        }).sort({ createdAt: 1 });

        // Return a structured success response
        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Error in getMessages:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

/**
 * Mark messages as seen
 */
export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const currentUserId = req.user._id;

        await Message.updateMany(
            { senderId: otherUserId, receiverId: currentUserId, seen: false },
            { $set: { seen: true } }
        );

        res.status(200).json({ success: true, message: "Messages marked as seen" });
    } catch (error) {
        console.error("Error in markMessagesAsSeen:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


// --- THIS IS THE NEW FUNCTION ---
/**
 * Get all users for the sidebar
 */
export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        // Find all users from the database, but exclude the current logged-in user
        // Also, exclude the password field from the result
        const filteredUsers = await User.find({ _id: { $ne: loggedInUserId } }).select("-password");

        // Get unseen messages count for each user
        const unseenMessages = await Message.aggregate([
            { $match: { receiverId: loggedInUserId, seen: false } },
            { $group: { _id: "$senderId", count: { $sum: 1 } } }
        ]);

        const unseenMessagesMap = unseenMessages.reduce((acc, item) => {
            acc[item._id] = item.count;
            return acc;
        }, {});

        // Return the list of users and unseen message counts as a JSON response
        res.status(200).json({ success: true, users: filteredUsers, unseenMessages: unseenMessagesMap });

    } catch (error) {
        console.error("Error in getUsersForSidebar: ", error.message);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};