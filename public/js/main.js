import { initSocket } from "./socket.js";
import { setupEventListeners } from "./events.js";

const userName = prompt("Enter your name") || "Anonymous";
initSocket(userName);
setupEventListeners();
