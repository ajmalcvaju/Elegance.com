const Order=require("../model/orderModel")

const adminOrder=async(req,res)=>{
    try{
        const order=await Order.find({}).populate('items.productId').populate('items.userId')
        console.log(order)
        res.render("admin/orders",{order})
    }catch{
        console.log(error.message)
    }
  }


module.exports={adminOrder}