const Order = require("../model/orderModel");

const adminOrder = async (req, res) => {
  try {
    const order = await Order.find({})
      .populate("items.productId")
      .populate("userId");
    console.log(order);
    res.render("admin/orders", { order });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
};
const manageOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const productId = req.query.productId;
    res.render("admin/manageOrders", { orderId, productId });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
};
const updateOrder = async (req, res) => {
  try {
    const expectedArrival = req.body.expectedArrival;
    const orderStatus = req.body.orderStatus;
    const orderId=req.query.orderId
    console.log(req.body)
    const order = await Order.updateOne(
      { orderId: orderId },
      {
        $set: {
          "status": orderStatus,
          "expectedArrival": expectedArrival
        },
      }
    );
    const orders=await Order.find({})
    console.log(orders)
    res.redirect("/admin/orders");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
};
const orderDetails=async(req,res)=>{
  try {
    const orderId=req.query.orderId
    const order=await Order.findOne({orderId}).populate("items.productId").populate("userId").populate("addressId");
    res.render("admin/orderDetails",{order})
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
}
const error=async(req,res)=>{
  res.render("admin/errorPage")
}

module.exports = { adminOrder, manageOrder, updateOrder,orderDetails,error };
