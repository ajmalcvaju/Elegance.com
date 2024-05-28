const Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Wishlist = require("../model/wishlistModel");
const Coupon = require("../model/couponModel");
const Razorpay=require('razorpay')

const razorpayInstance=new Razorpay({
  key_id:"rzp_test_8qF3L1nSyCD4kf",
  key_secret:"XKCeAFQwm8d8xEv8684Sgqsh"
})

const addToCart = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const productId = req.query.id;
      console.log(productId);
      const email = req.session.email;
      console.log(email);
      const user = await User.findOne({ email });
      const userId = user._id;
      let cart = await Cart.findOne({ userId });
      console.log(cart);
      let isProductInCart = false;
      let wishlist = await Wishlist.findOne({ userId });
      const index = wishlist.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (index !== -1) {
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: { items: { productId: productId } } },
          { new: true }
        );
      }
      if (!cart) {
        cart = new Cart({ userId, items: [{ productId, quantity: 1 }] });
        const cartData = await cart.save();
        console.log(cartData);
        await Product.updateOne({ _id: productId }, { $inc: { purchase: -1 } });
        let product = await Product.findOne({ _id: productId });
        const productData = await product.save();
      } else {
        const index = cart.items.findIndex(
          (item) => item.productId.toString() === productId
        );
        if (index !== -1) {
          // (cart.items[index].quantity)++
          // const cartData=await cart.save()
          isProductInCart = true;
        } else {
          cart.items.push({ productId, quantity: 1 });
          const cartData = await cart.save();
        }
      }
      res.json({
        success: true,
        isProductInCart,
      });
    } else {
      let notLogin = true;
      res.json({
        success: true,
        notLogin,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const cart = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      const cart = await Cart.findOne({ userId }).populate("items.productId");
      let carts = await Cart.findOne({ userId });
      const coupon = await Coupon.find({});
      if (!carts) {
        res.render("user/cart", { noProduct: 1,coupon });
      } else {
        if (carts.items.length == 0) {
          res.render("user/cart", { noProduct: 1,coupon });
        } else {
          const totalPrice = carts.totalPrice;
          if (totalPrice > 2000) {
            res.render("user/cart", {
              cart,
              expensive: true,
              totalAmount: totalPrice,
              coupon
            });
          } else {
            res.render("user/cart", {
              cart,
              expensive: false,
              totalAmount: totalPrice + 50,
              coupon
            });
          }
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const decCart = async (req, res) => {
  try {
    const proId = req.query.id;
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const carts = await Cart.findOne({ userId });
    const item = carts.items.find((item) => item._id.toString() === proId);
    let quantity = item.quantity;
    let lessCount = false;
    if (quantity == 1) {
      let lessCount = true;
      res.send(`
      <html>
          <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
      <body>
          <script>
             
              function failMessage() {
                  Swal.fire({
                      title: 'Product Quantity',
                      text: 'Product quantity will be atleast one,Otherwise,Delete Product From Cart',
                      icon: 'error',
                      confirmButtonText: 'OK'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.href = '/cart';
                    }
                });
              }
              failMessage();
          </script>
      </body>
      </html>
  `);
    
    } else {
      await Cart.updateOne(
        { userId, "items._id": proId },
        { $inc: { "items.$.quantity": -1 } }
      );
      let cart = await Cart.findOne({ userId });
      console.log(cart);
      const cartData = await cart.save();
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const incCart = async (req, res) => {
  try {
    const proId = req.query.id;
    console.log(proId);
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const carts = await Cart.findOne({ userId });
    const item = carts.items.find((item) => item._id.toString() === proId);
    let quantity = item.quantity;
    let productId = item.productId;
    console.log(quantity);
    console.log(productId);
    const product = await Product.findOne({ _id: productId });
    const stock = product.purchase;
    let outOfStock = false;
    if (stock == quantity) {
      res.send(`
      <html>
          <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
      <body>
          <script>
             
              function failMessage() {
                  Swal.fire({
                      title: 'Product Quantity',
                      text: 'Product Become Out of Stock.',
                      icon: 'error',
                      confirmButtonText: 'OK'
                  }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.href = '/cart';
                    }
                });
              }
              failMessage();
          </script>
      </body>
      </html>
  `);
    } else {
      await Cart.updateOne(
        { userId, "items._id": proId },
        { $inc: { "items.$.quantity": 1 } }
      );
      let cart = await Cart.findOne({ userId });
      const cartData = await cart.save();
      res.redirect("/cart");
    }
    res.json({
      success: true,
      outOfStock,
    });
  } catch (error) {
    console.log(error.message);
  }
};
const checkout = async (req, res) => {
  try {
      const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    let carts = await Cart.findOne({ userId });
    
    const discount=req.session.discount
    if (!carts) {
      res.send(`
            <script>
        alert('No Item Present in The Cart.');
        window.location.href = '/cart';
      </script>`);
    } else {
      if (carts.items.length == 0) {
        res.send(`
        <script>
    alert('No Item Present in The Cart.');
    window.location.href = '/cart';
  </script>`);
      } else {
        const address = await Address.find({ userId });
        const coupon = await Coupon.find({});
        res.render("user/checkout", { cart, address,coupon,discount });
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const createOrder=async(req,res)=>{
  try {
    const{price,address,paymentMethod} =req.body
    const amount=price*100
    const options={
      amount:amount,
      currency:'INR',
      receipt:'razorUser@gmail.com'
    }
    razorpayInstance.orders.create(options,async(err,order)=>{
      if(!err){
        const email=req.session.email
        const user = await User.findOne({ email });
        const username=user.username
        const mobileNumber=user.mobileNumber
        res.status(200).send({
          success:true,
          msg:"Order Created",
          order_id:1234,
          amount:amount,
          key_id:"rzp_test_8qF3L1nSyCD4kf",
          contact:mobileNumber,
          name:username,
          email:email
        })
      }else{
        res.status(400).send({success:false,msg:"something went wrong!!"})
      }
    })
  } catch (error) {
    console.log(error.message);
  }
}
const placeOrder = async (req, res) => {
  try {
    const payment=req.query.paid
    const address=req.query.add
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const orderItems = cart.items.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.price,
        userId: userId,
      }));
    const totalPrice = cart.totalPrice;
    let order;
    if(payment==1){
      order = new Order({
        userId,
        items: orderItems,
        totalPrice,
        address,
        paymentMethod:"Online Payment"
      });
    }else{
      order = new Order({
        userId,
        items: orderItems,
        totalPrice,
        address,
        paymentMethod:"COD"
      });
    }
      await order.save();
    await Cart.deleteOne({ userId });
    res.render("user/orderSuccess");
  } catch (error) {
    console.log(error.message);
  }
};
const orderStatus = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const order = await Order.find({ userId }).populate("items.productId");
    console.log(order);
    res.render("user/orderStatus", { order });
  } catch (error) {
    console.log(error.message);
  }
};
const addWishlist = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const productId = req.query.id;
      console.log(productId);
      const email = req.session.email;
      console.log(email);
      const user = await User.findOne({ email });
      const userId = user._id;
      let wishlist = await Wishlist.findOne({ userId });
      console.log(wishlist);
      let isProductInWishlist = false;
      if (!wishlist) {
        wishlist = new Wishlist({ userId, items: [{ productId }] });
        const wishlistData = await wishlist.save();
        console.log(wishlistData);
      } else {
        const index = wishlist.items.findIndex(
          (item) => item.productId.toString() === productId
        );
        if (index !== -1) {
          // (cart.items[index].quantity)++
          // const cartData=await cart.save()
          isProductInWishlist = true;
        } else {
          wishlist.items.push({ productId });
          const wishlistData = await wishlist.save();
        }
      }
      res.json({
        success: true,
        isProductInWishlist,
      });
    } else {
      let notLogin = true;
      res.json({
        success: true,
        notLogin,
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const myWishlist = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      const wishlist = await Wishlist.findOne({ userId }).populate(
        "items.productId"
      );
      let wishlists = await Wishlist.findOne({ userId });
      console.log(wishlists.items.length);
      if (wishlists.items.length == 0) {
        res.render("user/wishlist", { wishlist, noProduct: 1 });
      } else {
        res.render("user/wishlist", { wishlist });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
  }
};
const wishlistToAddCart = async (req, res) => {
  try {
    const productId = req.query.id;
    console.log(productId);
    const email = req.session.email;
    console.log(email);
    const user = await User.findOne({ email });
    const userId = user._id;
    let cart = await Cart.findOne({ userId });
    console.log(cart);
    if (!cart) {
      cart = new Cart({ userId, items: [{ productId, quantity: 1 }] });
      const cartData = await cart.save();
      console.log(cartData);
      await Product.updateOne({ _id: productId }, { $inc: { purchase: -1 } });
      let product = await Product.findOne({ _id: productId });
      const productData = await product.save();
      const updatedWishlist = await Wishlist.findOneAndUpdate(
        { userId: userId },
        { $pull: { items: { productId: productId } } },
        { new: true }
      );

      res.redirect("/myWishlist");
    } else {
      const index = cart.items.findIndex(
        (item) => item.productId.toString() === productId
      );
      if (index !== -1) {
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: { items: { productId: productId } } },
          { new: true }
        );
        // (cart.items[index].quantity)++
        // const cartData=await cart.save()
        isProductInCart = true;
        res.redirect("/myWishlist");
      } else {
        cart.items.push({ productId, quantity: 1 });
        const cartData = await cart.save();
        const updatedWishlist = await Wishlist.findOneAndUpdate(
          { userId: userId },
          { $pull: { items: { productId: productId } } },
          { new: true }
        );
        res.redirect("/myWishlist");
      }
    }
  } catch (error) {
    console.log(error.message);
  }
};
const deleteWishlist = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const proId = req.query.id;
    console.log(proId);
    const updatedWishlist = await Wishlist.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: { productId: proId } } },
      { new: true }
    );
    res.redirect("/myWishlist");
  } catch (error) {
    console.log(error.message);
  }
};
const deleteCart = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const proId = req.query.id;
    console.log(proId);
    const updatedCart = await Cart.findOneAndUpdate(
      { userId: userId },
      { $pull: { items: { productId: proId } } },
      { new: true }
    );
    let cart = await Cart.findOne({ userId });
    const cartData = await cart.save();
    res.redirect("/cart");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  addToCart,
  checkout,
  cart,
  incCart,
  decCart,
  checkout,
  createOrder,
  placeOrder,
  orderStatus,
  addWishlist,
  myWishlist,
  wishlistToAddCart,
  deleteWishlist,
  deleteCart,
};
