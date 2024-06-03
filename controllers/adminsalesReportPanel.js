const Order = require("../model/orderModel");
const salesReport=async(req,res)=>{
    try {
        const order = await Order.find({})
      .populate("items.productId")
      .populate("userId");
       res.render("admin/salesReport",{ order }) 
    } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error")
    }
}



module.exports={salesReport}