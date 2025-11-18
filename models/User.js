import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: { type: String, unique: true },
  password: String,
  roles: { type: [String], default: ["buyer"] } // <-- make roles an array
});

export default mongoose.model("User", userSchema);
