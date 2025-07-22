import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  socketId: { type: String, required: true, unique: true },
  userName: { type: String, default: "Anonymous" },
  room: { type: String, default: "Global Chat" },
});

export const User = mongoose.model("User", userSchema);