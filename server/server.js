import express from "express";
import "dotenv/config";
import cors from "cors";
import http from "http";

import { connectDB } from "./lib/db.js";
import { initializeSocket } from "./config/socket.js";

import authRouter from "./routes/authRoutes.js";
import userRouter from "./routes/userRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";

const app = express();
const server = http.createServer(app);

// ================================
// Environment
// ================================

const PORT = process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

// ================================
// Initialize Socket.IO
// ================================

initializeSocket(server);

// ================================
// Middlewares
// ================================

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "4mb",
  })
);

// ================================
// Health Check Route
// ================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "QuickChat API is running 🚀",
  });
});

// ================================
// API Routes
// ================================

app.use("/api/auth", authRouter);

app.use("/api/users", userRouter);

app.use("/api/messages", messageRouter);

app.use("/api/conversations", conversationRouter);

// ================================
// 404 Handler
// ================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API Route Not Found",
  });
});

// ================================
// Start Server
// ================================

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, () => {
      console.log(`
=========================================
🚀 QuickChat Server Started Successfully
🌐 Port      : ${PORT}
🖥️ Client    : ${CLIENT_URL}
=========================================
`);
    });
  } catch (error) {
    console.error("❌ Failed to start server");
    console.error(error);

    process.exit(1);
  }
};

startServer();