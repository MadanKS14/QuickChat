import { Server } from "socket.io";
import jwt from "jsonwebtoken";

export let io;

const userSocketMap = new Map();

const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

export const getOnlineUserIds = () => [...userSocketMap.keys()];

export const emitToUser = (userId, event, payload) => {
  const socketIds = userSocketMap.get(userId.toString());

  if (!socketIds) return;

  socketIds.forEach((socketId) => {
    io.to(socketId).emit(event, payload);
  });
};

export const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin(origin, callback) {
        // Allow requests without origin
        if (!origin) {
          return callback(null, true);
        }

        // Localhost + Production
        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        // Allow all Vercel preview deployments
        if (origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
      },
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