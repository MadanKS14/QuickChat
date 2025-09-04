import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext"; // 1. Import useAuth to access its values
import toast from "react-hot-toast";

export const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    // Get the pre-configured axios instance and authUser from AuthContext
    const { socket, axios: axiosInstance, authUser } = useAuth();

    // --- THIS IS THE FIX ---
    // This useEffect hook will run whenever the authUser state changes.
    useEffect(() => {
        // If there's an authenticated user, it's now safe to fetch the users list.
        if (authUser) {
            getUsers();
        } else {
            // If the user logs out (authUser becomes null), clear all chat-related state.
            setUsers([]);
            setMessages([]);
            setSelectedUser(null);
            setUnseenMessages({});
        }
    }, [authUser]); // The hook depends on the user's authentication status.

    // function to get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axiosInstance.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch users");
        }
    };

    // function to get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axiosInstance.get(`/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch messages");
        }
    };

    // function to send a message to a selected user
    const sendMessage = async (messageData) => {
        if (!selectedUser) return toast.error("No user selected");
        try {
            const { data } = await axiosInstance.post(
                `/messages/send/${selectedUser._id}`,
                messageData
            );

            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to send message");
        }
    };

    useEffect(() => {
        if (!socket) return;

        const handleNewMessage = (newMessage) => {
            if (selectedUser && newMessage.senderId === selectedUser._id) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axiosInstance.put(`/messages/mark/${newMessage._id}`).catch(err => console.error("Failed to mark message as seen", err));
            } else {
                toast.success(`New message received!`);
                setUnseenMessages((prevUnseen) => ({
                    ...prevUnseen,
                    [newMessage.senderId]: (prevUnseen[newMessage.senderId] || 0) + 1,
                }));
            }
        };

        socket.on("newMessage", handleNewMessage);

        return () => {
            socket.off("newMessage", handleNewMessage);
        };
    }, [socket, selectedUser, axiosInstance]);


    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        getUsers, // Keep this in case you need to manually refresh the list
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

