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

const notlogged = (req, res, next) => {
  try {
    if (req.session.email) {
      res.redirect('/admin/dashboard')
    } else {
      next()
    }
  } catch (error) {
    console.log(error.message);
  }
}
const loggedIn = (req, res, next) => {
  try {
    if (req.session.email) {
      next()
    } else {
      res.redirect('/admin/adminLogin')
    }
  } catch (error) {
    console.log(error.message);
  }
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/productImages/");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload = multer({ storage: storage });
const productImage = upload.array("image", 4);

const uploadNone = upload.none();

const storage2 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/userImages/');
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload2 = multer({ storage: storage2 });
const userImage = upload2.single("image");

const storage3 = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null,"public/categoryImages/");
  },
  filename: function (req, file, cb) {
    const name = Date.now() + "-" + file.originalname;
    cb(null, name);
  },
});
const upload3 = multer({ storage: storage3 });

const categoryImage = upload3.single("image");

module.exports = {
  checkSession,
  checkSession2,
  checkSession3,
  productImage,
  uploadNone,
  userImage,
  categoryImage,
  notlogged,
  loggedIn,
  notlogged,
  loggedIn
};
