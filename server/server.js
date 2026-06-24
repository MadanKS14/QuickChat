import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import conversationRouter from "./routes/conversationRoutes.js";

const app = express();
const server = http.createServer(app);

const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

export const io = new Server(server, {
  cors: {
    origin: clientUrl,
    methods: ["GET", "POST"]
  }
});

const userSocketMap = new Map();

const getOnlineUserIds = () => [...userSocketMap.keys()];

export const emitToUser = (userId, eventName, payload) => {
  const socketIds = userSocketMap.get(userId.toString());
  if (!socketIds) return;

  socketIds.forEach((socketId) => {
    io.to(socketId).emit(eventName, payload);
  });
};

// Secure Socket.IO Middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error: No token provided."));

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return next(new Error("Authentication error: Invalid token."));
    socket.userId = decoded.userId;
    next();
  });
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  const userId = socket.userId;
  const socketIds = userSocketMap.get(userId) || new Set();
  socketIds.add(socket.id);
  userSocketMap.set(userId, socketIds);

  io.emit("getOnlineUsers", getOnlineUserIds());

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const currentSocketIds = userSocketMap.get(userId);
    currentSocketIds?.delete(socket.id);

    if (currentSocketIds?.size === 0) {
      userSocketMap.delete(userId);
    }

    io.emit("getOnlineUsers", getOnlineUserIds());
  });
});

// --- Middleware ---
app.use(express.json({ limit: "4mb" }));
app.use(cors({ origin: clientUrl }));

// --- API Routes ---
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/conversations", conversationRouter);

// --- Database & Server ---
const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => console.log("Server running on port:", PORT));
  } catch (error) {
    console.error("Failed to start server:", error.message);
  }
};

startServer();
