const mongoose = require("mongoose");
const Address = require("../model/addressModel");

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  category: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
  },
  priceBeforeOffer: {
    type: Number,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  status: {
    type: String,
    default: "Pending",
  },reasonForCancelation: {
    type: String,
  },
  reasonForReturn: {
    type: String,
  }
});

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${year}-${month}-${day}`;
}
function expectedDate(date) {
  const day = String(date.getDate() + 3).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const counterSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true,
  },
  seq: {
    type: Number,
    default: 1000,
  },
});
const Counter = mongoose.model("Counter", counterSchema);

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    unique: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  items: [orderItemSchema],
  totalPrice: {
    type: Number,
  },
  date: {
    type: String,
    default: formatDate(new Date()),
  },
  expectedArrival: {
    type: String,
    default: expectedDate(new Date()),
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Address",
  },
  status: {
    type: String,
    default: "Pending",
  },
  paymentMethod: {
    type: String,
  },
  paymentStatus: {
    type: String,
  },
  productQuantity: {
    type: Number,
  },
  totalPrice: {
    type: Number,
  },
  discount: {
    type: Number,
  },
  discountedPrice: {
    type: Number,
  },
  gst: {
    type: Number,
  },
  totalPriceIncludingGst: {
    type: Number,
  },
  shippingCharge: {
    type: Number,
  },
  totalAmountPay: {
    type: Number,
  },
  couponDiscount: {
    type: Number,
  },
  priceAfterCoupon: {
    type: Number,
  },
  reasonForCancelation: {
    type: String,
  },
  reasonForReturn: {
    type: String,
  },
  cancelledOrReturnedProductPrice:Number,
  priceAfterCancellationOrReturn:Number
});

orderSchema.pre("save", async function (next) {
  const order = this;
  if (order.isNew) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        { _id: "orderId" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const orderNumber = String(counter.seq).padStart(4, "0");
      order.orderId = `ORD${orderNumber}`;
      order.productQuantity = order.items.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
