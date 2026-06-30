import { Server } from "socket.io";
import jwt from "jsonwebtoken";

export let io;

const userSocketMap = new Map();

export const getOnlineUserIds = () => [...userSocketMap.keys()];

export const emitToUser = (userId, event, payload) => {
  const socketIds = userSocketMap.get(userId.toString());

  if (!socketIds) return;

  socketIds.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
};

export const initializeSocket = (server) => {
  const CLIENT_URL =
    process.env.CLIENT_URL || "http://localhost:5173";

  io = new Server(server, {
    cors: {
      origin: CLIENT_URL,
      credentials: true,
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      socket.userId = decoded.userId;

      next();
    } catch {
      next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const { userId } = socket;

    const socketIds = userSocketMap.get(userId) ?? new Set();

    socketIds.add(socket.id);

    userSocketMap.set(userId, socketIds);

    io.emit("getOnlineUsers", getOnlineUserIds());

    socket.on("typing", ({ receiverId }) => {
      emitToUser(receiverId, "typing", {
        senderId: userId,
      });
    });

    socket.on("stopTyping", ({ receiverId }) => {
      emitToUser(receiverId, "stopTyping", {
        senderId: userId,
      });
    });

    socket.on("disconnect", () => {
      const socketIds = userSocketMap.get(userId);

      if (!socketIds) return;

      socketIds.delete(socket.id);

      if (socketIds.size === 0) {
        userSocketMap.delete(userId);
      }

      io.emit("getOnlineUsers", getOnlineUserIds());
    });
  });

  return io;
};