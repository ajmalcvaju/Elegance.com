const User = require("../model/userModel");
const fs = require("fs");
const path = require("path");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
});

const adminUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;

    const totalusers = await User.countDocuments({});
    const totalPages = Math.ceil(totalusers / limit);

    const users = await User.find({})
      .skip((page - 1) * limit)
      .limit(limit);
    res.render("admin/User", { users, currentPage: page, totalPages });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const adminCategory = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/category", { users });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const addUser = async (req, res) => {
  try {
    res.render("admin/addUser");
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const UserExist = async (req, res) => {
  try {
    const { username, userId, email, mobileNumber } = req.body;
    if (userId) {
      const users = await User.findOne({ _id: userId });
      if (username && username != users.username) {
        const user = await User.findOne({ username });
        res.json({ exists: !!user });
      } else if (email && email != users.email) {
        const user = await User.findOne({ email });
        res.json({ exists: !!user });
      } else if (mobileNumber && mobileNumber != users.mobileNumber) {
        const user = await User.findOne({ mobileNumber });
        res.json({ exists: !!user });
      }
    } else {
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
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const updateUser = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    const {
      username,
      email,
      mobileNumber,
      fname,
      lname,
      password,
      confirmPassword,
    } = req.body;
    const user = new User({
      username: username,
      email: email,
      fname: fname,
      lname: lname,
      mobileNumber: mobileNumber,
      password: password,
      image: result.url,
      is_admin: 0,
    });
    const userData = await user.save();
    res.redirect("/admin/User");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const updateUserBlockStatus = async (req, res) => {
  try {
    let userId = req.query.id;
    let status = req.query.status;
    let isBlocked = status === "block" ? 1 : 0;

    const updatedInfo = await User.updateOne(
      { _id: userId },
      { $set: { is_blocked: isBlocked } }
    );
    res.redirect("/admin/User");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const editUser = async (req, res) => {
  try {
    let proId = req.query.id;
    const user = await User.findOne({ _id: proId });
    res.render("admin/editUser", { user });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const updatingUser = async (req, res) => {
  const { userId, username, email, fname, lname, password, mobileNumber } =
    req.body;
  await User.updateOne(
    { _id: userId },
    { $set: { username, email, fname, lname, password, mobileNumber } }
  );
  res.redirect("/admin/User");
};
module.exports = {
  adminUser,
  adminCategory,
  addUser,
  updateUserBlockStatus,
  updateUser,
  editUser,
  updatingUser,
  UserExist,
};
