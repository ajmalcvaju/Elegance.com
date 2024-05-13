const mongoose = require("mongoose");
const Address= require("../model/addressModel");
const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: {type:String,required:true}, 
    totalPrice: {
        type: Number
    },
    status: {
        type: String,
        default: 'Pending' 
    }, address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
