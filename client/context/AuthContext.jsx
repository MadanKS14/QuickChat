import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";

export const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
    const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("chat-user")) || null);
    const [token, setToken] = useState(localStorage.getItem("chat-token") || null);
    const [socket, setSocket] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    
    // --- THIS IS THE FIX ---
    // The baseURL should be '/api' so that it correctly prefixes all API calls.
    // e.g., /api + /auth/login = /api/auth/login
    // e.g., /api + /messages/users = /api/messages/users
    const axiosInstance = axios.create({
        baseURL: "/api",
    });

    // This effect correctly sets the auth token for all subsequent requests
    useEffect(() => {
        if (token) {
            axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axiosInstance.defaults.headers.common["Authorization"];
        }
    }, [token, axiosInstance.defaults.headers.common]);

    // This effect correctly establishes the secure socket connection
    useEffect(() => {
        if (authUser && token) {
            const newSocket = io("http://localhost:5000", {
                auth: { token },
            });
            setSocket(newSocket);

            newSocket.on("getOnlineUsers", (users) => setOnlineUsers(users));

            newSocket.on("connect_error", (err) => {
                toast.error(`Socket connection failed: ${err.message}`);
            });

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [authUser, token]);

    const login = async (credentials) => {
        try {
            const { data } = await axiosInstance.post("/auth/login", credentials);
            if (data.success) {
                setAuthUser(data.userData);
                setToken(data.token);
                localStorage.setItem("chat-user", JSON.stringify(data.userData));
                localStorage.setItem("chat-token", data.token);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Login failed");
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            const { data } = await axiosInstance.post("/auth/signup", userData);
            if (data.success) {
                setAuthUser(data.userData);
                setToken(data.token);
                localStorage.setItem("chat-user", JSON.stringify(data.userData));
                localStorage.setItem("chat-token", data.token);
                toast.success(data.message);
            }
        } catch (error) {
            toast.error(error?.response?.data?.message || "Signup failed");
            throw error;
        }
    };

    const logout = () => {
        setAuthUser(null);
        setToken(null);
        localStorage.removeItem("chat-user");
        localStorage.removeItem("chat-token");
        toast.success("Logged out successfully");
    };

    const value = {
        authUser,
        token,
        login,
        signup,
        logout,
        socket,
        onlineUsers,
        axios: axiosInstance,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

