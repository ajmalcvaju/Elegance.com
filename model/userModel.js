const mongoose = require("mongoose");

const LogInSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  fname: { type: String, required: true },
  lname: { type: String, required: true },
  mobileNumber: { type: String, required: true },
  password: { type: String, required: true },
  image: { type: String, required: true },
  is_admin: { type: Number, required: true },
  is_verified: { type: Number, default: 0 },
  is_blocked: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model("User", LogInSchema);

module.exports = User;
