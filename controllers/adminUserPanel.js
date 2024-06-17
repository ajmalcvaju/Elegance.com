const User = require("../model/userModel");
const adminUser = async (req, res) => {
  try {
    const users = await User.find({});
    res.render("admin/User", { users });
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

const UserExist= async (req, res) => {
  try {
    
    const userId=req.body.userId
    const { username,email, mobileNumber } = req.body;
    if(userId){
    const users = await User.findOne({ _id:userId })
    if(username && username!=users.username){
      const user = await User.findOne({ username });
  res.json({ exists: !!user });
    }else if(email && email!=users.email){
      const user = await User.findOne({ email });
    res.json({ exists: !!user });
    }else if(mobileNumber && mobileNumber!=users.mobileNumber){
      const user = await User.findOne({ mobileNumber });
    res.json({ exists: !!user });
    }}else{
      if(username){
        const user = await User.findOne({ username });
    res.json({ exists: !!user });
      }else if(email){
        const user = await User.findOne({ email });
      res.json({ exists: !!user });
      }else if(mobileNumber){
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
    const { username, email, mobileNumber, password, confirmPassword } =
      req.body;
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
        res.json({success:true})
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const blockUser = async (req, res) => {
  try {
    let proId = req.query.id;
    const updatedInfo = await User.updateOne(
      { _id: proId },
      { $set: { is_blocked: 1 } }
    );
    res.redirect("/admin/User");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};


const unBlockUser = async (req, res) => {
  try {
    let proId = req.query.id;
    const updatedInfo = await User.updateOne(
      { _id: proId },
      { $set: { is_blocked: 0 } }
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
  const userId=req.body.userId
  const { username, email, fname, lname, password, mobileNumber } = req.body;
  await User.updateOne(
    { _id: userId },
    { $set: { username, email, fname, lname, password, mobileNumber } }
  );
  res.json({success:true})
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
  UserExist
};
