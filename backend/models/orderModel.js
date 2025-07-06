import mongoose from "mongoose";
import { type } from "os";

const OrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Product',
            required: true
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    total: { type: Number, required: true },
    address: { type: String, required: true },
    phone: { type: String},
    email: {type: String},
    paymentLink: { type: String },
    transactionId: { type: String, unique: true },
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', OrderSchema);
export default Order;
