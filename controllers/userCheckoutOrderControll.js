const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Coupon = require("../model/couponModel");
const Cart = require("../model/cartModel");
const Wallet=require("../model/walletModel");
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

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
    res.redirect("/error");
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
    res.redirect("/error");
  }
};
const orderCancell = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const reason=req.body.reason
    const order = await Order.updateOne(
      { _id: orderId },
      { $set: { status: "Cancelation Pending",reasonForCancelation:reason } }
    );
    res.redirect("/orderStatus");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const returnOrder = async (req, res) => {
  try {
    const orderId = req.body.orderId;
    const reason=req.body.reason
    const order = await Order.updateOne(
      { _id: orderId },
      { $set: { status: "Return Pending",reasonForReturn:reason } }
    );

    res.redirect("/orderStatus");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const orderDetails = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findOne({ orderId })
      .populate("items.productId")
      .populate("userId")
      .populate("addressId");

    res.render("user/orderDetails", { order });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const applyCoupon = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const couponCode = req.body.couponCode;
    console.log(couponCode);
    const coupon = await Coupon.findOne({ couponCode });
    const coupons = await Coupon.findOne({
      couponCode: couponCode,
      usedUsers: { $in: [userId] },
    });
    if (
      !coupon ||
      !coupon.isActive ||
      new Date() > new Date(coupon.expiryDate)
    ) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired coupon" });
    } else if (coupons) {
      return res
        .status(404)
        .json({ fail: true, message: "Already Used Coupon" });
    } else {
      const couponId = coupon._id;
      let discount = coupon.discount;
      let cart = await Cart.findOne({ userId });
      cart.couponId = couponId;
      await cart.save();
      const updatedCoupon = await Coupon.findOneAndUpdate(
        { couponCode: couponCode },
        { $addToSet: { usedUsers: userId } },
        { new: true }
      );
      req.session.discount = discount;
      res.json({ success: true });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const checkout = async (req, res) => {
  try {
    const orderDetails = req.body;
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const carts = await Cart.findOne({ userId })
    req.session.amountBalanceAfterwallet
    const cart = await Cart.updateOne({ userId }, { $set: orderDetails });
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const repayOrder = async (req, res) => {
  try {
    let amount = req.body.totalAmountPay;
    amount = amount * 100;
    const options = {
      amount: amount,
      currency: "INR",
      receipt: "razorUser@gmail.com",
    };
    razorpayInstance.orders.create(options, async (err, order) => {
      if (!err) {
        const email = req.session.email;
        const user = await User.findOne({ email });
        const username = user.username;
        const mobileNumber = user.mobileNumber;
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: 1234,
          amount: amount,
          key_id: process.env.key_id,
          contact: mobileNumber,
          name: username,
          email: email,
        });
      } else {
        res.status(400).send({ success: false, msg: "something went wrong!!" });
      }
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const repay = async (req, res) => {
  try {
    let paid = req.query.paid;
    let orderId = req.query.orderId;
    if (paid == 1) {
      const order = await Order.updateOne(
        { orderId },
        { paymentStatus: "Successfull" }
      );
      res.redirect("/orderStatus");
    } else {
      res.redirect("/orderStatus");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const invoice = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findOne({ orderId })
      .populate("items.productId")
      .populate("userId")
      .populate("addressId");
    res.render("user/invoice", { order });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const removeCoupon = async (req, res) => {
  try {
    req.session.discount = null;
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const couponId = req.query.couponId;
    await Coupon.findOneAndUpdate(
      { _id: couponId },
      { $pull: { usedUsers: userId } },
      { new: true }
    );
    res.redirect("/checkout");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const useWallet=async(req,res)=>{
  try {
    if(req.session.wallet){
      console.log("hi",req.session.wallet)
    res.json({success:false})
      }else{
        const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const walletAmount=req.body.walletAmount
    const actualAmount=Number(req.body.actualAmount)
  if(actualAmount>=walletAmount){
     const amountBalance=actualAmount-walletAmount
     const wallet=await Wallet.updateOne({userId},{$set:{amount:0}})
     await Cart.updateOne({ userId }, { $set: { amountAfterWallet:amountBalance } });
     req.session.wallet=walletAmount
     res.json({success:true})
  }else{
    const amountBalance=0
    const walletBalance=walletAmount-actualAmount
    const wallet=await Wallet.updateOne({userId},{$set:{amount:walletBalance}})
    await Cart.updateOne({ userId }, { $set: { amountAfterWallet:amountBalance } });
    req.session.wallet=actualAmount
    res.json({success:true})
  }
  }
    
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
}

const removeWallet=async(req,res)=>{
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const cart = await Cart.findOne({ userId });
    const wallet=req.session.wallet
    const wallets=await Wallet.updateOne({userId},{$inc:{amount:wallet}})
    await Cart.updateOne(
      { userId },
      { $unset: { amountAfterWallet: "" } }
    );
    console.log("hi aju")
    delete req.session.wallet;
    res.json({success:true})
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
}

module.exports = {
  checkoutAddAddress,
  checkoutEditAddress,
  orderCancell,
  orderDetails,
  applyCoupon,
  checkout,
  repayOrder,
  repay,
  invoice,
  removeCoupon,
  returnOrder,
  useWallet,
  removeWallet
};
