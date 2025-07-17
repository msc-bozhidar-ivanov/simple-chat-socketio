import {
  addUser,
  setUserName,
  getUser,
  removeUser,
  broadcastUsers,
} from "./userManager.js";

import { joinRoom, deleteRoom, updateRoomList } from "./roomManager.js";

import { formatTimestamp } from "./messageUtils.js";

function handleSocketConnection(io, socket) {
  console.log("User connected:", socket.id);

  // Add the user to the default room on first connection
  addUser(socket.id);
  socket.join("Global Chat");

  /* ---------------- Client‑Side Events ---------------- */

  // Username sent from client
  socket.on("new user", (userName) => {
    setUserName(socket.id, userName);
    broadcastUsers(io);
    updateRoomList(io);
  });

  // Typing indicator
  socket.on("typing", (isTyping) => {
    const user = getUser(socket.id);
    if (!user) return;
    socket.to(user.room).emit("typing", { userName: user.userName, isTyping });
  });

  // Global message
  socket.on("send message", (msg) => {
    io.to("Global Chat").emit("send message", {
      username: msg.username,
      message: msg.message,
      time: msg.time,
    });
  });

  // Room‑specific message
  socket.on("send room message", (msg) => {
    console.log("Received room message:", msg);
    if (!msg.room) return;
    io.to(msg.room).emit("send room message", {
      username: msg.username,
      message: msg.message,
      time: formatTimestamp(),
    });
  });

  // Join a room
  socket.on("join room request", (roomName) => {
    joinRoom(io, socket, roomName);
  });

  // Delete a room
  socket.on("delete room", (roomName) => {
    deleteRoom(io, socket, roomName);
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    removeUser(io, socket.id);
  });
}

export { handleSocketConnection };
