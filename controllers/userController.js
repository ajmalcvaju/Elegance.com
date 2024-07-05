const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const OTPcode = require("../model/otpModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const Address = require("../model/addressModel");
const Review = require("../model/reviewModel");
const Wallet = require("../model/walletModel");
const fs=require('fs')
const path = require('path');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
});

const login = async (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const checkUserExist = async (req, res) => {
  try {
    const { username, email, mobileNumber } = req.body;
    if (username) {
      const user = await User.findOne({ username });
      res.json({ exists: !!user });
    } else if (email) {
      const user = await User.findOne({ email });
      res.json({ exists: !!user });
    } else if (mobileNumber) {
      const user = await User.findOne({ mobileNumber });
      res.json({ exists: !!user });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const checkreferralCodeExist=async(req,res)=>{
  const {referralCode}=req.body
  if(referralCode){
    const user = await User.findOne({ referralCode });
    res.json({ notExists: !user });
  }
}

const shop = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 6;
    const category = req.query.category;

    const query = category ? { category } : {};

    const totalProducts = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalProducts / limit);

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(limit);

    const categories = await Category.find({});

    res.render("user/shop-sidebar", {
      products,
      categories,
      currentPage: page,
      totalPages,
      login: req.session && req.session.email ? 1 : 0,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const home = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      // const featured = await Product.find({});
      const topDeal = await Product.find({ discount: { $gt: 10 } })
        .sort({ discount: -1 })
        .limit(8);
      const newArrival = await Product.find({})
        .sort({ PurchaseDate: -1 })
        .limit(8);
      const bestSellerProduct = await Product.find({})
        .sort({ soldCount: -1 })
        .limit(8);
      console.log("hi");
      res.render("user/home", {
        login: 1,
        bestSellerProduct,
        newArrival,
        topDeal,
      });
    } else {
      // const featured = await Product.find({});
      const topDeal = await Product.find({ discount: { $gt: 10 } })
        .sort({ discount: -1 })
        .limit(10);
      const newArrival = await Product.find({})
        .sort({ PurchaseDate: -1 })
        .limit(10);
      const bestSellerProduct = await Product.find({})
        .sort({ soldCount: -1 })
        .limit(10);
      res.render("user/home", {
        login: 0,
        bestSellerProduct,
        newArrival,
        topDeal,
      });
      console.log("hello");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const productDetails = async (req, res) => {
  try {
    const productId = req.query.id;
    const product = await Product.findOne({ _id: productId });
    const category = product.category;
    console.log(category);
    const suggestedProducts = await Product.find({ category }).limit(4);
    console.log(suggestedProducts);
    if (req.session && req.session.email) {
      res.render("user/product-details", {
        product,
        suggestedProducts,
        login: 1,
      });
    } else {
      res.render("user/product-details", {
        product,
        suggestedProducts,
        login: 0,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const sendVerifyMail = async (fname, lname, email, Otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "ajmalcvaju1997@gmail.com",
        pass: "esedwiugvfofnmvr",
      },
    });
    const mailOptions = {
      from: "ajmalcvaju1997@gmail.com",
      to: email,
      subject: "OTP verification from Elegance",
      html:
        "<p>Hi," +
        fname +
        " " +
        lname +
        ", OTP for verifying Your mail is " +
        Otp +
        ".This is valid Only for 5 Minuets.Do not Share with  Anyone.</p>",
    };
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email has been sent:-", info.response);
      }
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("user/signup");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const insertUser = async (req, res) => {
  try {
    const { username, email,fname,lname, mobileNumber, password,referralCode,confirmPassword } = req.body;
    const result = await cloudinary.uploader.upload(req.file.path);
    const user = new User({
      username: username,
      email: email,
      fname: fname,
      lname:lname,
      mobileNumber: mobileNumber,
      password: password,
      image: result.url,
      is_admin: 0,
    });
    console.log();
    const userData = await user.save();

    if(referralCode){
      const referrencedUser = await User.findOne({ referralCode });
      const referrencedUserID=referrencedUser._id
      const userID=userData._id
      const wallet = await Wallet.findOneAndUpdate(
        { userId: userID },
        { $inc: { amount: 600 } }, // Increment the amount by 600
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
      const refferalWallet = await Wallet.findOneAndUpdate(
        { userId: referrencedUserID },
        { $inc: { amount: 600 } }, // Increment the amount by 600
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
    const OTP = Math.floor(100000 + Math.random() * 900000);
    const otp = new OTPcode({
      userId: userData._id,
      otp: OTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000,
    });
    const otpData = await otp.save();

    sendVerifyMail(fname, lname, email, OTP);
    res.json({ success: true, userId: userData._id });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const otp = async (req, res) => {
  try {
    const userId = req.query.id;
    console.log(userId);
    res.render("user/otp", { userId: userId });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const verifyMail = async (req, res) => {
  try {
    let { otp, userId } = req.body;
    console.log(req.body);
    const Otps = await OTPcode.find({ userId });
    console.log(Otps);
    const user = await User.findOne({ _id: userId });
    console.log(user);
    const otpSend = Otps[0].otp;
    console.log(otpSend);
    const ExpiresAt = Otps[0].expiresAt;
    console.log(ExpiresAt);
    if (ExpiresAt < Date.now()) {
      res.render("user/otp", { expire: true });
    } else if (otpSend == otp) {
      updateInfo = await User.updateOne(
        { _id: userId },
        { $set: { is_verified: 1 } }
      );
      req.session.email = user.email;
      console.log(req.session.email);
      res.redirect("/");
    } else {
      res.render("user/otp", { invalid: true, userId });
    }

    updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    res.render("admin/User");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const reset = async (req, res) => {
  try {
    res.render("user/forgetPassword");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const resetPass = async (req, res) => {
  try {
    const { email } = req.body;
    const fUser = await User.findOne({ email });
    if (fUser) {
      const OTP = Math.floor(100000 + Math.random() * 900000);
      const otp = new OTPcode({
        userId: fUser._id,
        otp: OTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 300000,
      });
      const otpData = await otp.save();
      console.log(otpData);
      sendVerifyMail(fUser.fname, fUser.lname, fUser.email, OTP);
      res.render("user/otpForgetPassword", {
        email: fUser.email,
        UserId: fUser._id,
        Otp: otpData.otp,
      });
    } else {
      res.render("user/forgetPassword", { invalid: true });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const changePassword = async (req, res) => {
  try {
    let { otp, UserId } = req.body;
    console.log(otp);
    console.log(UserId);
    const Otps = await OTPcode.findOne({ userId: UserId });
    console.log(Otps);
    const otpSend = Otps.otp;
    console.log(otpSend);
    const ExpiresAt = Otps.expiresAt;
    console.log(ExpiresAt);
    if (ExpiresAt > Date.now()) {
      if (otpSend == otp) {
        updateInfo = await User.updateOne(
          { _id: UserId },
          { $set: { is_verified: 1 } }
        );
        res.render("user/changePassword", { UserId });
      } else {
        res.render("user/otpForgetPassword", { invalid: true, UserId });
      }
    } else {
      res.render("user/otpForgetPassword", { expire: true, UserId });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const resendOtp = async (req, res) => {
  try {
    const userId = req.body.userId;
    const OTP = Math.floor(100000 + Math.random() * 900000);
    const otp = new OTPcode({
      userId: userId,
      otp: OTP,
      createdAt: Date.now(),
      expiresAt: Date.now() + 300000,
    });
    const otpData = await otp.save();
    const user = await User.findOne({ _id: userId });
    console.log(user);
    sendVerifyMail(user.fname, user.lname, user.email, OTP);
    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const updatePassword = async (req, res) => {
  try {
    const { password, confirmPassword, UserId } = req.body;
    if (password == confirmPassword) {
      const user = await User.findOne({ _id: UserId });
      req.session.email = user.email;
      console.log(UserId);
      updateInfo = await User.updateOne(
        { _id: UserId },
        { $set: { password: password, is_verified: 1 } }
      );
      res.redirect("/");
    } else {
      res.render("user/changePassword", { passwordError: true });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const advanceSearch = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      req.session.category = req.query.category;
      req.session.priceSort = parseInt(req.query.Psort);
      req.session.alphabetSort = parseInt(req.query.Asort);
      const category = req.session.category;
      const priceSort = req.session.priceSort;
      const alphabetSort = req.session.alphabetSort;
      console.log(category);

      let products = [];
      if (category) {
        if (priceSort && alphabetSort) {
          if (priceSort == 1 && alphabetSort == 1) {
            products = await Product.find({ category }).sort({
              discountedPrice: 1,
              pname: 1,
            });
          } else if (priceSort == 1 && alphabetSort == -1) {
            products = await Product.find({ category }).sort({
              discountedPrice: 1,
              pname: -1,
            });
          } else if (priceSort == -1 && alphabetSort == 1) {
            products = await Product.find({ category }).sort({
              discountedPrice: -1,
              pname: 1,
            });
          } else if (priceSort == -1 && alphabetSort == -1) {
            products = await Product.find({ category }).sort({
              discountedPrice: -1,
              pname: -1,
            });
          }
        } else if (priceSort) {
          if (priceSort == 1) {
            products = await Product.find({ category }).sort({
              discountedPrice: 1,
            });
          } else if (priceSort == -1) {
            products = await Product.find({ category }).sort({
              discountedPrice: -1,
            });
          }
        } else if (alphabetSort) {
          if (alphabetSort == 1) {
            products = await Product.find({ category }).sort({
              pname: 1,
            });
          } else if (alphabetSort == -1) {
            products = await Product.find({ category }).sort({
              pname: -1,
            });
          }
        } else {
          products = await Product.find({ category });
        }
      } else {
        if (priceSort && alphabetSort) {
          if (priceSort == 1 && alphabetSort == 1) {
            products = await Product.find({}).sort({
              discountedPrice: 1,
              pname: 1,
            });
          } else if (priceSort == 1 && alphabetSort == -1) {
            products = await Product.find({}).sort({
              discountedPrice: 1,
              pname: -1,
            });
          } else if (priceSort == -1 && alphabetSort == 1) {
            products = await Product.find({}).sort({
              discountedPrice: -1,
              pname: 1,
            });
          } else if (priceSort == -1 && alphabetSort == -1) {
            products = await Product.find({}).sort({
              discountedPrice: -1,
              pname: -1,
            });
          }
        } else if (priceSort) {
          if (priceSort == 1) {
            products = await Product.find({}).sort({
              discountedPrice: 1,
            });
          } else if (priceSort == -1) {
            products = await Product.find({}).sort({
              discountedPrice: -1,
            });
          }
        } else if (alphabetSort) {
          if (alphabetSort == 1) {
            products = await Product.find({}).sort({
              pname: 1,
            });
          } else if (alphabetSort == -1) {
            products = await Product.find({}).sort({
              pname: -1,
            });
          }
        } else {
          products = await Product.find({});
        }
      }
      const categories = await Category.find({});

      const page = parseInt(req.query.page) || 1;
      const limit = 6;

      const query = category ? { category } : {};

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      res.render("user/shop-sidebar", {
        products,
        categories,
        login: 1,
        priceSort,
        alphabetSort,
        category,
        currentPage: page,
        totalPages,
      });
    } else {
      req.session.category = req.query.category;
      req.session.priceSort = parseInt(req.query.Psort);
      req.session.alphabetSort = parseInt(req.query.Asort);
      const category = req.session.category;
      const priceSort = req.session.priceSort;
      const alphabetSort = req.session.alphabetSort;
      console.log(category);

      let products = [];
      if (category) {
        if (priceSort && alphabetSort) {
          if (priceSort == 1 && alphabetSort == 1) {
            products = await Product.find({ category }).sort({
              discountedPrice: 1,
              pname: 1,
            });
          } else if (priceSort == 1 && alphabetSort == -1) {
            products = await Product.find({ category }).sort({
              discountedPrice: 1,
              pname: -1,
            });
          } else if (priceSort == -1 && alphabetSort == 1) {
            products = await Product.find({ category }).sort({
              discountedPrice: -1,
              pname: 1,
            });
          } else if (priceSort == -1 && alphabetSort == -1) {
            products = await Product.find({ category }).sort({
              discountedPrice: -1,
              pname: -1,
            });
          }
        } else if (priceSort) {
          if (priceSort == 1) {
            products = await Product.find({ category }).sort({
              discountedPrice: 1,
            });
          } else if (priceSort == -1) {
            products = await Product.find({ category }).sort({
              discountedPrice: -1,
            });
          }
        } else if (alphabetSort) {
          if (alphabetSort == 1) {
            products = await Product.find({ category }).sort({
              pname: 1,
            });
          } else if (alphabetSort == -1) {
            products = await Product.find({ category }).sort({
              pname: -1,
            });
          }
        } else {
          products = await Product.find({ category });
        }
      } else {
        if (priceSort && alphabetSort) {
          if (priceSort == 1 && alphabetSort == 1) {
            products = await Product.find({}).sort({
              discountedPrice: 1,
              pname: 1,
            });
          } else if (priceSort == 1 && alphabetSort == -1) {
            products = await Product.find({}).sort({
              discountedPrice: 1,
              pname: -1,
            });
          } else if (priceSort == -1 && alphabetSort == 1) {
            products = await Product.find({}).sort({
              discountedPrice: -1,
              pname: 1,
            });
          } else if (priceSort == -1 && alphabetSort == -1) {
            products = await Product.find({}).sort({
              discountedPrice: -1,
              pname: -1,
            });
          }
        } else if (priceSort) {
          if (priceSort == 1) {
            products = await Product.find({}).sort({
              discountedPrice: 1,
            });
          } else if (priceSort == -1) {
            products = await Product.find({}).sort({
              discountedPrice: -1,
            });
          }
        } else if (alphabetSort) {
          if (alphabetSort == 1) {
            products = await Product.find({}).sort({
              pname: 1,
            });
          } else if (alphabetSort == -1) {
            products = await Product.find({}).sort({
              pname: -1,
            });
          }
        } else {
          products = await Product.find({});
        }
      }
      const categories = await Category.find({});

      const page = parseInt(req.query.page) || 1;
      const limit = 6;

      const query = category ? { category } : {};

      const totalProducts = await Product.countDocuments(query);
      const totalPages = Math.ceil(totalProducts / limit);

      products = await Product.find(query)
        .skip((page - 1) * limit)
        .limit(limit);

      res.render("user/shop-sidebar", {
        products,
        categories,
        login: 0,
        priceSort,
        alphabetSort,
        category,
        currentPage: page,
        totalPages,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

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
const rating = async (req, res) => {
  try {
    if (req.session.email) {
      const {productId,comment,rating}=req.body
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      const existingReview = await Review.findOne({ userId, productId });
      if (existingReview) {
        return res.json({
          alreadyExist: true,
          message: "You have already reviewed this product.",
        });
      }
      const newRating = new Review({
        rating: rating,
        userId: userId,
        productId: productId,
        comment: comment,
      });
      newRating.save();
      res.json({ success: true });
    } else {
      res.json({ notLoggedIn: true });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const review = async (req, res) => {
  try {
    const productId = req.query.productId;
    const reviews = await Review.find({ productId }).populate("userId");
    res.json({ success: true, reviews });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

module.exports = {
  home,
  loadRegister,
  insertUser,
  verifyMail,
  reset,
  resetPass,
  changePassword,
  updatePassword,
  advanceSearch,
  shop,
  login,
  productDetails,
  review,
  rating,
  resendOtp,
  checkUserExist,
  otp,
  checkreferralCodeExist
};
