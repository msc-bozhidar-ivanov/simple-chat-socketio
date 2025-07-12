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

// Track rooms
const rooms = new Map(); // roomName -> Set(socketId)
rooms.set("Global Chat", new Set());

function updateRoomList() {
  const roomMap = {};
  for (const [room, sockets] of rooms.entries()) {
    roomMap[room] = sockets.size;
  }
  io.emit("room list", roomMap);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Default join Global Chat
  socket.join("Global Chat");
  rooms.get("Global Chat").add(socket.id);

  // Global chat message
  socket.on("send message", (msg) => {
    io.to("Global Chat").emit("send message", {
      username: msg.username,
      message: msg.message
    });
  });

  // Room chat message
  socket.on("send room message", (msg) => {
    if (msg.room && rooms.has(msg.room)) {
      io.to(msg.room).emit("send room message", {
        username: msg.username,
        message: msg.message
      });
    }
  });

  // Join room request
  socket.on("join room request", (roomName) => {
    if (!roomName) return;

    let prevRoom;
    for (const [room, members] of rooms.entries()) {
      if (members.has(socket.id)) {
        prevRoom = room;
        break;
      }
    }

    if (prevRoom) {
      rooms.get(prevRoom).delete(socket.id);
      socket.leave(prevRoom);
    }

    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
    }

    rooms.get(roomName).add(socket.id);
    socket.join(roomName);

    socket.emit(
      "join room success",
      `You successfully joined room: ${roomName}`,
      roomName
    );
    updateRoomList();
  });

  // Delete room request
  socket.on("delete room", (roomName) => {
    if (!roomName || roomName === "Global Chat") return;
    if (!rooms.has(roomName)) return;

    const socketIds = rooms.get(roomName);
    for (const sockId of socketIds) {
      const sock = io.sockets.sockets.get(sockId);
      if (sock) {
        rooms.get("Global Chat").add(sockId);
        sock.leave(roomName);
        sock.join("Global Chat");
        sock.emit("room deleted", roomName);
        sock.emit(
          "join room success",
          "You are now in Global Chat",
          "Global Chat"
        );
      }
    }

    rooms.delete(roomName);
    updateRoomList();
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    for (const [room, members] of rooms.entries()) {
      members.delete(socket.id);
    }
    updateRoomList();
  });

  updateRoomList();
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
