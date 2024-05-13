const admin = {
  email: "ajmalcvaju97@gmail.com",
  password: "Ajmal12@",
};
const loginLoad = async (req, res) => {
  try {
    res.render("admin/adminLogin");
  } catch (error) {
    console.log(error.message);
  }
};

const verifyLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email === admin.email && password === admin.password) {
      req.session.email = email;
      console.log(req.session.email);
      res.render("admin/admindashboard");
    } else {
      res.render("admin/adminLogin", { invalid: true });
    }
  } catch (error) {
    console.log(error.message);
  }
};
const loadDashboard = async (req, res) => {
  try {
    res.render("admin/admindashboard");
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loginLoad,
  verifyLogin,
  loadDashboard,
};
