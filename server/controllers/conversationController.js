import Conversation from "../models/Conversation.js";

export const getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate({
        path: "participants",
        select: "fullName profilePic isOnline lastSeen",
      })
      .populate({
        path: "lastMessage",
        select: "text image seen seenAt createdAt senderId receiverId",
      })
      .sort({ updatedAt: -1 });

    const formattedConversations = conversations.map((conversation) => {
      const otherParticipant = conversation.participants.find(
        (participant) =>
          participant._id.toString() !== userId.toString()
      );

      return {
        _id: conversation._id,
        participant: otherParticipant,
        lastMessage: conversation.lastMessage,
        updatedAt: conversation.updatedAt,
      };
    });

    res.status(200).json({
      success: true,
      conversations: formattedConversations,
    });
  } catch (error) {
    console.error("Error in getConversations:", error.message);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};