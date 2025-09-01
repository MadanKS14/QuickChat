// AuthContext.jsx
import React, { createContext, useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
axios.defaults.baseURL = backendUrl;

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();

  // Helper: set token in axios
  const setAxiosToken = (token) => {
    if (token) axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    else delete axios.defaults.headers.common["Authorization"];
  };

  // Login / Signup
  const login = async (state, credentials) => {
    try {
      const { data } = await axios.post(`/api/user/${state}`, credentials);
      if (data.success) {
        localStorage.setItem("token", data.token);
        setAxiosToken(data.token);
        setAuthUser(data.user);
        connectSocket(data.user); // connect after login
        toast.success(data.message);
        navigate("/"); // go to home page
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Logout
  const logout = () => {
    setAuthUser(null);
    localStorage.removeItem("token");
    setAxiosToken(null);
    if (socket) {
      socket.disconnect();
      setSocket(null);
    }
    toast.success("Logged out successfully");
    navigate("/login");
  };

  // Check if user is authenticated
  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setAxiosToken(token);
    try {
      const { data } = await axios.get("/api/user/me");
      if (data.success) setAuthUser(data.user);
    } catch (err) {
      console.error(err);
      localStorage.removeItem("token");
      setAxiosToken(null);
    }
  };

  // Update user profile
  const updateProfile = async (body) => {
    try {
      const { data } = await axios.put("/api/user/update-profile", body);
      if (data.success) {
        setAuthUser(data.user);
        toast.success("Profile updated successfully");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Connect Socket.IO
  const connectSocket = (user) => {
    const token = localStorage.getItem("token");
    if (!token || socket?.connected) return;

    const newSocket = io(backendUrl, { auth: { token } });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.on("getOnlineUsers", (users) => {
      console.log("Online users:", users);
    });

    newSocket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    setSocket(newSocket);
  };

  // On mount: check auth
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        authUser,
        login,
        logout,
        updateProfile,
        socket,
        axios,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
