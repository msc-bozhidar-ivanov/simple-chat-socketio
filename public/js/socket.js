import {
  renderMessage,
  renderRoomList,
  renderUsersOnline,
  updateRoomHeader,
  showTypingIndicator,
  showRoomDeleted,
} from "./ui.js";

export let socket = null;
let currentUserName = "";

export function initSocket(userName) {
  socket = io();
  currentUserName = userName;
  socket.emit("new user", userName);

  socket.on("typing", ({ userName, isTyping }) => {
    showTypingIndicator(userName, isTyping);
  });

  socket.on("users online", renderUsersOnline);
  socket.on("room list", renderRoomList);
  socket.on("send message", renderMessage);
  socket.on("send room message", renderMessage);

  socket.on("join room success", (msg, roomName) => {
    updateRoomHeader(roomName);
    renderMessage({
      username: "System",
      message: msg,
      time: new Date().toLocaleTimeString(),
    });
  });

  socket.on("room deleted", showRoomDeleted);
}

export function getCurrentUser() {
  return currentUserName;
}
