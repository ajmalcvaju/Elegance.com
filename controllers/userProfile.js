const User = require("../model/userModel");
const Address = require("../model/addressModel");
const openProfile = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      const addresses = await Address.find({ userId });
      res.render("user/my-profile", { user, addresses });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
};
const addAddress = async (req, res) => {
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
    res.redirect("/myProfile");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
};
const editAddress = async (req, res) => {
  try {
    const addId = req.query.id;
    console.log(addId);
    const { houseName, street, district, state, pincode, addressType } =
      req.body;
    await Address.updateOne(
      { _id: addId },
      { $set: { houseName, street, district, state, pincode, addressType } }
    );
    const email = req.session.email;
    const user = await User.findOne({ email });
    const userId = user._id;
    const addresses = await Address.find({ userId });

    res.redirect("/myProfile");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
};
const changePassword = async (req, res) => {
  try {
    res.render("user/changePasswordProfile");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
};
const updatePassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (password == confirmPassword) {
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      console.log(userId);
      updateInfo = await User.updateOne(
        { _id: userId },
        { $set: { password: password } }
      );
      res.redirect("/myProfile");
    } else {
      res.render("user/changePassword", { passwordError: true });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error") 
  }
};

module.exports = {
  openProfile,
  addAddress,
  editAddress,
  changePassword,
  updatePassword,
};
