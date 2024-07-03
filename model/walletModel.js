const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  amount: { type: Number },
  date: { type: Date, default: Date.now },
  reasson:String
});

transactionSchema.virtual('formattedDate').get(function() {
  const day = String(this.date.getDate()).padStart(2, '0');
  const month = String(this.date.getMonth() + 1).padStart(2, '0');
  const year = this.date.getFullYear();
  return `${day}/${month}/${year}`;
});

const walletSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, default: 0 },
  transactions: [transactionSchema] 
});

const Wallet = mongoose.model('Wallet', walletSchema);

module.exports = Wallet;
