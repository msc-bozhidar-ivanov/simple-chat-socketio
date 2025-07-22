import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  sockets: [{ type: String }],
});

export const Room = mongoose.model("Room", roomSchema);