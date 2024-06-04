const Order = require("../model/orderModel");
const salesReport=async(req,res)=>{
    try {
        const orders = await Order.find({})
      .populate("items.productId")
      .populate("userId");
      const ordersString = JSON.stringify(orders);
       res.render("admin/salesReport",{ orders: ordersString }) 
       console.log(orders)
    } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error")
    }
}

const dashboard=async(re,res)=>{
    try {
        const orders = await Order.find({})
      .populate("items.productId")
      .populate("userId");
      const ordersString = JSON.stringify(orders);
       res.render("admin/admindashboard",{ orders: ordersString }) 
    } catch (error) {
    console.log(error.message);
    res.redirect("/admin/error")
    }
}

module.exports={salesReport,dashboard}