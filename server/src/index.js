const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

// Create Express app
const app = express();
app.use(cors());
app.use(express.json());

// Create HTTP server using the Express app
const server = http.createServer(app);

// Initialize Socket.IO with the HTTP server
const io = new Server(server, {
    cors: {
        origin: process.env.NEXT_PUBLIC_BACKEND_URL,
        methods: ["GET", "POST"],
        credentials: true,
    },
});

io.on("connection", (socket) => {
    console.log("A user connected with ID:", socket.id);

    // Handle socket events here
    socket.on("disconnect", () => {
        console.log("A user disconnected");
    });

    socket.on("room:join", (roomId) => {
        // TODO : check if the user belongs to the room

        io.to(roomId).emit("user:joined", socket.id);
        socket.join(roomId);
        io.to(socket.id).emit("room:joined", roomId);
        console.log(`User with ID: ${socket.id} joined room: ${roomId}`);
    });

    socket.on("room:leave", (roomId) => {
        io.to(roomId).emit("user:left", socket.id);
        socket.leave(roomId);
        io.to(socket.id).emit("room:left", roomId);
        console.log(`User with ID: ${socket.id} left room: ${roomId}`);
    });

    socket.on("call:offer", ({ offer, toUserId }) => {
        io.to(toUserId).emit("call:incoming", {
            offer,
            fromUserId: socket.id,
        });
    });

    socket.on("call:answer", ({ answer, toUserId }) => {
        io.to(toUserId).emit("call:answered", {
            answer,
            fromUserId: socket.id,
        });
    });

    socket.on("peer:negotiation", ({ offer, toUserId }) => {
        io.to(toUserId).emit("peer:negotiation", {
            offer,
            fromUserId: socket.id,
        });
    });

    socket.on("peer:negotiation:done", ({ answer, toUserId }) => {
        io.to(toUserId).emit("peer:negotiation:final", {
            answer,
            fromUserId: socket.id,
        });
    });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
