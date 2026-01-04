import mongoose from "mongoose" 

const attendanceSchema = new mongoose.Schema({
  classId: { type: mongoose.Schema.Types.ObjectId, unique: true },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  status: { type: String, enum: ["present", "absent"] }
})

export default mongoose.model("Attendace", attendanceSchema);