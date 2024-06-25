const Coupon = require("../model/couponModel");
const manageCoupon = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalcoupons = await Coupon.countDocuments({});
    const totalPages = Math.ceil(totalcoupons / limit);
    const coupons = await Coupon.find({})
      .skip((page - 1) * limit)
      .limit(limit);
    res.render("admin/coupons", { coupons,currentPage: page,
      totalPages });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const editCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    const coupon = await Coupon.findOne({ _id: couponId });
    res.render("admin/editCoupon", { coupon });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const CouponExist = async (req, res) => {
  try {
    const { couponCode, couponId } = req.body;
    console.log(req.body);
    if (couponId) {
      const coupon = await Coupon.findOne({ _id: couponId });
      if (couponCode != coupon.couponCode) {
        const coupons = await Coupon.findOne({ couponCode });
        res.json({ exists: !!coupons });
      }
    } else {
      const coupons = await Coupon.findOne({ couponCode });
      res.json({ exists: !!coupons });
    }
  } catch {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};

const deleteCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    await Coupon.deleteOne({ _id: couponId });
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const addCoupon = async (req, res) => {
  try {
    res.render("admin/addCoupon");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const editingCoupon = async (req, res) => {
  try {
    const couponId = req.query.id;
    const editedCoupon = req.body;
    const coupon = await Coupon.updateOne({ _id: couponId }, editedCoupon);
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
const addingCoupon = async (req, res) => {
  try {
    const newCoupon = req.body;
    const coupon = await Coupon.create(newCoupon);
    const couponData = await coupon.save();
    res.redirect("/admin/coupons");
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error");
  }
};
module.exports = {
  manageCoupon,
  editCoupon,
  deleteCoupon,
  addCoupon,
  editingCoupon,
  addingCoupon,
  CouponExist,
};
