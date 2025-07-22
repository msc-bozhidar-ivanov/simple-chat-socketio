import mongoose from "mongoose";

// hard coded
const mongoDB = "mongodb://localhost:27017/simple-chat";

export async function connectDB() {
  try {
    await mongoose.connect(mongoDB);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo connection error:", err);
    process.exit(1);
  }
}
