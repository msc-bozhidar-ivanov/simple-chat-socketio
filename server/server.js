import express from "express";
import cors from "cors";
import path from "path";
import http from "node:http";
import { Server } from "socket.io";
import { connectDB } from "../db/db.js";

import { handleSocketConnection } from "./socketHandler.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = 3000;

/* middleware */
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

/* Socket.IO */
const io = new Server(server);

io.on("connection", (socket) => {
  handleSocketConnection(io, socket);
});

await connectDB();

server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
