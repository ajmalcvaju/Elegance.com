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
  referralCode: { type: String, unique: true }
});

LogInSchema.pre('save', function (next) {
  if (!this.referralCode) {
    this.referralCode = generateReferralCode();
  }
  next();
});

function generateReferralCode() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';

  let referralCode = '';

  for (let i = 0; i < 3; i++) {
    referralCode += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  
  for (let i = 0; i < 3; i++) {
    referralCode += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }

  // Shuffle the string to mix letters and numbers
  referralCode = referralCode.split('').sort(() => 0.5 - Math.random()).join('');

  return referralCode;
}

const User = mongoose.model("User", LogInSchema);

module.exports = User;
