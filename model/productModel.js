const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pname: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  discount: { type: Number, required: true, default: 0 },
  actualDiscount: { type: Number, required: true },
  purchase: { type: Number, required: true },
  image: { type: [String], required: true },
  category: { type: String, required: true },
  discountedPrice: { type: Number, required: true },
  is_deleted: { type: Number, default: 0 },
  soldCount: { type: Number },
  PurchaseDate: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
