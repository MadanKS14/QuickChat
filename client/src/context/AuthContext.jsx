import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import { AuthContext } from "./authContext";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
const STORAGE_KEY = "quickchat-user";

const axiosInstance = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setStoredUser = (user) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

const clearStoredUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredUser();
    setAuthUser(null);
    setOnlineUsers([]);
  }, []);

  // Verify user on page refresh
  useEffect(() => {
    const checkAuth = async () => {
      const storedUser = getStoredUser();

      if (!storedUser?.token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axiosInstance.get("/auth/me", {
          headers: { Authorization: `Bearer ${storedUser.token}` },
        });

        if (data.success) {
          setAuthUser({ ...data.userData, token: storedUser.token });
        } else {
          clearStoredUser();
        }
      } catch (error) {
        clearStoredUser();
        console.error("Auth check failed:", error.message);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Attach token to requests, auto-logout on 401
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const storedUser = getStoredUser();

        if (storedUser?.token) {
          config.headers.Authorization = `Bearer ${storedUser.token}`;
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          clearStoredUser();
          setAuthUser(null);
          setOnlineUsers([]);
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Socket.IO connection
  useEffect(() => {
    if (!authUser) {
      setOnlineUsers([]);
      setSocket(null);
      return;
    }

    const newSocket = io(BACKEND_URL, {
      auth: { token: authUser.token },
    });

    setSocket(newSocket);
    newSocket.on("getOnlineUsers", setOnlineUsers);

    return () => {
      newSocket.disconnect();
      setSocket((current) => (current === newSocket ? null : current));
    };
  }, [authUser]);

  // Login — errors surface inline in the form, not as a toast
  const login = async (credentials) => {
    const { data } = await axiosInstance.post("/auth/login", credentials);

    if (!data.success) {
      throw new Error(data.message || "Login failed");
    }

    const userData = { ...data.userData, token: data.token };
    setStoredUser(userData);
    setAuthUser(userData);
  };

  // Signup — errors surface inline in the form, not as a toast
  const signup = async (credentials) => {
    const { data } = await axiosInstance.post("/auth/signup", credentials);

    if (!data.success) {
      throw new Error(data.message || "Signup failed");
    }

    const userData = { ...data.userData, token: data.token };
    setStoredUser(userData);
    setAuthUser(userData);

    toast.success("Account created successfully");
  };

  // Logout (with toast + socket cleanup)
  const handleLogout = () => {
    socket?.disconnect();
    logout();
    toast.success("Logged out successfully");
  };

  // Update profile
  const updateProfile = async (profileData) => {
    if (!authUser?.token) {
      toast.error("You need to be logged in to update your profile");
      return false;
    }

    try {
      const { data } = await axiosInstance.put("/users/profile", profileData);

      if (!data.success) {
        toast.error(data.message || "Update failed");
        return false;
      }

      const updatedUser = { ...data.userData, token: authUser.token };
      setStoredUser(updatedUser);
      setAuthUser(updatedUser);
      toast.success("Profile updated successfully");

      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
      return false;
    }
  };

  const value = {
    authUser,
    setAuthUser,
    login,
    signup,
    logout: handleLogout,
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