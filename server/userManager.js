import { User } from "../db/models/user.js";

/* ------------- in‑memory store ------------- */
const users = new Map(); // socketId → { userName, room }

/* ------------- broadcast helpers ---------- */
export async function broadcastUsers(io) {
  const names = Array.from(users.values())
    .map((u) => u.userName)
    .filter(Boolean);
  io.emit("users online", names);
}

/* ------------- user operations ------------- */
export async function addUser(socketId) {
  const user = await User.create({
    socketId,
    userName: null,
    room: "Global Chat",
  });

  users.set(socketId, user.toObject());
}

export async function setUserName(socketId, userName = "Anonymous") {
  const user = users.get(socketId);
  if (user) {
    user.userName = userName;
    await User.updateOne({ socketId }, { userName });
    users.set(socketId, user);
  }
}

export async function getUser(socketId) {
  if (users.has(socketId)) return users.get(socketId);

  const user = await User.findOne({ socketId }).lean();
  if (user) users.set(socketId, user);
  return user;
}

export async function setUserRoom(socketId, roomName) {
  const user = users.get(socketId);
  if (user) {
    user.room = roomName;
    await User.updateOne({ socketId }, { room: roomName });
    users.set(socketId, user);
  }
}

/* remove user and clean maps */
export async function removeUser(io, socketId) {
  const user = users.get(socketId);
  if (!user) return;

  await User.deleteOne({ socketId });
  users.delete(socketId);
  await broadcastUsers(io);
}

/* ------------- exports ------------- */
export { users };
