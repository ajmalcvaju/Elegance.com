var Cart = require("../model/cartModel");
const Product = require("../model/productModel");
const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Order = require("../model/orderModel");
const Wishlist = require("../model/wishlistModel");
const Coupon = require("../model/couponModel");
const Category = require("../model/categoryModel");
const Wallet=require("../model/walletModel");
const Razorpay = require("razorpay");



const razorpayInstance = new Razorpay({
  key_id: process.env.key_id,
  key_secret: process.env.key_secret,
});

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
      let isProductInCart = false;

      if (!cart) {
        cart = new Cart({ userId, items: [{ productId, quantity: 1 }] });
        const cartData = await cart.save();
        console.log(cartData);
      } else {
        const index = cart.items.findIndex(
          (item) => item.productId.toString() === productId
        );
        if (index !== -1) {
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
    res.redirect("/error");
  }
};

const cart = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      if(req.session.wallet){
        const wallet=req.session.wallet
    const wallets=await Wallet.updateOne({userId},{$inc:{amount:wallet}})
    await Cart.updateOne(
      { userId },
      { $unset: { amountAfterWallet: "" } }
    );
    delete req.session.wallet;
      }
      const cart = await Cart.findOne({ userId }).populate("items.productId");
      let carts = await Cart.findOne({ userId });
      const coupon = await Coupon.find({});
      if (!carts) {
        res.render("user/cart", { noProduct: 1, coupon });
      } else {
        if (carts.items.length == 0) {
          res.render("user/cart", { noProduct: 1, coupon });
        } else {
          const totalPrice = Math.round(carts.totalPrice);
          const totalPriceBeforeOffer = Math.round(carts.totalPriceBeforeOffer);
          const offerDiscount = Math.round(totalPriceBeforeOffer - totalPrice);
          const gst = Math.round(totalPrice * 0.12);
          const totalPriceIncGst = Math.round(totalPrice * 1.12);
          const totalAmountPay = Math.round(totalPriceIncGst + 50);
          res.render("user/cart", {
            cart,
            totalPrice,
            totalPriceBeforeOffer,
            offerDiscount,
            gst,
            totalPriceIncGst,
            shippingCharge: 50,
            totalAmountPay,
          });
        }
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const decCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const carts = await Cart.findOne({ userId });
    const item = carts.items.find((item) => item._id.toString() === productId);
    let quantity = item.quantity;
    if (quantity == 1) {
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
        { userId, "items._id": productId },
        { $inc: { "items.$.quantity": -1 } }
      );
      let cart = await Cart.findOne({ userId });
      console.log(cart);
      const cartData = await cart.save();
      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const incCart = async (req, res) => {
  try {
    const productId = req.query.id;
    const proId = req.query.proId;
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const carts = await Cart.findOne({ userId });
    const item = carts.items.find((item) => item._id.toString() === productId);
    const product = await Product.findOne({ _id: proId });
    let quantity = item.quantity;
    let stock = product.purchase;
    console.log(quantity);
    console.log(req.query.id);
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
        { userId, "items._id": productId },
        { $inc: { "items.$.quantity": 1 } }
      );
      let cart = await Cart.findOne({ userId });

      const cartData = await cart.save();

      res.redirect("/cart");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const checkout=async (req, res) => {
  try {
    const email = req.session.email;
    if (!email) throw new Error("Email is missing from session.");
    
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found.");

    const userId = user._id;
    let carts = await Cart.findOne({ userId });
    if (!carts) throw new Error("Cart not found.");

    let totalPriceAfterCoupon;
    let couponDiscount;
    let cart;

    if (req.session.discount) {
      console.log(req.session.discount);
      const discount = req.session.discount;
      const totalPrice = carts.totalPrice;
      totalPriceAfterCoupon = Math.round(totalPrice * (1 - discount / 100));
      couponDiscount = Math.round((totalPrice * discount) / 100);
      console.log(couponDiscount);

      cart = await Cart.updateOne(
        { userId },
        {
          $set: {
            priceAfterCoupon: totalPriceAfterCoupon,
            couponDiscount: couponDiscount,
          },
        }
      );
      if (cart.nModified === 0) throw new Error("Failed to update cart with coupon details.");
    } else {
      cart = await Cart.updateOne(
        { userId },
        { $unset: { priceAfterCoupon: "" } }
      );
      if (cart.nModified === 0) throw new Error("Failed to unset priceAfterCoupon.");

      cart = await Cart.updateOne({ userId }, { $set: { couponDiscount: 0 } });
      if (cart.nModified === 0) throw new Error("Failed to update couponDiscount to 0.");
    }


    if (!carts) {
      res.send(`
        <script>
          alert('No Item Present in The Cart.');
          window.location.href = '/cart';
        </script>`);
    } else if (carts.items.length === 0) {
      res.send(`
        <script>
          alert('No Item Present in The Cart.');
          window.location.href = '/cart';
        </script>`);
    } else {
      console.log(totalPriceAfterCoupon);
      const cart = await Cart.findOne({ userId }).populate("items.productId");
      const address = await Address.find({ userId });
      const coupon = await Coupon.find({});
      const wallet = await Wallet.findOne({ userId });
      console.log(req.session.discount);
      res.render("user/checkout", { cart, address, coupon, wallet });
    }
  } catch (error) {
    console.log("Error: ", error.message);
    res.redirect("/error");
  }
};


const createOrder = async (req, res) => {
  try {
    const { totalAmountPay, priceAfterCoupon, paymentMethod } = req.body;
    let amount;
    if (priceAfterCoupon) {
      amount = priceAfterCoupon * 100;
    } else {
      amount = totalAmountPay * 100;
    }
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
const placeOrder = async (req, res) => {
  try {
    const paid = req.query.paid;
    const addressId = req.query.add;
    const payment = req.query.paymentStatus;
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const cart = await Cart.findOne({ userId }).populate("items.productId");
    const orderItems = cart.items.map((item) => ({
      productId: item.productId._id,
      category: item.productId.category,
      quantity: item.quantity,
      price: item.price,
      priceBeforeOffer: item.priceBeforeOffer,
      userId: userId,
    }));
    for (const item of orderItems) {
      await Product.updateOne(
        { _id: item.productId },
        { 
          $inc: { 
            soldCount: item.quantity, 
            purchase: -item.quantity 
          } 
        }
      )
    }
    for (const item of orderItems) {
      await Category.updateOne(
        { cname: item.category },
        { $inc: { soldCount: item.quantity } }
      );
    }

    (totalPrice = cart.totalPriceBeforeOffer),
      (discount = cart.discount),
      (discountedPrice = cart.totalPrice),
      (gst = cart.gst),
      (totalPriceIncludingGst = cart.totalPriceIncludingGst),
      (shippingCharge = cart.shippingCharge),
      (totalAmountPay = cart.totalAmountPay),
      (priceAfterCoupon = cart.priceAfterCoupon);
    couponDiscount = cart.couponDiscount;
    let order;
    let paymentStatus;
    let wallet=req.query.wallet
    
    if (paid == 1) {
      if (payment == 1) {
        paymentStatus = "Successfull";
      } else {
        paymentStatus = "Failed";
        if(req.session.wallet){
          const wallet=req.session.wallet
      const wallets=await Wallet.updateOne({userId},{$inc:{amount:wallet}})
      await Cart.updateOne(
        { userId },
        { $unset: { amountAfterWallet: "" } }
      );
        }
      }
      order = new Order({
        userId,
        items: orderItems,
        totalPrice,
        addressId,
        discount,
        discountedPrice,
        gst,
        totalPriceIncludingGst,
        shippingCharge,
        totalAmountPay,
        priceAfterCoupon,
        couponDiscount,
        paymentStatus,
        paymentMethod: "Online Payment",
      });
    }else if(wallet==1){
      paymentStatus = "Successfull"
      order = new Order({
        userId,
        items: orderItems,
        totalPrice,
        addressId,
        discount,
        discountedPrice,
        gst,
        totalPriceIncludingGst,
        shippingCharge,
        totalAmountPay,
        priceAfterCoupon,
        couponDiscount,
        paymentStatus,
        paymentMethod: "wallet",
      });
    } else {
      paymentStatus = "Pending";
      order = new Order({
        userId,
        items: orderItems,
        totalPrice,
        addressId,
        discount,
        discountedPrice,
        gst,
        totalPriceIncludingGst,
        shippingCharge,
        totalAmountPay,
        priceAfterCoupon,
        couponDiscount,
        paymentStatus,
        paymentMethod: "COD",
      });
    }
    await order.save();
    await Cart.deleteOne({ userId });
    req.session.discount = null;
    req.session.wallet = null; 
req.session.save((err) => {
    if (err) {
        console.error('Error saving session:', err);
    } else {
        console.log('Wallet session variable cleared');    }
});
    if (paymentStatus == "Pending" || paymentStatus == "Successfull") {
      res.render("user/orderSuccess", { paid: 1 });
    } else {
      res.render("user/orderSuccess", { paid: 0 });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const orderStatus = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const order = await Order.find({ userId }).populate("items.productId").sort({orderId:-1});
    console.log(order);
    res.render("user/orderStatus", { order });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
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
    res.redirect("/error");
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
  
      if(!wishlist){
        console.log('Wishlist is not present');
        
        res.render("user/wishlist", { noProduct: 1 });
      }
      else if (wishlists.items.length == 0) {
        res.render("user/wishlist", { wishlist, noProduct: 1 });
      } else {
        res.render("user/wishlist", { wishlist });
      }
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
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
    res.redirect("/error");
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
    res.redirect("/error");
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
    res.redirect("/error");
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
  deleteCart};
