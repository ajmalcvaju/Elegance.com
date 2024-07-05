var createError = require("http-errors");
var express = require("express");
const session = require("express-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const noCache = require("nocache");
const mongoose = require("mongoose");
require("dotenv").config();
const MongoStore = require("connect-mongo");
const Passport = require("./config/passport");
const passport = require("passport");
const Razorpay = require("razorpay");
const cors = require("cors");

var usersRouter = require("./routes/userRoute");
var adminRouter = require("./routes/adminRoute");

var app = express();

app.use(cors());

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

const paths=path.join(__dirname,"public")
app.use(express.static("public"));
console.log(paths)


app.use(noCache());

app.use(
  session({
    secret: "my_key",
    resave: false,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use(function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.header("X-Content-Type-Options", "nosniff");
  next();
});



app.use("/", usersRouter);
app.use("/admin", adminRouter);
app.get("/signout", (req, resp) => {
  req.session.email = null;
  resp.render("admin/adminLogin");
});
app.get("/uSignout", (req, resp) => {
  req.session.email = null;
  resp.redirect("/login");
});


const hbs = require("hbs");

hbs.registerHelper("range", function (start, end) {
  let result = [];
  for (let i = start; i <= end; i++) {
    result.push(i);
  }
  return result;
});

hbs.registerHelper("add", function (value, addition) {
  return value + addition;
});

hbs.registerHelper("subtract", function (value, subtraction) {
  return value - subtraction;
});

hbs.registerHelper("gt", function (value1, value2) {
  return value1 > value2;
});

hbs.registerHelper("lt", function (value1, value2) {
  return value1 < value2;
});

hbs.registerHelper("eq", function (value1, value2) {
  return value1 === value2;
});


const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB', err));

app.use((err, req, res, next) => {
  console.error(err.stack);

  if (res.headersSent) {
      return next(err);
  }
  res.status(500).render('user/errorPage'); 
})

module.exports = app;
