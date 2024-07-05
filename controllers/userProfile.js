const User = require("../model/userModel");
const Address = require("../model/addressModel");
const Wallet = require("../model/walletModel");
 
const openProfile = async (req, res) => {
  try {
    if (req.session && req.session.email) {
      const email = req.session.email;
      const user = await User.findOne({ email });
      const userId = user._id;
      const addresses = await Address.find({ userId });
      const page = parseInt(req.query.page) || 1;
const limit = 10;

const totalwallet = await Wallet.countDocuments({});
const totalPages = Math.ceil(totalwallet / limit);

// Fetch user wallet
const wallet = await Wallet.findOne({ userId });

// Paginate transactions
const totalTransactions = wallet.transactions.length;
const transactionPages = Math.ceil(totalTransactions / limit);
const transactions = wallet.transactions.slice((page - 1) * limit, page * limit);

      res.render("user/my-profile", { user, addresses,wallet,transactions,
        currentPage: page,
        transactionPages, });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
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
    res.redirect("/error");
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
    res.redirect("/error");
  }
};
const changePassword = async (req, res) => {
  try {
    res.render("user/changePasswordProfile");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
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
    res.redirect("/error");
  }
};
const changeAddress = async (req, res) => {
  try {
    const addId = req.query.id;
    const address = await Address.findOne({ _id: addId });
    res.render("user/edit-address", { address, checkout: 0 });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

deleteAddress = async (req, res) => {
  try {
    const addId = req.query.id;
    console.log(addId);
    await Address.deleteOne({ _id: addId });
    res.redirect("/myProfile");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const editProfile = async (req, res) => {
  try {
    const email = req.session.email;
    const user = await User.findOne({ email });
    res.render("user/edit-profile", { user });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const updateProfile = async (req, res) => {
  try {
    const userId = req.query.id;
    const { username, fname, lname, mobileNumber } = req.body;
    await User.updateOne(
      { _id: userId },
      { $set: { username, fname, lname, mobileNumber } }
    );
    res.redirect("/myProfile");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const addAddres = async (req, res) => {
  try {
    res.render("user/add-address", { checkout: 0 });
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

module.exports = {
  openProfile,
  addAddress,
  editAddress,
  changePassword,
  updatePassword,
  changeAddress,
  deleteAddress,
  editProfile,
  updateProfile,
  addAddres,
};
