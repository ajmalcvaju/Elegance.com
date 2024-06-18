const mongoose = require("mongoose");

const LogInSchema = new mongoose.Schema({
  username: String,
  email: String,
  fname: String,
  lname: String,
  mobileNumber: String,
  password: String,
  image: String,
  is_admin: Number,
  is_verified: { type: Number, default: 0 },
  is_blocked: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  googleId: String,
  profilePhoto: String,
});

const User = mongoose.model("User", LogInSchema);

module.exports = User;
