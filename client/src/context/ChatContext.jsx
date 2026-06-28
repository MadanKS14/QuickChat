import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { ChatContext } from "./chatContext";
import { useAuth } from "./authContext";

const getParticipantId = (participant) =>
  typeof participant === "object"
    ? participant?._id?.toString()
    : participant?.toString();

export const ChatProvider = ({ children }) => {
  const { socket, axios: axiosInstance, authUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [typingUsers, setTypingUsers] = useState({});

  // Always-current ref so the socket listener never needs to be re-attached
  // when the user switches conversations (avoids a drop-window on resubscribe).
  const selectedUserRef = useRef(selectedUser);
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  // ================= USERS =================

  const getUsers = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/messages/users");

      if (data.success) {
        setUsers(data.users);
        setUnseenMessages(data.unseenMessages || {});
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load users");
    }
  }, [axiosInstance]);

  // ================= CONVERSATIONS =================

  const getConversations = useCallback(async () => {
    try {
      const { data } = await axiosInstance.get("/conversations");

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error(
        error?.response?.data?.message || "Failed to fetch conversations"
      );
    }
  }, [axiosInstance]);

  // ================= SEEN =================

  const markMessagesAsSeen = useCallback(
    async (userId) => {
      try {
        const { data } = await axiosInstance.put(`/messages/seen/${userId}`);

        if (data.success) {
          setUnseenMessages((prev) => {
            const updated = { ...prev };
            delete updated[userId];
            return updated;
          });

          await getConversations();
        }
      } catch (error) {
        console.error(error);
      }
    },
    [axiosInstance, getConversations]
  );

  // ================= MESSAGES =================

  const getMessages = useCallback(
    async (userId) => {
      try {
        const { data } = await axiosInstance.get(`/messages/${userId}`);

        if (data.success) {
          setMessages(data.messages);
          await markMessagesAsSeen(userId);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to fetch messages");
      }
    },
    [axiosInstance, markMessagesAsSeen]
  );

  // ================= SEND =================

  const sendMessage = async (messageData) => {
    if (!selectedUser) return;

    try {
      const { data } = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );

      if (data.success) {
        setMessages((prev) => [...prev, data.newMessage]);
        await Promise.all([getConversations(), getUsers()]);
      } else {
        toast.error(data.message || "Failed to send message");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    }
  };

  // ================= INITIAL LOAD =================

  useEffect(() => {
    if (!authUser) {
      setUsers([]);
      setConversations([]);
      setMessages([]);
      setSelectedUser(null);
      setUnseenMessages({});
      return;
    }

    getUsers();
    getConversations();
  }, [authUser, getUsers, getConversations]);

  // ================= SOCKET =================

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = async (newMessage) => {
      const senderId = getParticipantId(newMessage.senderId);
      const isActiveChat = selectedUserRef.current?._id === senderId;

      if (isActiveChat) {
        setMessages((prev) => [...prev, newMessage]);
        await markMessagesAsSeen(senderId);
      } else {
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }

      await Promise.all([getConversations(), getUsers()]);
    };

    const handleMessagesSeen = async ({ seenByUserId, seenAt }) => {
      setMessages((prev) =>
        prev.map((message) => {
          const receiverId = getParticipantId(message.receiverId);

          if (receiverId === seenByUserId && !message.seen) {
            return { ...message, seen: true, seenAt };
          }

          return message;
        })
      );

      await getConversations();
    };

    const handleTyping = ({ senderId }) => {
      setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
    };

    const handleStopTyping = ({ senderId }) => {
      setTypingUsers((prev) => {
        const updated = { ...prev };
        delete updated[senderId];
        return updated;
      });
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("messagesSeen", handleMessagesSeen);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("messagesSeen", handleMessagesSeen);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };
    // selectedUser intentionally excluded — selectedUserRef tracks it without
    // forcing the listener to be torn down and re-attached on every switch.
  }, [socket, getUsers, getConversations, markMessagesAsSeen]);

  return (
    <ChatContext.Provider
      value={{
        users,
        conversations,
        messages,
        selectedUser,
        unseenMessages,
        typingUsers,

        setSelectedUser,
        setMessages,
        setUnseenMessages,

        getUsers,
        getConversations,
        getMessages,

        sendMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};