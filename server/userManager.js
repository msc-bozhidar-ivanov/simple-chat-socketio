import { rooms, updateRoomList } from "./roomManager.js";

/* ------------- in‑memory store ------------- */
const users = new Map(); // socketId → { userName, room }

/* ------------- broadcast helpers ---------- */
export function broadcastUsers(io) {
  const names = Array.from(users.values())
    .map((u) => u.userName)
    .filter(Boolean);
  io.emit("users online", names);
}

/* ------------- user operations ------------- */
export function addUser(socketId) {
  users.set(socketId, { userName: null, room: "Global Chat" });
  rooms.get("Global Chat").add(socketId); // default room
}

export function setUserName(socketId, userName = "Anonymous") {
  const user = users.get(socketId);
  if (user) {
    user.userName = userName;
    users.set(socketId, user);
  }
}

export function getUser(socketId) {
  return users.get(socketId);
}

export function setUserRoom(socketId, roomName) {
  const user = users.get(socketId);
  if (user) {
    user.room = roomName;
    users.set(socketId, user);
  }
}

/* remove user and clean maps */
export function removeUser(io, socketId) {
  const user = users.get(socketId);
  if (!user) return;

  const { room } = user;
  if (rooms.has(room)) rooms.get(room).delete(socketId);

  users.delete(socketId);
  broadcastUsers(io);
  updateRoomList(io);
}

/* ------------- exports ------------- */
export { users };
