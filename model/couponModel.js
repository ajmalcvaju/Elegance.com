const mongoose = require("mongoose");

// Function to format date as dd/mm/yyyy
function formatDate(date) {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0'); // January is 0
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

const couponSchema = new mongoose.Schema({
  couponCode: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    required: true,
  },
  minPurchaseAmount: {
    type: Number,
    required: true,
  },
  discount: {
    type: Number,
    required: true,
  },
  expiryDate: {
    type: Date,
    required: true,
    get: formatDate
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  usedUsers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;
