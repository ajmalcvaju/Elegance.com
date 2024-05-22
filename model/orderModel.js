const mongoose = require("mongoose");
const Address = require("../model/addressModel");

const orderItemSchema = new mongoose.Schema({
  orderId: {
    type: String,
    default: "#",
  },
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
  },
  status: {
    type: String,
    default: "Pending",
  },
  date: {
    type: String,
    default: formatDate(new Date()),
  },
  expectedArrival: {
    type: String,
    default: expectedDate(new Date()),
  },
  paymentMethod: {
    type: String,
    default: "COD",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
function expectedDate(date) {
  const day = String(date.getDate() + 3).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
  },

  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
