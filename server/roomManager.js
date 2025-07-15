const rooms = new Map(); // roomName → Set(socketId)
const users = new Map(); // socketId → { userName, room }

rooms.set("Global Chat", new Set());

/* ---------- helper broadcasts ---------- */
function updateRoomList(io) {
  const roomMap = {};
  for (const [room, sockets] of rooms.entries()) {
    roomMap[room] = sockets.size;
  }
  io.emit("room list", roomMap);
}

function broadcastUsers(io) {
  const list = Array.from(users.values())
    .map((u) => u.userName)
    .filter(Boolean);
  io.emit("users online", list);
}

/* ---------- user / room management ---------- */
function addUser(socketId) {
  users.set(socketId, { userName: null, room: "Global Chat" });
  rooms.get("Global Chat").add(socketId);
}

function setUserName(socketId, userName) {
  const user = users.get(socketId);
  if (user) {
    user.userName = userName || "Anonymous";
    users.set(socketId, user);
  }
}

function getUser(socketId) {
  return users.get(socketId);
}

function joinRoom(io, socket, roomName) {
  if (!roomName) return;
  const user = users.get(socket.id);
  if (!user) return;

  const prevRoom = user.room;
  if (rooms.has(prevRoom)) {
    rooms.get(prevRoom).delete(socket.id);
    socket.leave(prevRoom);
  }

  if (!rooms.has(roomName)) rooms.set(roomName, new Set());
  rooms.get(roomName).add(socket.id);
  socket.join(roomName);

  user.room = roomName;
  users.set(socket.id, user);

  socket.emit(
    "join room success",
    `You successfully joined room: ${roomName}`,
    roomName
  );
  updateRoomList(io);
  broadcastUsers(io);
}

function deleteRoom(io, socket, roomName) {
  if (!roomName || roomName === "Global Chat") return;
  if (!rooms.has(roomName)) return;

  const members = rooms.get(roomName);
  for (const sid of members) {
    const user = users.get(sid);
    if (!user) continue;

    user.room = "Global Chat";
    users.set(sid, user);
    rooms.get("Global Chat").add(sid);

    const s = io.sockets.sockets.get(sid);
    if (s) {
      s.leave(roomName);
      s.join("Global Chat");
      s.emit("room deleted", roomName);
      s.emit("join room success", "You are now in Global Chat", "Global Chat");
    }
  }

  rooms.delete(roomName);
  updateRoomList(io);
  broadcastUsers(io);
}

function removeUser(io, socketId) {
  const user = users.get(socketId);
  if (!user) return;

  const { room } = user;
  if (rooms.has(room)) rooms.get(room).delete(socketId);

  users.delete(socketId);
  broadcastUsers(io);
  updateRoomList(io);
}

/* ---------- Exports ---------- */
export {
  updateRoomList,
  broadcastUsers,
  addUser,
  setUserName,
  getUser,
  joinRoom,
  deleteRoom,
  removeUser,
};
