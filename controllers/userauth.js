const User = require("../model/userModel");
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      if (user.is_blocked == 1) {
        res.render("user/login", { blocked: true });
      } else if (user && password === user.password) {
        req.session.email = email;
        res.redirect("/");
      }
    } else {
      console.log("hi");
      res.render("user/login", { invalid: true });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};
const googleAuth = (req, res) => {
  try {
    req.session.email = req.user.email;
    res.redirect("/");
  } catch (error) {
    console.log(error.message);
    res.redirect("/error");
  }
};

const error = async (req, res) => {
  res.render("user/errorPage");
};

module.exports = { login, error, googleAuth };
