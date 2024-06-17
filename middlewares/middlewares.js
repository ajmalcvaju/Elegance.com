const multer = require("multer");
const path = require("path");

const checkSession = (req, res, next) => {
  if (req.session && req.session.email) {
    return res.redirect("/");
  }
  next();
};
const checkSession2 = (req, res, next) => {
  if (req.session && req.session.email) {
    return res.redirect("/");
  }
  next();
};
const checkSession3 = (req, res, next) => {
  if (req.session && req.session.email) {
    return res.redirect("/admin/dashboard");
  }
  next();
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../public/productImages"));
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });



module.exports = { checkSession, checkSession2, checkSession3 };
