import { users, broadcastUsers, setUserRoom } from "./userManager.js";

/* ------------- in‑memory store ------------- */
const rooms = new Map(); // roomName → Set(socketId)
rooms.set("Global Chat", new Set());

/* ------------- broadcast helper ------------ */
function updateRoomList(io) {
  const map = {};
  for (const [room, sockets] of rooms.entries()) map[room] = sockets.size;
  io.emit("room list", map);
}

/* ------------- room operations ------------- */
function joinRoom(io, socket, roomName) {
  if (!roomName) return;
  const user = users.get(socket.id);
  if (!user) return;

  // leave previous
  if (rooms.has(user.room)) {
    rooms.get(user.room).delete(socket.id);
    socket.leave(user.room);
  }

  // create or join new
  if (!rooms.has(roomName)) rooms.set(roomName, new Set());
  rooms.get(roomName).add(socket.id);
  socket.join(roomName);

  setUserRoom(socket.id, roomName);

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
    setUserRoom(sid, "Global Chat");
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

/* ------------- exports ------------- */
export { rooms, updateRoomList, joinRoom, deleteRoom };
