import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import toast from 'react-hot-toast';

export const ChatContext = createContext();

export const useChat = () => {
    return useContext(ChatContext);
};

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});

    const { socket, axios: axiosInstance, authUser } = useAuth();

    useEffect(() => {
        if (authUser) {
            getUsers();
        } else {
            setUsers([]);
            setMessages([]);
            setSelectedUser(null);
            setUnseenMessages({});
        }
    }, [authUser]);

    const getUsers = async () => {
        try {
            const { data } = await axiosInstance.get("/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Failed to fetch users");
        }
    };
    
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

    const sendMessage = async (messageData) => {
        if (!selectedUser) return toast.error("No user selected");
        try {
            const { data } = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
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
                setMessages((prev) => [...prev, newMessage]);
                axiosInstance.put(`/messages/mark/${newMessage._id}`).catch(err => console.error("Failed to mark message", err));
             } else if (authUser) {
                toast.success(`New message received!`);
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
             }
        };

        socket.on("newMessage", handleNewMessage);
        return () => socket.off("newMessage", handleNewMessage);
    }, [socket, selectedUser, authUser, axiosInstance]);

    const value = {
        messages, users, selectedUser, unseenMessages, getUsers,
        getMessages, setMessages, sendMessage, setSelectedUser, setUnseenMessages
    };

    return (
        <ChatContext.Provider value={value}>
            {children}
        </ChatContext.Provider>
    );
};
