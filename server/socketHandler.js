import {
  addUser,
  setUserName,
  getUser,
  removeUser,
  broadcastUsers,
  setUserRoom,
} from "./userManager.js";

import { joinRoom, deleteRoom, updateRoomList } from "./roomManager.js";

import { formatTimestamp } from "./messageUtils.js";

import { Message } from "../db/models/message.js";

function handleSocketConnection(io, socket) {
  console.log("User connected:", socket.id);

  // Add the user to the default room on first connection
  addUser(socket.id);
  socket.join("Global Chat");

  /* ---------------- Client‑Side Events ---------------- */

  // Username sent from client
  socket.on("new user", async (userName) => {
    await setUserName(socket.id, userName);
    await broadcastUsers(io);
    await updateRoomList(io);
  });

  // Typing indicator
  socket.on("typing", async (isTyping) => {
    const user = await getUser(socket.id);
    if (!user) return;
    socket.to(user.room).emit("typing", { userName: user.userName, isTyping });
  });

  // Global message
  socket.on("send message", async (msg) => {
    const user = await getUser(socket.id);
    if (!user) return;

    const payload = {
      username: msg.username,
      message: msg.message,
      time: formatTimestamp(),
    };

    io.to("Global Chat").emit("send message", payload);
  });

  // Room‑specific message
  socket.on("send room message", async (msg) => {
    if (!msg.room) return;

    const saved = await Message.create({
      username: msg.username,
      room: msg.room,
      message: msg.message,
    });

    io.to(msg.room).emit("send room message", {
      username: saved.username,
      message: saved.message,
      time: formatTimestamp(saved.time),
    });
  });

  // Join a room
  socket.on("join room request", async (roomName) => {
    await joinRoom(io, socket, roomName);

    const history = await Message.find({ room: roomName })
      .sort({ time: -1 })
      .limit(50) // limit to the last 50 messages
      .lean();

    // send oldest → newest
    const formattedHistory = history.reverse().map((msg) => ({
      ...msg,
      time: formatTimestamp(msg.time),
    }));

    socket.emit("chat history", formattedHistory);
    
    socket.emit("join room success", {
      username: "System",
      roomName,
      message: `You successfully joined room: ${roomName}`,
      time: formatTimestamp(),
    });
  });

  // Delete a room
  socket.on("delete room", async (roomName) => {
    await deleteRoom(io, socket, roomName);
  });

  // Handle disconnect
  socket.on("disconnect", async () => {
    console.log("User disconnected:", socket.id);
    await removeUser(io, socket.id);
  });
}

export { handleSocketConnection };
