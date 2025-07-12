const socket = io();

const userEl = document.getElementById("user");
const textEl = document.getElementById("text");
const chatBoxEl = document.getElementById("chat-box");
const roomNameEl = document.getElementById("room-name");
const roomEl = document.getElementById("room");

let currentRoom = "global"; // start in global

socket.on("send message", (msg) => {
  const pEl = document.createElement("p");
  pEl.textContent = `${msg.username}: ${msg.message}`;
  chatBoxEl.appendChild(pEl);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
});

socket.on("join room success", (msg, roomName) => {
  currentRoom = roomName;
  roomEl.textContent = roomName;
  chatBoxEl.textContent = ""; // Clear old messages
  const pEl = document.createElement("p");
  pEl.textContent = msg;
  chatBoxEl.appendChild(pEl);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
});

function sendMessage() {
  const userName = userEl.value.trim();
  const message = textEl.value.trim();
  if (!userName || !message) return;

  socket.emit("send message", {
    username: userName,
    message: message,
  });

  textEl.value = "";
}

function joinRoom() {
  const room = roomNameEl.value.trim();
  if (!room) return;

  socket.emit("join room request", room);
}
