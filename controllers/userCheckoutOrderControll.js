const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Coupon= require("../model/couponModel");
const Cart=require("../model/cartModel");

const checkoutAddAddress = async (req, res) => {
  try {
    const { houseName, street, district, state, pincode, addressType } =
      req.body;
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    console.log(userId);
    const address = new Address({
      userId: userId,
      houseName: houseName,
      street: street,
      district: district,
      state: state,
      pincode: pincode,
      addressType: addressType,
    });
    const addressData = await address.save();

    const addresses = await Address.find({ userId });
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
    res.status(500).send("Internal Server Error");
  }
};
const checkoutEditAddress = async (req, res) => {
  try {
    const addId = req.query.id;
    console.log(addId);
    const { houseName, street, district, state, pincode, addressType } =
      req.body;
    await Address.updateOne(
      { _id: addId },
      { $set: { houseName, street, district, state, pincode, addressType } }
    );
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const addresses = await Address.find({ userId });
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
};
const orderCancell = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.updateOne(
      { _id: orderId },
      { $set: { "status": "Cancelled" } }
    );
    res.redirect("/orderStatus");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
};

const orderDetails=async(req,res)=>{
  try {
    const orderId=req.query.orderId
    const order=await Order.findOne({orderId}).populate("items.productId").populate("userId").populate("addressId");
    
    res.render("user/orderDetails",{order})
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
}
const applyCoupon=async(req,res)=>{
  try {
   const couponCode=req.body.couponCode
   const coupon=await Coupon.findOne({couponCode})
   let discount=coupon.discount
   if (!coupon || !coupon.isActive || new Date() > new Date(coupon.expirationDate)) {
    return res.status(404).json({ success: false, message: 'Invalid or expired coupon' });
}else{
  req.session.discount=discount
  res.json({ success: true})
}
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
}

const checkout=async(req,res)=>{
  try {
    const orderDetails=req.body
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const cart=await Cart.updateOne(
      { userId },
      { $set:orderDetails  }
    );
    res.redirect("/checkout")
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
}

module.exports = { checkoutAddAddress, checkoutEditAddress, orderCancell,orderDetails,applyCoupon,checkout };
