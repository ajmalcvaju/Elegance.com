const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema], 
    totalPrice: {
        type: Number
    },
    status: {
        type: String,
        default: 'Pending' 
    }
});

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
