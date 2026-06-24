import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { AuthContext } from "./authContext";

const axiosInstance = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api`,
});

const STORAGE_KEY = "quickchat-user";

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verify user on page refresh
  const checkAuth = async () => {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEY);

      if (!storedUser) {
        setLoading(false);
        return;
      }

      const parsedUser = JSON.parse(storedUser);

      const { data } = await axiosInstance.get("/auth/me", {
        headers: {
          Authorization: `Bearer ${parsedUser.token}`,
        },
      });

      if (data.success) {
        setAuthUser({
          ...data.userData,
          token: parsedUser.token,
        });
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      localStorage.removeItem(STORAGE_KEY);
      console.error("Auth check failed:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Attach token to all requests
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const storedUser = localStorage.getItem(STORAGE_KEY);

        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);

          if (parsedUser?.token) {
            config.headers.Authorization = `Bearer ${parsedUser.token}`;
          }
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    checkAuth();

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, []);

  // Socket.IO connection
  useEffect(() => {
    if (!authUser) {
      setOnlineUsers([]);
      setSocket(null);
      return;
    }

    const newSocket = io(
      import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
      {
        auth: {
          token: authUser.token,
        },
      }
    );

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      newSocket.disconnect();

      setSocket((currentSocket) =>
        currentSocket === newSocket ? null : currentSocket
      );
    };
  }, [authUser]);

  // Login
  const login = async (credentials) => {
    try {
      const { data } = await axiosInstance.post(
        "/auth/login",
        credentials
      );

      if (data.success) {
        const userData = {
          ...data.userData,
          token: data.token,
        };

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(userData)
        );

        setAuthUser(userData);

        toast.success("Login successful");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
      throw error;
    }
  };

  // Signup
  const signup = async (credentials) => {
    try {
      const { data } = await axiosInstance.post(
        "/auth/signup",
        credentials
      );

      if (data.success) {
        const userData = {
          ...data.userData,
          token: data.token,
        };

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(userData)
        );

        setAuthUser(userData);

        toast.success("Account created successfully");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Signup failed"
      );
      throw error;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem(STORAGE_KEY);

    if (socket) {
      socket.disconnect();
    }

    setAuthUser(null);
    setOnlineUsers([]);

    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      const { data } = await axiosInstance.put(
        "/users/update-profile",
        profileData
      );

      if (data.success) {
        const updatedUser = {
          ...data.userData,
          token: authUser.token,
        };

        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(updatedUser)
        );

        setAuthUser(updatedUser);

        toast.success("Profile updated successfully");

        return true;
      }

      toast.error(data.message || "Update failed");
      return false;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Update failed"
      );
      return false;
    }
  };

  const value = {
    authUser,
    setAuthUser,
    login,
    signup,
    logout,
    updateProfile,
    onlineUsers,
    socket,
    axios: axiosInstance,
    loading,
    isAuthenticated: !!authUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};