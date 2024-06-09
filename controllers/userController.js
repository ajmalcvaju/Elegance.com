const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const OTPcode = require("../model/otpModel");
const Product = require("../model/productModel");
const Category = require("../model/categoryModel");
const Address = require("../model/addressModel");
const Review = require("../model/reviewModel");


const login = async (req, res) => {
  try {
    res.render("user/login");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
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
        .limit(10);
      const newArrival = await Product.find({})
        .sort({ PurchaseDate: -1 })
        .limit(10);
      const bestSellerProduct = await Product.find({})
        .sort({ soldCount: -1 })
        .limit(10);
      console.log(bestSellerProduct);
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
      console.log(bestSellerProduct);
      res.render("user/home", {
        login: 0,
        bestSellerProduct,
        newArrival,
        topDeal,
      });
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
  const { username, email, mobileNumber, password, confirmPassword } = req.body;
  const user1 = await User.find({ username });
  const user2 = await User.find({ email });
  const user3 = await User.find({ mobileNumber });
  console.log(user1);
  if (user1[0]) {
    res.render("user/signup", { Username: true });
  } else if (user2[0]) {
    res.render("user/signup", { Email: true });
  } else if (user3[0]) {
    res.render("user/signup", { MobileNumber: true });
  } else if (password != confirmPassword) {
    res.render("user/signup", { Password: true });
  } else {
    try {
      req.session.email = email;
      const user = new User({
        username: req.body.username,
        email: req.body.email,
        fname: req.body.fname,
        lname: req.body.lname,
        mobileNumber: req.body.mobileNumber,
        password: req.body.password,
        image: req.file.filename,
        is_admin: 0,
      });
      console.log();
      const userData = await user.save();
      const OTP = Math.floor(100000 + Math.random() * 900000);
      const otp = new OTPcode({
        userId: userData._id,
        otp: OTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 300000,
      });
      const otpData = await otp.save();
      if (userData) {
        sendVerifyMail(req.body.fname, req.body.lname, req.body.email, OTP);
        res.render("user/otp", {
          email: userData.email,
          UserId: userData._id,
          otp: otpData.otp,
        });
      } else {
        res.render("user/otp", { invalid: true });
      }
    } catch (error) {
      console.log(error.message);
      res.redirect("/error");
    }
  }
};
const verifyMail = async (req, res) => {
  try {
    let { otp, UserId } = req.body;
    console.log(otp);
    console.log(UserId);
    const Otps = await OTPcode.find({ userId: UserId });
    console.log(Otps);
    const otpSend = Otps[0].otp;
    console.log(otpSend);
    const ExpiresAt = Otps[0].expiresAt;
    console.log(ExpiresAt);
    if (ExpiresAt < Date.now()) {
      res.render("user/otp", { expire: true });
    } else if (otpSend == otp) {
      updateInfo = await User.updateOne(
        { _id: UserId },
        { $set: { is_verified: 1 } }
      );
      res.redirect("/");
    } else {
      res.render("user/otp", { invalid: true, UserId });
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
        console.log("2")
      }
    } else {
      res.render("user/otpForgetPassword", { expire: true, UserId });
      console.log("3")
    }

    // updateInfo = await User.updateOne(
    //   { _id: req.query.id },
    //   { $set: { is_verified: 1 } }
    // );
    // console.log(updateInfo);
    // res.render("home");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const resendOtp=async(req,res)=>{
  try {
    const userId= req.body.userId
      const OTP = Math.floor(100000 + Math.random() * 900000);
      const otp = new OTPcode({
        userId: userId,
        otp: OTP,
        createdAt: Date.now(),
        expiresAt: Date.now() + 300000,
      });
      const otpData = await otp.save();
    const user = await User.findOne({_id:userId});
    console.log(user)
    sendVerifyMail(user.fname, user.lname, user.email, OTP);
    res.json({success:true})
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
}

const updatePassword = async (req, res) => {
  try {
    const { password, confirmPassword, UserId } = req.body;
    if (password == confirmPassword) {
      const user = await User.findOne({ _id: UserId });
      req.session.email = user.email;
      console.log(UserId);
      updateInfo = await User.updateOne(
        { _id: UserId },
        { $set: { password: password,is_verified: 1 } }
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
      res.render("user/shop-sidebar", {
        products,
        categories,
        login: 1,
        priceSort,
        alphabetSort,
        category,
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
      res.render("user/shop-sidebar", {
        products,
        categories,
        login: 0,
        priceSort,
        alphabetSort,
        category,
      });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
    res.status(500).send("Internal Server Error");
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
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      const productId = req.body.productId;
      const existingReview = await Review.findOne({ userId, productId });
      if (existingReview) {
        return res.json({
          alreadyExist: true,
          message: "You have already reviewed this product.",
        });
      }
      const newRating = new Review({
        rating: req.body.rating,
        userId: userId,
        productId: productId,
        comment: req.body.comment,
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
const review= async (req, res) => {
  try {
      const productId = req.query.productId;
      const reviews = await Review.find({ productId }).populate('userId')
      res.json({ success: true, reviews });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
}

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
  resendOtp
};
