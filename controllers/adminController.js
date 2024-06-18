const admin = {
  email: process.env.adminEmail,
  password: process.env.adminPassword,
};
const loginLoad = async (req, res) => {
  try {
    res.render("admin/adminLogin");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === admin.email && password === admin.password) {
      req.session.email = email;
      console.log(req.session.email);
      res.json({ success: true });
    } else {
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const loadDashboard = async (req, res) => {
  try {
    res.render("admin/admindashboard");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

module.exports = {
  loginLoad,
  verifyLogin,
  loadDashboard,
};
