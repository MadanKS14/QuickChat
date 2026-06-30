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

// Allowed Origins
const allowedOrigins = [
  "http://localhost:5173",
  process.env.CLIENT_URL,
];

// Middleware
app.use(express.json({ limit: "4mb" }));

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without origin (Postman, mobile apps, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost + production URL
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
  })
);

// Health Check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "QuickChat API is running 🚀",
  });
});

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/messages", messageRouter);
app.use("/api/conversations", conversationRouter);

// Start Server
const startServer = async () => {
  try {
    await connectDB();

    const PORT = process.env.PORT || 5000;

    server.listen(PORT, () => {
      console.log("=========================================");
      console.log("🚀 QuickChat Server Started Successfully");
      console.log(`🌐 Port      : ${PORT}`);
      console.log(`🖥️ Client    : ${process.env.CLIENT_URL}`);
      console.log("=========================================");
    });

    initializeSocket(server);
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();