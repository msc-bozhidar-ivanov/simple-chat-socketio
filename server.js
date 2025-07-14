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

// Track users and rooms
const users = new Map(); // socketId -> { userName, room }
const rooms = new Map(); // roomName -> Set(socketId)
rooms.set("Global Chat", new Set());

function updateRoomList() {
  const roomMap = {};
  for (const [room, sockets] of rooms.entries()) {
    roomMap[room] = sockets.size;
  }
  io.emit("room list", roomMap);
}

function broadcastUsers() {
  const userList = Array.from(users.values())
    .map((u) => u.userName)
    .filter(Boolean);
  io.emit("users online", userList);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Assign default user data
  users.set(socket.id, { userName: null, room: "Global Chat" });
  rooms.get("Global Chat").add(socket.id);
  socket.join("Global Chat");

  // New user sends username
  socket.on("new user", (userName) => {
    const userData = users.get(socket.id);
    userData.userName = userName || "Anonymous";
    users.set(socket.id, userData);
    broadcastUsers();
    updateRoomList();
  });

  // Global chat message
  socket.on("send message", (msg) => {
    io.to("Global Chat").emit("send message", {
      username: msg.username,
      message: msg.message,
    });
  });

  // Room chat message
  socket.on("send room message", (msg) => {
    if (msg.room && rooms.has(msg.room)) {
      io.to(msg.room).emit("send room message", {
        username: msg.username,
        message: msg.message,
      });
    }
  });

  // Join room request
  socket.on("join room request", (roomName) => {
    if (!roomName) return;

    const userData = users.get(socket.id);
    if (!userData) return;

    const prevRoom = userData.room || "Global Chat";

    // Leave old room
    if (rooms.has(prevRoom)) {
      rooms.get(prevRoom).delete(socket.id);
      socket.leave(prevRoom);
    }

    if (!rooms.has(roomName)) {
      rooms.set(roomName, new Set());
    }

    rooms.get(roomName).add(socket.id);
    socket.join(roomName);

    userData.room = roomName;
    users.set(socket.id, userData);

    socket.emit(
      "join room success",
      `You successfully joined room: ${roomName}`,
      roomName
    );
    updateRoomList();
    broadcastUsers();
  });

  // Delete room request
  socket.on("delete room", (roomName) => {
    if (!roomName || roomName === "Global Chat") return;
    if (!rooms.has(roomName)) return;

    const socketIds = rooms.get(roomName);
    for (const sockId of socketIds) {
      const userData = users.get(sockId);
      if (userData) {
        userData.room = "Global Chat";
        users.set(sockId, userData);
        rooms.get("Global Chat").add(sockId);

        const sock = io.sockets.sockets.get(sockId);
        if (sock) {
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
    }

    rooms.delete(roomName);
    updateRoomList();
    broadcastUsers();
  });

  // Disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    const userData = users.get(socket.id);
    if (userData) {
      const room = userData.room || "Global Chat";
      if (rooms.has(room)) {
        rooms.get(room).delete(socket.id);
      }
      users.delete(socket.id);
      broadcastUsers();
      updateRoomList();
    }
  });

  updateRoomList();
  broadcastUsers();
});

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
