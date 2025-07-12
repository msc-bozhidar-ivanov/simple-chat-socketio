const socket = io();

const textEl = document.getElementById("text");
const chatBoxEl = document.getElementById("chat-box");
const roomNameEl = document.getElementById("room-name");
const roomEl = document.getElementById("room");
const roomListEl = document.getElementById("room-list");

const userName = prompt("Enter your name") || "Anonymous";
socket.emit("new user", userName);

socket.on("users online", (users) => {
  usersOnlineEl.textContent = "";
  users.forEach((user) => {
    const liEl = document.createElement("li");
    liEl.textContent = user;
    usersOnlineEl.appendChild(liEl);
  });
});

socket.on("room list", (roomMap) => {
  roomListEl.textContent = "";
  for (const [room, count] of Object.entries(roomMap)) {
    const liEl = document.createElement("li");
    const roomNameSpan = document.createElement("span");
    roomNameSpan.textContent = `${room} (${count})`;
    roomNameSpan.style.cursor = "pointer";
    roomNameSpan.onclick = () => {
      roomNameEl.value = room;
      joinRoom();
    };

    liEl.appendChild(roomNameSpan);
    roomListEl.appendChild(liEl);
  }
});

socket.on("send message", (msg) => {
  const pEl = document.createElement("p");
  pEl.textContent = `${msg.username}: ${msg.message}`;
  chatBoxEl.appendChild(pEl);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
});

socket.on("send room message", (msg) => {
  const pEl = document.createElement("p");
  pEl.textContent = `${msg.username}: ${msg.message}`;
  chatBoxEl.appendChild(pEl);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
});

socket.on("join room success", (msg, roomName) => {
  roomEl.textContent = roomName;
  chatBoxEl.textContent = ""; // Clear old messages
  const pEl = document.createElement("p");
  pEl.textContent = msg;
  chatBoxEl.appendChild(pEl);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
});

function sendMessage() {
  const message = textEl.value.trim();
  if (!message) return;

  const currentRoom = roomEl.textContent.trim();
  const payload = {
    username: userName,
    message: message,
    room: currentRoom !== "Global Chat" ? currentRoom : null,
  };

  if (payload.room) {
    socket.emit("send room message", payload);
  } else {
    socket.emit("send message", payload);
  }

  textEl.value = "";
}

function joinRoom() {
  const room = roomNameEl.value.trim();
  if (!room) return;

  socket.emit("join room request", room);
}
