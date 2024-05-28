const Coupon = require("../model/couponModel");
const manageCoupon=async(req,res)=>{
    try {
        let coupons = await Coupon.find({});
        res.render("admin/coupons",{coupons})
    } catch (error) {
        console.log(error.message);
    }
}
const editCoupon=async(req,res)=>{
    try {
        const couponId=req.query.id
        const coupon=await Coupon.findOne({ _id: couponId });
        res.render("admin/editCoupon",{coupon})
    } catch (error) {
        console.log(error.message);
    }
}
const deleteCoupon=async(req,res)=>{
    try {
      const couponId=req.query.id
      await Coupon.deleteOne({_id:couponId})
      res.redirect("/admin/coupons")
    } catch (error) {
        console.log(error.message);
    }
}
const addCoupon=async(req,res)=>{
    try {
       res.render("admin/addCoupon")
    } catch (error) {
        console.log(error.message);
    }
}
const editingCoupon=async(req,res)=>{
    try {
       const couponId=req.query.id
       const editedCoupon=req.body
       const coupon = await Coupon.updateOne({_id:couponId},editedCoupon);
       res.redirect("/admin/coupons")
    } catch (error) {
        console.log(error.message);
    }
}
const addingCoupon=async(req,res)=>{
    try {
        const newCoupon=req.body
        const coupon = await Coupon.create(newCoupon);
        const couponData = await coupon.save();
        res.redirect("/admin/coupons")
    } catch (error) {
        console.log(error.message);
    }
}
module.exports={manageCoupon,editCoupon,deleteCoupon,addCoupon,editingCoupon,addingCoupon}