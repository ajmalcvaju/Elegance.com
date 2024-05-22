const mongoose = require("mongoose");
const Product = require("../model/productModel");

const cartItemSchema = new mongoose.Schema({
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
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [cartItemSchema],
  totalPrice: {
    type: Number,
  },
});

cartItemSchema.pre("save", async function (next) {
  try {
    const product = await Product.findById(this.productId);
    if (!product) {
      throw new Error("Product not found");
    }
    this.price = product.discountedPrice * this.quantity;
    next();
  } catch (error) {
    next(error);
  }
});

cartSchema.pre("save", function (next) {
  let totalPrice = 0;
  this.items.forEach((item) => {
    totalPrice += item.price || 0; // If price is not set, default to 0
  });
  this.totalPrice = totalPrice;
  next();
});

const Cart = mongoose.model("Cart", cartSchema);

module.exports = Cart;
