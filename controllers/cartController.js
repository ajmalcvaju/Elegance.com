const Cart = require('../model/cartModel');
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Address= require("../model/addressModel");
const Order= require("../model/orderModel");
const Wishlist = require('../model/wishlistModel');

const addToCart = async (req, res) => {
  try {
    if(req.session&&req.session.email){
      const productId=req.query.id
      console.log(productId)
      const email=req.session.email
      console.log(email)
      const user = await User.findOne({email});
      const userId = user._id
      let cart = await Cart.findOne({ userId});
      console.log(cart)
      let isProductInCart = false;
      let wishlist = await Wishlist.findOne({ userId})
       const index = wishlist.items.findIndex(item => item.productId.toString() === productId);
       if (index !== -1) {
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: { items: { productId: productId } } },
          { new: true }
      );
       }
      if (!cart) {
       cart = new Cart({ userId, items: [{ productId, quantity:1 }] });
       const cartData=await cart.save()
       console.log(cartData)
       await Product.updateOne({_id:productId},{$inc: { "purchase": -1 }})
       let product = await Product.findOne({_id:productId});
       const productData=await product.save()
       
      }else{
       const index = cart.items.findIndex(item => item.productId.toString() === productId);
       if (index !== -1) {
     // (cart.items[index].quantity)++
     // const cartData=await cart.save()
     isProductInCart = true;
     } else {
         cart.items.push({ productId, quantity:1 });
         const cartData=await cart.save()
     }
      }
      res.json({
       success: true,
       isProductInCart
     });
    }else{
      let notLogin=true
      res.json({
        success: true,
        notLogin
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const cart=async (req, res) => {
    try {
      if(req.session&&req.session.email){
        const email=req.session.email
    const user = await User.findOne({email});
    const userId = user._id
    const cart = await Cart.findOne({ userId }).populate('items.productId');
    let carts = await Cart.findOne({ userId});
    if(!cart){
      res.render("user/cart",{noProduct:1})
    }else{
      const totalPrice=carts.totalPrice
      if(totalPrice>2000){
        res.render("user/cart",{cart,expensive:true,totalAmount:totalPrice})
      }else{
        res.render("user/cart",{cart,expensive:false,totalAmount:totalPrice+50})
      }
    }
      }else{
        res.redirect("/login")
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
      const carts = await Cart.findOne({ userId })
        const item = carts.items.find(item => item._id.toString() === proId);
      let quantity=item.quantity;
      let lessCount=false
      if(quantity==1){
        let lessCount=true
        res.redirect("/cart")
      }else{
        await Cart.updateOne({userId,"items._id": proId},{$inc: { "items.$.quantity": -1 }})
        let cart = await Cart.findOne({ userId});
        console.log(cart)
        const cartData=await cart.save()
       res.redirect("/cart")
      }  
    } catch (error) {
      console.log(error.message);
    }
};
const incCart=async (req, res) => {
    try {
        const proId=req.query.id
        console.log(proId)
        const email=req.session.email
        const user = await User.findOne({email});
        const userId = user._id
        const carts = await Cart.findOne({ userId })
        const item = carts.items.find(item => item._id.toString() === proId);
        let quantity=item.quantity;
        let productId=item.productId;
        console.log(quantity)
        console.log(productId)
        const product = await Product.findOne({_id:productId});
        const stock=product.purchase
        let outOfStock=false
        if(stock==quantity){
          let outOfStock=true
          res.redirect("/cart")
        }else{
          await Cart.updateOne({userId,"items._id": proId},{$inc: { "items.$.quantity": 1 }})
          let cart = await Cart.findOne({ userId});
          const cartData=await cart.save()
          res.redirect("/cart")
        }
        res.json({
          success: true,
          outOfStock
        });
    } catch (error) {
      console.log(error.message);
    }
};
const checkout=async (req,res)=>{
  try {
    const email=req.session.email
        const user = await User.findOne({email});
        const userId = user._id
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        const address=await Address.find({ userId })
        console.log(address)
    res.render("user/checkout",{cart,address})
  } catch (error) {
    console.log(error.message);
  }
}
const placeOrder=async (req,res)=>{
try {   const email=req.session.email
        const user = await User.findOne({email});
        const userId = user._id
        const cart = await Cart.findOne({ userId }).populate('items.productId');
        const orderItems = cart.items.map(item => ({
          productId: item.productId._id,
          quantity: item.quantity,
          price: item.price,
          userId:userId
      }));
      const address=req.body.address
      console.log("add",address)
      const totalPrice = cart.totalPrice;
      const order = new Order({
        userId,
        items: orderItems,
        totalPrice,
        address
    });
    await order.save();
    await Cart.deleteOne({userId})
    res.render("user/orderSuccess")
} catch (error) {
  console.log(error.message);
}
}
const orderStatus=async (req,res)=>{
  try {
    const email=req.session.email
    const user = await User.findOne({email});
    const userId = user._id
    const order = await Order.find({ userId }).populate('items.productId');
    console.log(order)
    res.render("user/orderStatus",{order})
  } catch (error) {
    console.log(error.message);
  }
}
const addWishlist= async (req, res) => {
  try {
    if(req.session&&req.session.email){
      const productId=req.query.id
      console.log(productId)
      const email=req.session.email
      console.log(email)
      const user = await User.findOne({email});
      const userId = user._id
      let wishlist = await Wishlist.findOne({ userId});
      console.log(wishlist)
      let isProductInWishlist= false;
      if (!wishlist) {
       wishlist = new Wishlist({ userId, items: [{ productId }] });
       const  wishlistData=await  wishlist.save()
       console.log( wishlistData)
     
      }else{
       const index = wishlist.items.findIndex(item => item.productId.toString() === productId);
       if (index !== -1) {
     // (cart.items[index].quantity)++
     // const cartData=await cart.save()
     isProductInWishlist = true;
     } else {
         wishlist.items.push({ productId});
         const wishlistData=await wishlist.save()
     }
      }
      res.json({
       success: true,
       isProductInWishlist
     });
    }else{
      let notLogin=true
      res.json({
        success: true,
        notLogin
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const myWishlist=async(req,res)=>{
  try {
    if(req.session&&req.session.email){
      const email=req.session.email
  const user = await User.findOne({email});
  const userId = user._id
  const wishlist = await Wishlist.findOne({ userId }).populate('items.productId');
  let wishlists = await Wishlist.findOne({ userId});
  console.log(wishlists.items.length)
  if(wishlists.items.length==0){
    res.render("user/wishlist",{wishlist,noProduct:1})
  }else{
    res.render("user/wishlist",{wishlist})
  }

    }else{
      res.redirect("/login")
    }
 
  } catch (error) {
    console.log(error.message);
  }
}
const wishlistToAddCart=async(req,res)=>{
  try {
    const productId=req.query.id
      console.log(productId)
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
       await Product.updateOne({_id:productId},{$inc: { "purchase": -1 }})
       let product = await Product.findOne({_id:productId});
       const productData=await product.save()
       const updatedWishlist = await Wishlist.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
    );
       
       res.redirect("/myWishlist")
      }else{
       const index = cart.items.findIndex(item => item.productId.toString() === productId);
       if (index !== -1) {
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: { items: { productId: productId } } },
          { new: true }
      );
     // (cart.items[index].quantity)++
     // const cartData=await cart.save()
     isProductInCart = true;
     res.redirect("/myWishlist")
     } else {
         cart.items.push({ productId, quantity:1 });
         const cartData=await cart.save()
         const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: { items: { productId: productId } } },
          { new: true }
      );
         res.redirect("/myWishlist")
     }}
  } catch (error) {
    console.log(error.message);
  }
}

module.exports={addToCart,checkout,cart,incCart,decCart,checkout,placeOrder,orderStatus,addWishlist,myWishlist,wishlistToAddCart}