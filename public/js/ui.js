import { deleteRoom } from "./socket.js";
import { joinRoom } from "./events.js";

const chatBoxEl = document.getElementById("chat-box");
const roomNameEl = document.getElementById("room-name");
const roomEl = document.getElementById("room");
const usersOnlineEl = document.getElementById("users-online");
const roomListEl = document.getElementById("room-list");

const typingIndicatorEl = document.createElement("div");
typingIndicatorEl.className = "text-muted fst-italic mb-2";
chatBoxEl.parentNode.insertBefore(typingIndicatorEl, chatBoxEl.nextSibling);

export function renderMessage(msg) {
  const p = document.createElement("p");
  p.innerHTML = `${msg.username} <span style="color:#986801;">[${msg.time}]</span>: ${msg.message}`;
  chatBoxEl.appendChild(p);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
}

export function showTypingIndicator(user, isTyping) {
  typingIndicatorEl.textContent = isTyping ? `${user} is typing...` : "";
}

export function renderUsersOnline(users) {
  usersOnlineEl.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.textContent = user;
    usersOnlineEl.appendChild(li);
  });
}

export function renderRoomList(roomMap) {
  roomListEl.innerHTML = "";
  for (const [room, count] of Object.entries(roomMap)) {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";

    const nameSpan = document.createElement("span");
    nameSpan.textContent = `${room} (${count})`;
    nameSpan.style.cursor = "pointer";
    nameSpan.onclick = () => {
      roomNameEl.value = room;
      joinRoom();
    };

    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-danger";
    delBtn.textContent = "Delete";
    delBtn.disabled = room === "Global Chat";
    delBtn.onclick = () => {
      if (confirm(`Delete room "${room}"?`)) {
        deleteRoom(room);
      }
    };

    li.appendChild(nameSpan);
    if (!(room === "Global Chat")) li.appendChild(delBtn);
    roomListEl.appendChild(li);
  }
}

export function updateRoomHeader(roomName) {
  roomEl.textContent = roomName;
}

export function showRoomDeleted(deletedRoom) {
  if (roomEl.textContent === deletedRoom) {
    roomEl.textContent = "Global Chat";
    chatBoxEl.innerHTML = "";
    const p = document.createElement("p");
    p.textContent = "The room was deleted. You are now in Global Chat.";
    chatBoxEl.appendChild(p);
  } 
}

export function clearChat() {
  chatBoxEl.innerHTML = "";
}