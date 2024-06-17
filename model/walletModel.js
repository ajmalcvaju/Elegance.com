const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: Number, required: true,default:0 },
});



const wallet = mongoose.model("wallet", walletSchema);
module.exports = wallet;
