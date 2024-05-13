const mongoose = require('mongoose');



const cartSchema = new mongoose.Schema({
  userId:{type:mongoose.Schema.Types.ObjectId,ref: "User", required: true},
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product',required: true},
  quantity: { type: Number, default: 1, min: 1 },
  pname:{type:String,required:true},
  image:{ type: [String], required:true },
  category:{type:String,required:true},
  discountedPrice:{type:Number,required:true},
  totalPrice: {
    type: Number,
    get: function() {
      return this.quantity * this.discountedPrice;
    }
  }
});

const Cart= mongoose.model('Cart', cartSchema);
module.exports=Cart