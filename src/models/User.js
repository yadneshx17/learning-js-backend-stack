import mongoose from "mongoose"

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unqiue: true },
  password: String, // hashed with bcrypt
  role: { type: String, enum: ["teacher", "student"]}
})

export default mongoose.model("User", userSchema);