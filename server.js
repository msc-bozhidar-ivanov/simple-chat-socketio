const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("node:http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const PORT = 3000;

const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Default to global chat
  const GLOBAL_ROOM = "global";
  socket.join(GLOBAL_ROOM);
  socket.data.room = GLOBAL_ROOM;

  socket.on("send message", (msg) => {
    const room = socket.data.room || GLOBAL_ROOM;

    io.to(room).emit("send message", {
      username: msg.username,
      message: msg.message,
    });
  });

  socket.on("join room request", (roomName) => {
    if (!roomName) return;

    const currentRoom = socket.data.room || GLOBAL_ROOM;

    // Leave current room
    socket.leave(currentRoom);

    // Join new room
    socket.join(roomName);
    socket.data.room = roomName;

    socket.emit(
      "join room success",
      `You successfully joined room: ${roomName}`,
      roomName
    );
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
