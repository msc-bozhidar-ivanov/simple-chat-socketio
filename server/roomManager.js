import { Room } from "../db/models/room.js";
import { broadcastUsers, getUser, setUserRoom } from "./userManager.js";
import { formatTimestamp } from "./messageUtils.js";

/* ------------- in‑memory store ------------- */
const rooms = new Map(); // roomName → Set(socketId)
rooms.set("Global Chat", new Set());

/* ------------- broadcast helper ------------ */
export async function updateRoomList(io) {
  const map = {};
  for (const [room, sockets] of rooms.entries()) map[room] = sockets.size;
  io.emit("room list", map);
}

/* ------------- room operations ------------- */
export async function joinRoom(io, socket, roomName) {
  if (!roomName) return;
  const user = await getUser(socket.id);
  if (!user) return;

  // leave previous
  if (rooms.has(user.room)) {
    rooms.get(user.room).delete(socket.id);
    socket.leave(user.room);
  }

  // create or join new
  if (!rooms.has(roomName)) {
    rooms.set(roomName, new Set());
    await Room.updateOne(
      { name: roomName },
      { $setOnInsert: { name: roomName } },
      { upsert: true }
    );
  }
  rooms.get(roomName).add(socket.id);
  socket.join(roomName);

  await setUserRoom(socket.id, roomName);
  await updateRoomList(io);
}

export async function deleteRoom(io, socket, roomName) {
  if (!roomName || roomName === "Global Chat") return;
  if (!rooms.has(roomName)) return;

  const members = rooms.get(roomName);

  for (const socketid of members) {
    await setUserRoom(socketid, "Global Chat");
    rooms.get("Global Chat").add(socketid);

    const s = io.sockets.sockets.get(socketid);
    if (s) {
      s.leave(roomName);
      s.join("Global Chat");
      s.emit("room deleted", roomName);
      s.emit("join room success", {
        username: "System",
        roomName: "Global Chat",
        message: "You are now in Global Chat",
        time: formatTimestamp(),
      });
    }
  }

  rooms.delete(roomName);
  await updateRoomList(io);
  await broadcastUsers(io);
}

/* ------------- exports ------------- */
export { rooms };
