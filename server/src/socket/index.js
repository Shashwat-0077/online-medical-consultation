const socketSetup = (io) => {
    // Add detailed logging to your Socket.io server
    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        // When a user joins a room
        socket.on("join-room", (roomId, userId) => {
            console.log(`User ${userId} (${socket.id}) joined room ${roomId}`);
            socket.join(roomId);

            // Log room participants
            const room = io.sockets.adapter.rooms.get(roomId);
            const numClients = room ? room.size : 0;
            console.log(`Room ${roomId} now has ${numClients} client(s)`);

            // Notify other users in the room
            socket.to(roomId).emit("user-connected", userId);

            // Handle disconnect
            socket.on("disconnect", () => {
                console.log(
                    `User ${userId} (${socket.id}) disconnected from room ${roomId}`
                );
                socket.to(roomId).emit("user-disconnected", userId);
            });
        });

        // For signaling - passing WebRTC offers, answers, and ICE candidates
        socket.on("signal", ({ userId, roomId, signal }) => {
            console.log(
                `Signal from ${userId} in room ${roomId} - signal type: ${
                    signal.type || "unknown"
                }`
            );

            // Check if the room exists
            const room = io.sockets.adapter.rooms.get(roomId);
            if (!room) {
                console.error(
                    `Room ${roomId} does not exist, cannot forward signal`
                );
                return;
            }

            // Forward signal to others in room
            socket.to(roomId).emit("signal", { userId, signal });
            console.log(`Signal forwarded to others in room ${roomId}`);
        });
    });
};

module.exports = socketSetup;
