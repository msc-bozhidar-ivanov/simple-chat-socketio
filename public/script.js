const socket = io();

const userEl = document.getElementById("user");
const textEl = document.getElementById("text");
const chatBoxEl = document.getElementById("chat-box");

socket.on("send message", (msg) => {
  const pEl = document.createElement("p");
  pEl.textContent = `${msg.username}: ${msg.message}`;
  chatBoxEl.appendChild(pEl);
  chatBoxEl.scrollTop = chatBoxEl.scrollHeight;
});

function sendMessage() {
  const userName = userEl.value;
  const message = textEl.value.trim();
  if (!userName || !message) return;

  const payload = {
    username: userName,
    message: message,
  };

  socket.emit("send message", payload);

  textEl.value = "";
}
