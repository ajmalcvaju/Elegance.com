// var express = require('express');
// const user_route=express()
// const userController=require("../controllers/userController")
// user_route.get("/register",userController.loadRegister)
// module.exports=user_route;
const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const User = require("../model/userModel");
const Address=require("../model/addressModel");
const userauth = require("../controllers/userauth");
const middleware = require("../middlewares/middlewares");
const cartController=require("../controllers/cartController")
const Cart=require("../model/cartModel")


router.get("/",userController.home) 
router.get("/login", middleware.checkSession, async (req, res) => {
  res.render("user/login");
});
router.post("/login", userauth.login);
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/userImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });

router.get("/signup", middleware.checkSession2, userController.loadRegister);
router.post("/signup", upload.single("image"), userController.insertUser);
router.post("/signup/verify", userController.verifyMail);

router.get("/reset", userController.reset);
router.post("/reset", userController.resetPass);
router.post("/reset/verify", userController.changePassword);
router.post("/reset/new-password", userController.updatePassword);

router.get("/shop", async (req, res) => {
  if (req.session && req.session.email) {
    const products = await Product.find({});
    const categories = await Category.find({});
    res.render("user/shop-sidebar", { products, categories, login: 1 });
  } else {
    const products = await Product.find({});
    const categories = await Category.find({});
    res.render("user/shop-sidebar", { products, categories, login: 0 });
  }
});
router.get("/home", async (req, res) => {
  res.render("user/home");
});
router.get("/product-details", async (req, res) => {
  if (req.session && req.session.email) {
    const Products = await Product.find({ _id: req.query.id });
    const product = Products[0];
    res.render("user/product-details", { product, login: 1 });
  } else {
    const Products = await Product.find({ _id: req.query.id });
    const product = Products[0];
    res.render("user/product-details", { product, login: 0 });
  }
});
router.get("/myProfile",async (req, res) =>{
    const email=req.session.email
    const user = await User.findOne({email});
    const userId = user._id
    const addresses = await Address.find({ userId });
    res.render("user/my-profile",{user,addresses})
   
 })

 router.get("/myProfile/add-address",async (req, res) =>{
  res.render("user/add-address")
 }) 
 router.post("/myProfile/add-address",async (req, res) =>{
  const {houseName,street,district,state,pincode,addressType}=req.body
  const email=req.session.email
  const user = await User.findOne({ email });
  const userId=user._id 
  console.log(userId) 
  const address=new Address({userId:userId,houseName:houseName,street:street,district:district,state:state,pincode:pincode,addressType:addressType})
  const addressData=await address.save()
  
  const addresses = await Address.find({ userId });
  res.render("user/my-profile",{user,addresses})

 }) 
 router.get("/edit-address",async (req, res) =>{
  const addId=req.query.id
  console.log(addId)
  const address = await Address.findOne({ _id:addId });
  res.render("user/edit-address",{address})
 })  
 router.post("/edit-address",async (req, res) =>{
  const addId=req.query.id
  console.log(addId)
  const {houseName,street,district,state,pincode,addressType}=req.body
  await Address.updateOne(
    { _id: addId },
    { $set: {houseName,street,district,state,pincode,addressType} }
  );
  const email=req.session.email
    const user = await User.findOne({email});
    const userId = user._id
    const addresses = await Address.find({ userId });
  res.render("user/my-profile",{user,addresses}) 
 }) 
 router.get("/deconste-address",async (req, res) => {
  const addId = req.query.id;
  await Address.deconsteOne({ _id: addId });
  res.redirect("/myProfile");
});
router.get("/edit-profile",async (req, res) => {
  const email=req.session.email
  const user = await User.findOne({email});
  res.render("user/edit-profile",{user})
});
router.post("/edit-profile",async (req, res) => {
  const userId = req.query.id;
  const {username,fname,lname,mobileNumber}=req.body
  await User.updateOne(
    { _id: userId },
    { $set: {username,fname,lname,mobileNumber} }
  )
  res.redirect("/myProfile")
});

const hbs = require('hbs');
hbs.registerHelper('incrementIndex', function(index) {
    return index + 1;
});

router.get('/add-to-cart',cartController.addToCart);
// router.post('/update-cart', cartController.updateCart);
// router.post('/checkout', cartController.checkout);

router.get('/cart', cartController.cart);
router.get('/incrementItem', cartController.incCart);
router.get('/decrementItem', cartController.decCart);

router.get('/checkout', cartController.checkout);

router.post('/placeOrder', cartController.placeOrder);

router.get('/orderStatus', cartController.orderStatus);

module.exports = router;
