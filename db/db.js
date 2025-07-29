import mongoose from "mongoose";
import { config } from "../config/config.js";

export async function connectDB() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo connection error:", err);
    process.exit(1);
  }
}
