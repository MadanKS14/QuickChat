import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./authContext";
import { ChatContext } from "./chatContext";

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios: axiosInstance, authUser } = useAuth();

    const getUsers = useCallback(async () => {
        try {
            const { data } = await axiosInstance.get("/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch users");
        }
    }, [axiosInstance]);

    const markMessagesAsSeen = useCallback(async (userId) => {
        try {
            const { data } = await axiosInstance.put(`/messages/seen/${userId}`);
            if (data.success) {
                setUnseenMessages((previous) => {
                    const next = { ...previous };
                    delete next[userId];
                    return next;
                });
            }
        } catch (error) {
            console.error("Failed to mark messages as seen", error);
        }
    }, [axiosInstance]);

    useEffect(() => {
        if (authUser) {
            getUsers();
            return;
        }

        setUsers([]);
        setMessages([]);
        setSelectedUser(null);
        setUnseenMessages({});
    }, [authUser, getUsers]);

    const getMessages = async (userId) => {
        try {
            const { data } = await axiosInstance.get(`/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                await markMessagesAsSeen(userId);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch messages");
        }
    };

    const sendMessage = async (messageData) => {
        if (!selectedUser) return toast.error("No user selected");

        try {
            const { data } = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((previous) => [...previous, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send message");
        }
    };

    useEffect(() => {
        if (!socket) return undefined;

        const handleNewMessage = async (newMessage) => {
            const senderId =
                typeof newMessage.senderId === "object"
                    ? newMessage.senderId._id?.toString()
                    : newMessage.senderId?.toString();

            const selectedId = selectedUser?._id?.toString();

            if (selectedId && senderId === selectedId) {
                setMessages((prev) => [...prev, newMessage]);
                await markMessagesAsSeen(selectedId);
                return;
            }

            toast.success("New message received!");

            setUnseenMessages((prev) => ({
                ...prev,
                [senderId]: (prev[senderId] || 0) + 1,
            }));
        };

        const handleMessagesSeen = ({ seenByUserId, seenAt }) => {
            setMessages((previous) =>
                previous.map((message) => {
                    const receiverId =
                        typeof message.receiverId === "object"
                            ? message.receiverId._id?.toString()
                            : message.receiverId?.toString();

                    return receiverId === seenByUserId && !message.seen
                        ? { ...message, seen: true, seenAt }
                        : message;
                })
            );
        };
        socket.on("newMessage", handleNewMessage);
        socket.on("messagesSeen", handleMessagesSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("messagesSeen", handleMessagesSeen);
        };
    }, [socket, selectedUser, authUser, markMessagesAsSeen]);

    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers,
        getMessages,
        setMessages,
        sendMessage,
        setSelectedUser,
        setUnseenMessages,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
