const Order = require("../model/orderModel");
const Wallet=require("../model/walletModel");


const adminOrder = async (req, res) => {
  try {
    const order = await Order.find({})
      .populate("items.productId")
      .populate("userId").sort({orderId:-1});
    console.log(order);
    res.render("admin/orders", { order });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const manageOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const productId = req.query.productId;
    res.render("admin/manageOrders", { orderId, productId });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const updateOrder = async (req, res) => {
  try {
    const expectedArrival = req.body.expectedArrival;
    const orderStatus = req.body.orderStatus;
    const orderId = req.query.orderId;
    console.log(req.body);
    const orders = await Order.findOne({orderId});
    if (orders.paymentStatus === "Successfull" && 
      (orderStatus === "Cancellation Completed" || orderStatus === "Return Completed" ||orderStatus === "Rejected")) {
        const order = await Order.updateOne(
          { orderId: orderId },
          {
            $set: {
              status: orderStatus,
              expectedArrival: expectedArrival,
              paymentStatus:"Refunded"
            },
          }
        );
        const wallet = await Wallet.findOneAndUpdate(
          { userId: orders.userId }, 
          { $set: { amount: orders.totalAmountPay } }, 
          { upsert: true, new: true, setDefaultsOnInsert: true } 
        );
        
  }
    const order = await Order.updateOne(
      { orderId: orderId },
      {
        $set: {
          status: orderStatus,
          expectedArrival: expectedArrival,
        },
      }
    );
    
    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const orderDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findOne({ orderId })
      .populate("items.productId")
      .populate("userId")
      .populate("addressId");
    res.render("admin/orderDetails", { order });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const error = async (req, res) => {
  res.redirect("/admin/error");
};

module.exports = { adminOrder, manageOrder, updateOrder, orderDetails, error };
