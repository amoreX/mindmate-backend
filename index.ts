const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: { origin: "*" },
});

const PORT = process.env.PORT || 4001;

const users: { [key: string]: string[] } = {};

io.on("connection", (socket) => {
    console.log("user connected");

    // client joins a specific room
    socket.on("join-room", (roomnumber, callback) => {
        try {
            const { username, roomnum } = roomnumber;
            console.log(roomnumber);
            socket.join(roomnum);

            if (!users[roomnum]) {
                users[roomnum] = [];
            }

            if (!users[roomnum].includes(username)) {
                users[roomnum].push(username);
            }

            console.log(`${username} joined room ${roomnum}`);
            io.to(roomnum).emit("update-users", users[roomnum]);
            socket.to(roomnum).emit("update-users", users[roomnum]);
            callback({ success: true });
        } catch (err) {
            console.error(err);
            callback({ success: false, error: err.message });
        }
    });

    // client sends message to specific room
    socket.on("send-message", (roomnumber) => {
        const { username, message, roomnum } = roomnumber;
        console.log(`In room ${roomnum}, ${username}: ${message}`);
        socket.to(roomnum).emit("message", `${username}: ${message}`);
    });

    socket.on("disconnecting", () => {
        for (const room of socket.rooms) {
            if (users[room]) {
                // Find and remove user
                users[room] = users[room].filter((user) => user !== socket.id);
                io.to(room).emit("update-users", users[room]);
                socket.to(room).emit("update-users", users[room]);
            }
        }
    });

    socket.on("disconnect", () => {
        console.log("user-disconnected");
        for (const room of socket.rooms) {
            if (users[room]) {
                // Find and remove user
                users[room] = users[room].filter((user) => user !== socket.id);
                io.to(room).emit("update-users", users[room]);
                socket.to(room).emit("update-users", users[room]);
            }
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
