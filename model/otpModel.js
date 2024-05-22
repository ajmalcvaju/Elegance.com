const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  otp: { type: String, required: true },
  createdAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
});
const cappedOptions = {
  capped: { size: 1000000, max: 1 },
};
otpSchema.set("capped", cappedOptions);

const OTPcode = mongoose.model("OTPcode", otpSchema);
module.exports = OTPcode;
