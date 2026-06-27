import Message from "../models/Message.js";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";
import cloudinary from "../lib/cloudinary.js";
import { emitToUser } from "../config/socket.js";

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user._id;

        if (!text?.trim() && !image) {
            return res.status(400).json({
                success: false,
                message: "Message cannot be empty",
            });
        }

        let imageUrl = "";

        if (image) {
            const uploadResult = await cloudinary.uploader.upload(image, {
                folder: "quickchat_messages",
            });

            imageUrl = uploadResult.secure_url;
        }

        const newMessage = await Message.create({
            senderId,
            receiverId,
            text: text?.trim() || "",
            image: imageUrl,
        });

        let conversation = await Conversation.findOne({
            participants: { $all: [senderId, receiverId] },
        });

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [senderId, receiverId],
                lastMessage: newMessage._id,
            });
        } else {
            conversation.lastMessage = newMessage._id;
            await conversation.save();
        }

        emitToUser(receiverId, "newMessage", newMessage);

        return res.status(201).json({
            success: true,
            newMessage,
        });

    } catch (error) {
        console.error("sendMessage:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

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

        return res.status(200).json({
            success: true,
            messages,
        });

    } catch (error) {
        console.error("getMessages:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const markMessagesAsSeen = async (req, res) => {
    try {
        const { id: otherUserId } = req.params;
        const currentUserId = req.user._id;
        const seenAt = new Date();

        const result = await Message.updateMany(
            {
                senderId: otherUserId,
                receiverId: currentUserId,
                seen: false,
            },
            {
                $set: {
                    seen: true,
                    seenAt,
                },
            }
        );

        if (result.modifiedCount > 0) {
            emitToUser(otherUserId, "messagesSeen", {
                seenByUserId: currentUserId.toString(),
                seenAt,
            });
        }

        return res.status(200).json({
            success: true,
            updatedCount: result.modifiedCount,
        });

    } catch (error) {
        console.error("markMessagesAsSeen:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};

export const getUsersForSidebar = async (req, res) => {
    try {
        const loggedInUserId = req.user._id;

        const users = await User.find({
            _id: { $ne: loggedInUserId },
        }).select("-password");

        const unseenMessages = await Message.aggregate([
            {
                $match: {
                    receiverId: loggedInUserId,
                    seen: false,
                },
            },
            {
                $group: {
                    _id: "$senderId",
                    count: { $sum: 1 },
                },
            },
        ]);

        const unseenMessagesMap = unseenMessages.reduce((acc, item) => {
            acc[item._id.toString()] = item.count;
            return acc;
        }, {});

        return res.status(200).json({
            success: true,
            users,
            unseenMessages: unseenMessagesMap,
        });

    } catch (error) {
        console.error("getUsersForSidebar:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
        });
    }
};