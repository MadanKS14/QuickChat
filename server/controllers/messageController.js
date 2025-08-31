import Message from "../models/Message.js";
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

    res.status(201).json(newMessage);
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

    res.status(200).json(messages);
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
