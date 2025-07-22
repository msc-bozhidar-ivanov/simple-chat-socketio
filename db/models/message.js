import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  username: { type: String, required: true },
  room: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, default: Date.now },
});

export const Message = mongoose.model("Message", messageSchema);
