import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContext } from "./AuthContext";
import { toast } from "react-hot-toast";

export const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const { socket, axios, authUser } = useContext(AuthContext);

    // --- Function to get all users for the sidebar ---
    const getUsers = async () => {
        try {
            // Correct API endpoint for fetching users
            const { data } = await axios.get("/api/users");
            if (data.users) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch users.");
        }
    };

    // --- Function to get messages for the selected user ---
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            // The backend sends the array of messages directly
            setMessages(data);
            // After fetching, mark these messages as seen on the backend
            await axios.post(`/api/messages/markseen/${userId}`);
            // Update the local unseen count to 0
            setUnseenMessages(prev => ({ ...prev, [userId]: 0 }));
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to fetch messages.");
        }
    };

    // --- Function to send a message ---
    const sendMessage = async (messageData) => {
        if (!selectedUser) return;
        try {
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            // Add the new message returned from the server to the state
            setMessages((prevMessages) => [...prevMessages, data]);
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to send message.");
        }
    };

    // --- Effect to fetch users when the component mounts ---
    useEffect(() => {
        if (authUser) {
            getUsers();
        }
    }, [authUser]);

    // --- Effect to handle real-time messages from Socket.IO ---
    useEffect(() => {
        if (socket) {
            // Listen for the "newMessage" event from the server
            socket.on("newMessage", (newMessage) => {
                // If the new message is from the user we are currently chatting with
                if (selectedUser?._id === newMessage.senderId) {
                    setMessages((prevMessages) => [...prevMessages, newMessage]);
                    // Mark it as seen immediately
                    axios.post(`/api/messages/markseen/${newMessage.senderId}`);
                } else {
                    // Otherwise, increment the unseen message count for the sender
                    toast.success(`New message from a user!`);
                    setUnseenMessages((prev) => ({
                        ...prev,
                        [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                    }));
                }
            });

            // Clean up the event listener when the component unmounts
            return () => socket.off("newMessage");
        }
    }, [socket, selectedUser]);


    const value = {
        messages,
        users,
        selectedUser,
        unseenMessages,
        setSelectedUser,
        getMessages,
        sendMessage,
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};

