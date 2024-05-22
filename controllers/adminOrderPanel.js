const Order = require("../model/orderModel");

const adminOrder = async (req, res) => {
  try {
    const order = await Order.find({})
      .populate("items.productId")
      .populate("items.userId");
    console.log(order);
    res.render("admin/orders", { order });
  } catch {
    console.log(error.message);
  }
};
const manageOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const productId = req.query.productId;
    res.render("admin/manageOrders", { orderId, productId });
  } catch (error) {
    console.log(error.message);
  }
};
const updateOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const productId = req.query.productId;
    const expectedArrival = req.body.expectedArrival;
    const orderStatus = req.body.orderStatus;
    const order = await Order.updateOne(
      { _id: orderId, "items.productId": productId },
      {
        $set: {
          "items.$.status": orderStatus,
          "items.$.expectedArrival": expectedArrival
        },
      }
    );
    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = { adminOrder, manageOrder, updateOrder };
