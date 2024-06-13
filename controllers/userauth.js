const User = require("../model/userModel");
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user.is_blocked == 1) {
      res.render("user/login", { blocked: true });
    } else if (user && password === user.password) {
      req.session.email = email;
      res.redirect("/");
    } else {
      res.redirect("/");
    }
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
};



const error = async (req, res) => {
  res.render("user/errorPage");
};

module.exports = { login, error };
