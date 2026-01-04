import mongoose from "mongoose";
import dotenv  from "dotenv";

dotenv.config();

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo connection failed", err);
    process.exit(1); // if db fails -> app should not start.
  }
}