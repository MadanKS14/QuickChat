import { Server } from "socket.io";
import jwt from "jsonwebtoken";

export let io;

const userSocketMap = new Map();

export const getOnlineUserIds = () => [...userSocketMap.keys()];

export const emitToUser = (userId, eventName, payload) => {
    const socketIds = userSocketMap.get(userId.toString());

    if (!socketIds) return;

    socketIds.forEach((socketId) => {
        io.to(socketId).emit(eventName, payload);
    });
};

export const initializeSocket = (server) => {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";

    io = new Server(server, {
        cors: {
            origin: clientUrl,
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error("Authentication error"));
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return next(new Error("Authentication error"));
            }

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

        // Typing Indicator
        socket.on("typing", ({ receiverId }) => {
    console.log("========== SERVER ==========");
    console.log("Typing Event Received");
    console.log("Sender :", userId);
    console.log("Receiver :", receiverId);

    emitToUser(receiverId, "typing", {
        senderId: userId,
    });

    console.log("Typing Event Emitted");
});

        socket.on("stopTyping", ({ receiverId }) => {
            emitToUser(receiverId, "stopTyping", {
                senderId: userId,
            });
        });

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

    return io;
};