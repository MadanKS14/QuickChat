import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";
import { connectDB } from "./lib/db.js";
import authRouter from "./routes/authRouter.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);

// --- CORRECTED Socket.IO Setup ---
// This configuration explicitly allows your frontend to connect, fixing the WebSocket error.
export const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The specific URL of your frontend
    methods: ["GET", "POST"]
  }
});

const userSocketMap = {}; // { userId: socketId }
export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

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
  if (userId) userSocketMap[userId] = socket.id;

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    if (userId) delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

// --- Middleware ---
app.use(express.json({ limit: "4mb" }));
app.use(cors());

// --- API Routes ---
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);

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

