const User = require("../model/userModel");
const nodemailer = require("nodemailer");
const OTPcode = require("../model/otpModel");
const Product=require("../model/productModel");


const home=async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const featured = await Product.find({});
      const topDeal= await Product.find({discount:{$gt:30}});
      console.log(topDeal)
      const topRated= await Product.find({});
      const newArrival= await Product.find({});
      res.render("user/home", { login: 1,topDeal });
    } else {
      const featured = await Product.find({});
      const topDeal= await Product.find({discount:{$gt:30}});
      const topRated= await Product.find({});
      const newArrival= await Product.find({});
      res.render("user/home", { login: 0,topDeal });
    }
  } catch (error) {
    console.log(error.message);
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
  }
};

const loadRegister = async (req, res) => {
  try {
    res.render("user/signup");
  } catch (error) {
    console.log(error.message);
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
  }
};
const reset = async (req, res) => {
  try {
    res.render("user/forgetPassword");
  } catch (error) {
    console.log(error.message);
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

    updateInfo = await User.updateOne(
      { _id: req.query.id },
      { $set: { is_verified: 1 } }
    );
    console.log(updateInfo);
    res.render("home");
  } catch (error) {
    console.log(error.message);
  }
};
const updatePassword = async (req, res) => {
  try {
    const { Password, confirmPassword, UserId } = req.body;
    if (Password == confirmPassword) {
      const user = await User.findOne({ _id: UserId });
      req.session.email = user.email;
      console.log(UserId);
      updateInfo = await User.updateOne(
        { _id: UserId },
        { $set: { password: Password } }
      );
      res.redirect("/");
    } else {
      res.render("user/changePassword", { passwordError: true });
    }
  } catch (error) {
    console.log(error.message);
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
};
