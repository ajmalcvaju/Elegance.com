const mongoose = require("mongoose");
const Address= require("../model/addressModel");

const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1 
    },
    price: {
        type: Number
    },
    status: {
        type: String,
        default: 'Pending' 
    }
});

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [orderItemSchema], // Changed items to an array of orderItemSchema
    totalPrice: {
        type: Number
    },
    
    address: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Address'
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
