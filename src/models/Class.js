import mongoose from "mongoose";

const classSchema = new mongoose.Schema({
  className: { type: String, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  studentIds: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.model("Class", classSchema); 