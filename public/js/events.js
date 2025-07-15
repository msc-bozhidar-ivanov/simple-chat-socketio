import { socket, getCurrentUser } from "./socket.js";

const textEl = document.getElementById("text");
const roomNameEl = document.getElementById("room-name");
const roomEl = document.getElementById("room");
const sendBtnEl = document.getElementById("send-btn");
const joinBtnEl = document.getElementById("join-btn");

let typingTimer;

export function setupEventListeners() {
  textEl.addEventListener("input", () => {
    socket.emit("typing", true);
    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      socket.emit("typing", false);
    }, 1000);
  });

  sendBtnEl.addEventListener("click", sendMessage);
  joinBtnEl.addEventListener("click", joinRoom);
}

export function sendMessage() {
  const message = textEl.value.trim();
  if (!message) return;

  const payload = {
    username: getCurrentUser(),
    message,
    time: new Date().toLocaleTimeString(),
    room:
      roomEl.textContent.trim() !== "Global Chat"
        ? roomEl.textContent.trim()
        : null,
  };

  socket.emit(payload.room ? "send room message" : "send message", payload);
  socket.emit("typing", false);
  textEl.value = "";
}

export function joinRoom() {
  const room = roomNameEl.value.trim();
  if (room) socket.emit("join room request", room);
}
