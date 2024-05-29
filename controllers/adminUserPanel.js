const User = require("../model/userModel");
const adminUser = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/User", { users });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
};

const adminCategory = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/category", { users });
  } catch {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
};

const addUser = async (req, res) => {
  try {
    res.render("admin/addUser");
  } catch {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
};
const updateUser = async (req, res) => {
  try {
    const { username, email, mobileNumber, password, confirmPassword } =
      req.body;
    const user1 = await User.find({ username });
    const user2 = await User.find({ email });
    const user3 = await User.find({ mobileNumber });
    console.log(user1);
    if (user1[0]) {
      res.render("admin/addUser", { Username: true });
    } else if (user2[0]) {
      res.render("admin/addUser", { Email: true });
    } else if (user3[0]) {
      res.render("admin/addUser", { MobileNumber: true });
    } else {
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
      const userData = await user.save();
      if (userData) {
        const users = await User.find({});
        res.render("admin/User", { users });
      } else {
        res.render("admin/addUser");
      }
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error") 
  }
};
const blockUser = async (req, res) => {
  let proId = req.query.id;
  const updatedInfo = await User.updateOne(
    { _id: proId },
    { $set: { is_blocked: 1 } }
  );
  res.redirect("/admin/User");
};
const unBlockUser = async (req, res) => {
  let proId = req.query.id;
  const updatedInfo = await User.updateOne(
    { _id: proId },
    { $set: { is_blocked: 0 } }
  );
  res.redirect("/admin/User");
};
const editUser = async (req, res) => {
  let proId = req.query.id;
  const user = await User.findOne({ _id: proId });
  res.render("admin/editUser", { user });
};
const updatingUser = async (req, res) => {
  const proId = req.query.id;
  console.log(req.query);
  const { username, email, fname, lname, password, mobileNumber } = req.body;
  console.log(proId);
  await User.updateOne(
    { _id: proId },
    { $set: { username, email, fname, lname, password, mobileNumber } }
  );
  res.redirect("/admin/user");
};
module.exports = {
  adminUser,
  adminCategory,
  addUser,
  blockUser,
  unBlockUser,
  updateUser,
  editUser,
  updatingUser,
};
