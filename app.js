var createError = require("http-errors");
var express = require("express");
const session = require("express-session");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const noCache = require("nocache");
const mongoose = require("mongoose");
require("dotenv").config()
const Razorpay=require('razorpay')

const razorpayInstance=new Razorpay({
  key_id:"rzp_test_8qF3L1nSyCD4kf",
  key_secret:"XKCeAFQwm8d8xEv8684Sgqsh"
})


var usersRouter = require("./routes/userRoute");
var adminRouter = require("./routes/adminRoute");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(noCache());

app.use(
  session({
    secret: "my_key",
    resave: false,
    saveUninitialized: true,
  })
);

app.use(function (req, res, next) {
  res.header("Cache-Control", "no-cache, no-store, must-revalidate");
  res.header("Pragma", "no-cache");
  res.header("Expires", "0");
  res.header("X-Content-Type-Options", "nosniff");
  next();
});
mongoose
  .connect("mongodb://localhost:27017/NewUsers")
  .then(() => {
    console.log("mongodb connected successfuly");
  })
  .catch(() => {
    console.log("Failed to connect");
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

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
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

module.exports = app;
