const Cart = require('../model/cartModel');
const Product = require("../model/productModel");
const User = require("../model/userModel");

const addToCart = async (req, res) => {
  try {
   const productId=req.query.id
   const email=req.session.email
   console.log(email)
   const user = await User.findOne({email});
   const userId = user._id
   let cart = await Cart.findOne({ userId});
   console.log(cart)
   if (!cart) {
    cart = new Cart({ userId, items: [{ productId, quantity:1 }] });
    const cartData=await cart.save()
    console.log(cartData)
   }else{
    const index = cart.items.findIndex(item => item.productId.toString() === productId);
    if (index !== -1) {
  (cart.items[index].quantity)++
  const cartData=await cart.save()
  } else {
      cart.items.push({ productId, quantity:1 });
      const cartData=await cart.save()
  }
   }
   res.redirect("/shop")
  } catch (error) {
    console.log(error.message);
  }
};

const updateCart = async (req, res) => {
    try {
    
    } catch (error) {
      console.log(error.message);
    }
};

const cart=async (req, res) => {
    try {
    const email=req.session.email
    const user = await User.findOne({email});
    const userId = user._id
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    let carts = await Cart.findOne({ userId});
    const totalPrice=carts.totalPrice
    if(totalPrice>2000){
      res.render("user/cart",{cart,expensive:true,totalAmount:totalPrice})
    }else{
      res.render("user/cart",{cart,expensive:false,totalAmount:totalPrice+50})
    }
    } catch (error) {
      console.log(error.message);
    }
};
const decCart=async (req, res) => {
    try {
      const proId=req.query.id
      const email=req.session.email
      const user = await User.findOne({email});
      const userId = user._id
       await Cart.updateOne({userId,"items._id": proId},{$inc: { "items.$.quantity": -1 }})
       let cart = await Cart.findOne({ userId});
       const cartData=await cart.save()
      res.redirect("/cart")
     
    } catch (error) {
      console.log(error.message);
    }
};
const incCart=async (req, res) => {
    try {
        const proId=req.query.id
        const email=req.session.email
        const user = await User.findOne({email});
        const userId = user._id
        await Cart.updateOne({userId,"items._id": proId},{$inc: { "items.$.quantity": 1 }})
        let cart = await Cart.findOne({ userId});
        const cartData=await cart.save()
        res.redirect("/cart")
    } catch (error) {
      console.log(error.message);
    }
};
const checkout=async (req,res)=>{
  try {
    res.render("user/checkout")
  } catch (error) {
    console.log(error.message);
  }
}

module.exports={addToCart,updateCart,checkout,cart,incCart,decCart,checkout}