const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  cname: {
    type: String,
    required: true,
    unique: true,
  },
  image: { type: String, required: true },
  Type: { type: String, required: true },
  discount:{ type: Number, default: 0 },
  is_deleted: { type: Number, default: 0 },
  stock: {
    type: Number,
    default: 0,
  },
});

const Category = new mongoose.model("Category", categorySchema);

module.exports = Category;
