import { useState, useEffect } from "react";
import axios from 'axios';
import { io } from "socket.io-client";
import toast from 'react-hot-toast';
import { AuthContext } from "./authContext";

// Axios instance for backend
const axiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000'}/api`,
});

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Attach token to all requests
    useEffect(() => {
        const interceptor = axiosInstance.interceptors.request.use(
            (config) => {
                const user = JSON.parse(localStorage.getItem("chat-user"));
                const token = user?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        const storedUser = localStorage.getItem("chat-user");
        if (storedUser) {
            setAuthUser(JSON.parse(storedUser));
        }
        setLoading(false);

        return () => axiosInstance.interceptors.request.eject(interceptor);
    }, []);

    // Socket.IO setup
    useEffect(() => {
        if (!authUser) {
            setSocket(null);
            setOnlineUsers([]);
            return undefined;
        }

        const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:5000", {
            auth: { token: authUser.token },
        });

        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (users) => {
            setOnlineUsers(users);
        });

        return () => {
            newSocket.close();
            setSocket((currentSocket) => currentSocket === newSocket ? null : currentSocket);
        };
    }, [authUser]);

    // ---- AUTH FUNCTIONS ----
    const login = async (credentials) => {
        try {
            const { data } = await axiosInstance.post("/auth/login", credentials);
            if (data.success) {
                const userData = { ...data.userData, token: data.token };
                localStorage.setItem("chat-user", JSON.stringify(userData));
                setAuthUser(userData);
                toast.success("Login successful!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Login failed");
            throw error;
        }
    };

    const signup = async (credentials) => {
        try {
            const { data } = await axiosInstance.post("/auth/signup", credentials);
            if (data.success) {
                const userData = { ...data.userData, token: data.token };
                localStorage.setItem("chat-user", JSON.stringify(userData));
                setAuthUser(userData);
                toast.success("Account created successfully!");
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Signup failed");
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem("chat-user");
        setAuthUser(null);
        toast.success("Logged out successfully");
    };

    // ✅ Add updateProfile
    const updateProfile = async (profileData) => {
        try {
            const { data } = await axiosInstance.put("/users/update-profile", profileData);
            if (data.success) {
                const updatedUser = { ...data.userData, token: authUser.token };
                setAuthUser(updatedUser);
                localStorage.setItem("chat-user", JSON.stringify(updatedUser));
                toast.success("Profile updated successfully!");
                return true;
            } else {
                toast.error(data.message || "Update failed");
                return false;
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Update failed");
            return false;
        }
    };

    const value = {
        authUser,
        login,
        signup,
        logout,
        updateProfile, // ✅ expose this
        onlineUsers,
        socket,
        axios: axiosInstance,
        loading,
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
