const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const userProfile = require("../controllers/userProfile");
const userauth = require("../controllers/userauth");
const middleware = require("../middlewares/middlewares");
const cartController = require("../controllers/cartController");
const userCheckoutOrderControll = require("../controllers/userCheckoutOrderControll");
const passport =require("../config/passport");


router.get("/", userController.home);
router.get("/login", middleware.checkSession, userController.login);
router.get("/auth/google", passport.authenticate("google", { scope: ['email', 'profile'] }));
router.get("/auth/google/callback", passport.authenticate("google", { failureRedirect: '/' }), userauth.googleAuth);
router.post("/login", userauth.login);
router.get("/signup", middleware.checkSession2, userController.loadRegister);
router.post("/checkUserExist", userController.checkUserExist);
router.post("/signup",  middleware.userImage, userController.insertUser);
router.get("/otp", userController.otp);
router.post("/signup/verify", userController.verifyMail);
router.get("/reset", userController.reset);
router.post("/reset", userController.resetPass);
router.post("/resendOtp", userController.resendOtp);
router.post("/reset/verify", userController.changePassword);
router.post("/reset/new-password", userController.updatePassword);
router.get("/shop", userController.shop);
router.get("/home", userController.home);
router.get("/product-details", userController.productDetails);
router.post("/rate",userController.rating)
router.get("/reviews",userController.review)
router.get("/myProfile", userProfile.openProfile);
router.get("/myProfile/add-address", userProfile.addAddres);
router.post("/myProfile/add-address", userProfile.addAddress);
router.get("/edit-address", userProfile.changeAddress);
router.get("/myProfile/changePassword", userProfile.changePassword);
router.post("/myProfile/changePassword", userProfile.updatePassword);
router.post("/edit-address", userProfile.editAddress);
router.get("/delete-address", userProfile.deleteAddress);
router.get("/edit-profile", userProfile.editProfile);
router.post("/edit-profile", userProfile.updateProfile);
router.get("/add-to-cart", cartController.addToCart);
router.get("/cart", cartController.cart);
router.get("/incrementItem", cartController.incCart);
router.get("/decrementItem", cartController.decCart);
router.get("/checkout", cartController.checkout);
router.post("/checkout", userCheckoutOrderControll.checkout);
router.post("/createOrder", cartController.createOrder);
router.post("/use-wallet", userCheckoutOrderControll.useWallet);
router.get("/remove-wallet",userCheckoutOrderControll.removeWallet)
router.get("/placeOrder", cartController.placeOrder);
router.get("/orderStatus", cartController.orderStatus);
router.get("/advanceSearch", userController.advanceSearch);
router.get("/AddAddress",userCheckoutOrderControll.addAddress);
router.post("/AddAddress", userCheckoutOrderControll.checkoutAddAddress);
router.get("/editAddress", userCheckoutOrderControll.editAddress);
router.post("/editAddress", userCheckoutOrderControll.checkoutEditAddress);
router.get("/deleteAddress", userCheckoutOrderControll.deleteAddress);
router.post("/cancelOrder", userCheckoutOrderControll.orderCancell);
router.post("/returnOrder", userCheckoutOrderControll.returnOrder);
router.get("/orderDetails", userCheckoutOrderControll.orderDetails);
router.get("/invoice", userCheckoutOrderControll.invoice);
router.get("/addWishlist", cartController.addWishlist);
router.get("/myWishlist", cartController.myWishlist);
router.get("/add-cart", cartController.wishlistToAddCart);
router.get("/deleteWishlist", cartController.deleteWishlist);
router.get("/deleteCart", cartController.deleteCart);
router.post("/applyCoupon", userCheckoutOrderControll.applyCoupon);
router.get("/removeCoupon", userCheckoutOrderControll.removeCoupon);
router.post("/repayOrder", userCheckoutOrderControll.repayOrder);
router.get("/repay", userCheckoutOrderControll.repay);
router.get("/error", userauth.error);


module.exports = router;
