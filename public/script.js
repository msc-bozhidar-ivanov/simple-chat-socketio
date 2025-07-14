const socket = io();

const textEl = document.getElementById("text");
const chatBoxEl = document.getElementById("chat-box");
const roomNameEl = document.getElementById("room-name");
const roomEl = document.getElementById("room");
const usersOnlineEl = document.getElementById("users-online");
const roomListEl = document.getElementById("room-list");

const userName = prompt("Enter your name") || "Anonymous";
socket.emit("new user", userName);

// Utility to create and append messages
const appendMessage = ({ username, time, message }) => {
  const p = document.createElement("p");
  p.innerHTML = `${username} <span style="color:#986801;">[${time}]</span>: ${message}`;
  chatBoxEl.appendChild(p);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
};

// Typing indicator setup
const typingIndicatorEl = document.createElement("div");
typingIndicatorEl.className = "text-muted fst-italic mb-2";
chatBoxEl.parentNode.insertBefore(typingIndicatorEl, chatBoxEl.nextSibling);

let typingTimeout;

// Emit typing status with debounce
textEl.addEventListener("input", () => {
  socket.emit("typing", true);
  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => socket.emit("typing", false), 1000);
});

// Show who is typing
socket.on("typing", ({ userName: typingUser, isTyping }) => {
  typingIndicatorEl.textContent = isTyping ? `${typingUser} is typing...` : "";
});

// Render users online
socket.on("users online", (users) => {
  usersOnlineEl.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = user;
    usersOnlineEl.appendChild(li);
  });
});

// Render room list with user count and delete buttons
socket.on("room list", (roomMap) => {
  roomListEl.innerHTML = "";

  Object.entries(roomMap).forEach(([room, count]) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    const roomNameSpan = document.createElement("span");
    roomNameSpan.textContent = `${room} (${count})`;
    roomNameSpan.style.cursor = "pointer";
    roomNameSpan.onclick = () => {
      roomNameEl.value = room;
      joinRoom();
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.disabled = room === "Global Chat";
    deleteBtn.onclick = () => {
      if (confirm(`Delete room "${room}"?`)) {
        socket.emit("delete room", room);
      }
    };

    li.append(roomNameSpan, deleteBtn);
    roomListEl.appendChild(li);
  });
});

// Message listeners
socket.on("send message", appendMessage);
socket.on("send room message", appendMessage);

// Room join confirmation
socket.on("join room success", (msg, roomName) => {
  roomEl.textContent = roomName;
  chatBoxEl.innerHTML = "";
  const p = document.createElement("p");
  p.textContent = msg;
  chatBoxEl.appendChild(p);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
});

// If the current room is deleted
socket.on("room deleted", (deletedRoomName) => {
  if (roomEl.textContent === deletedRoomName) {
    roomEl.textContent = "Global Chat";
    chatBoxEl.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = "The room was deleted. You are now in Global Chat.";
    chatBoxEl.appendChild(p);
  }
});

// Send a message to either current room or global chat
function sendMessage() {
  const message = textEl.value.trim();
  if (!message) return;

  const currentRoom = roomEl.textContent.trim();
  const payload = {
    username: userName,
    message,
    room: currentRoom !== "Global Chat" ? currentRoom : null,
  };

  socket.emit(payload.room ? "send room message" : "send message", payload);
  socket.emit("typing", false);
  textEl.value = "";
}

// Join a room from input
function joinRoom() {
  const room = roomNameEl.value.trim();
  if (room) socket.emit("join room request", room);
}
