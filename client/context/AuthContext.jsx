import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
// We don't need to set a default baseURL for axios when using the Vite proxy.
// API requests will be relative (e.g., /api/auth/login) and forwarded by Vite.

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const navigate = useNavigate();

    const setAxiosToken = (token) => {
        if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        else delete axios.defaults.headers.common["Authorization"];
    };

    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                localStorage.setItem("quickchat_token", data.token);
                setAxiosToken(data.token);
                setAuthUser(data.userData); // Corrected from data.user to data.userData
                toast.success(data.message);
                navigate("/");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "An error occurred.");
        }
    };

    const logout = () => {
        setAuthUser(null);
        localStorage.removeItem("quickchat_token");
        setAxiosToken(null);
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
        toast.success("Logged out successfully");
        navigate("/login");
    };

    const updateProfile = async (profileData) => {
        try {
            const { data } = await axios.put("/api/users/update-profile", profileData);
            if (data.success) {
                setAuthUser(data.userData);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to update profile.");
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("quickchat_token");
        if (authUser && token && !socket) {
            const newSocket = io(backendUrl, { auth: { token } });
            setSocket(newSocket);
            newSocket.on("connect", () => console.log("Socket connected:", newSocket.id));
            newSocket.on("disconnect", () => console.log("Socket disconnected"));
            return () => newSocket.close();
        } else if (!authUser && socket) {
            socket.close();
            setSocket(null);
        }
    }, [authUser, socket]);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem("quickchat_token");
            if (!token) return;
            setAxiosToken(token);
            try {
                const { data } = await axios.get("/api/users/me");
                if (data.success) setAuthUser(data.userData);
            } catch (err) {
                localStorage.removeItem("quickchat_token");
            }
        };
        checkAuth();
    }, []);

    const value = { authUser, login, logout, updateProfile, socket, axios };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

