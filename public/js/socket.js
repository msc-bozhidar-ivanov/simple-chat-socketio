import {
  renderMessage,
  renderRoomList,
  renderUsersOnline,
  updateRoomHeader,
  clearChat,
  showTypingIndicator,
  showRoomDeleted,
} from "./ui.js";

export let socket = null;
let currentUserName = "";
let currentRoom = "Global Chat";

export function initSocket(userName, onReady) {
  socket = io();
  currentUserName = userName;

  socket.on("connect", () => {
    socket.emit("new user", userName);
    if (onReady) onReady();
  });

  socket.on("typing", ({ userName, isTyping }) => {
    showTypingIndicator(userName, isTyping);
  });

  socket.on("users online", renderUsersOnline);
  socket.on("room list", renderRoomList);
  socket.on("send message", renderMessage);
  socket.on("send room message", renderMessage);
  socket.on("chat history", (msgs) => {
    clearChat();
    msgs.forEach(renderMessage);
  });

  socket.on("join room success", (msg) => {
    currentRoom = msg.roomName;
    updateRoomHeader(currentRoom);
    renderMessage(msg); // confirmation message
  });

  socket.on("room deleted", (room) => {
    if (currentRoom === room) {
      currentRoom = "Global Chat";
    }
    showRoomDeleted(room);
  });
}

export function getCurrentUser() {
  return currentUserName;
}

export function getCurrentRoom() {
  return currentRoom;
}

export function deleteRoom(room) {
  socket.emit("delete room", room);
}
