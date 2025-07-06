import Cart from '../models/cartModel.js';
import Order from '../models/orderModel.js';
import Product from '../models/productModel.js';
import snap from '../utils/midtrans.js';
import axios from 'axios'

export const checkoutCart = async (req, res) => {
    const userId = req.user.id;
    const { address } = req.body;

    try {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ msg: 'Cart is empty' });
        }

        let total = 0;
        const itemDetails = cart.items.map(item => {
            const itemTotal = item.product.price * item.quantity;
            total += itemTotal;
            return {
                id: item.product._id,
                price: item.product.price,
                quantity: item.quantity,
                name: item.product.productName
            };
        });

        const orderId = `ORDER-${Date.now()}`;
        const phone = req.user.phone || '+628123456789';

        // Midtrans transaction parameters
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: total
            },
            item_details: itemDetails,
            customer_details: {
                first_name: req.user.username,
                email: req.user.email,
                phone: phone,
                billing_address: {
                    first_name: req.user.username,
                    email: req.user.email,
                    phone: phone,
                    address: address,
                    city: 'Jakarta',
                    postal_code: '12345',
                    country_code: 'IDN'
                },
                shipping_address: {
                    first_name: req.user.username,
                    email: req.user.email,
                    phone: phone,
                    address: address,
                    city: 'Jakarta',
                    postal_code: '12345',
                    country_code: 'IDN'
                }
            },
            callbacks: {
                finish: 'http://localhost:3000/order-success'
            }
        };

        console.log('Midtrans Parameter:', parameter);

        // Create transaction with Midtrans
        const transaction = await snap.createTransaction(parameter);

        // Save order to database
        const order = new Order({
            user: userId,
            items: cart.items,
            total,
            address,
            phone: phone,
            email: req.user.email,
            paymentLink: transaction.redirect_url,
            transactionId: orderId,
            status: 'Pending'
        });

        await order.save();
        await Cart.findOneAndDelete({ user: userId });

        res.status(201).json({
            msg: 'Checkout successful',
            paymentUrl: transaction.redirect_url,
            token: transaction.token,
            order,
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ 
            msg: 'Server error during checkout',
            error: error.message 
        });
    }
};

export const handleMidtransNotification = async (req, res) => {
    try {
        const notification = req.body;
        console.log('Midtrans Notification:', notification);

        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        let order = await Order.findOne({ transactionId: orderId });
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Update order status based on Midtrans transaction status
        if (transactionStatus == 'capture') {
            if (fraudStatus == 'challenge') {
                order.status = 'Challenge';
            } else if (fraudStatus == 'accept') {
                order.status = 'Successful';
            }
        } else if (transactionStatus == 'settlement') {
            order.status = 'Successful';
        } else if (transactionStatus == 'cancel' || 
                   transactionStatus == 'deny' || 
                   transactionStatus == 'expire') {
            order.status = 'Cancelled';
        } else if (transactionStatus == 'pending') {
            order.status = 'Pending';
        } else if (transactionStatus == 'refund') {
            order.status = 'Refunded';
        } else if (transactionStatus == 'partial_refund') {
            order.status = 'Partial Refund';
        } else {
            order.status = 'Failed';
        }

        await order.save();

        res.status(200).json({
            msg: 'Payment status updated',
            status: transactionStatus
        });
    } catch (error) {
        console.error('Notification error:', error);
        res.status(500).json({ 
            msg: 'Server error processing notification',
            error: error.message 
        });
    }
};

// Remove Xendit notification handler since we're using Midtrans
export const handleXenditNotification = async (req, res) => {
    res.status(404).json({ msg: 'Xendit handler deprecated, using Midtrans' });
};

export const orderSuccessPage = async (req, res) => {
    try {
        const userId = req.user.id;
        const latestSuccessfulOrder = await Order.findOne({ 
            user: userId, 
            status: 'Successful' 
        }).sort({ createdAt: -1 }).limit(1);

        if (!latestSuccessfulOrder) {
            return res.status(404).json({ msg: 'No successful order found' });
        }

        res.json({
            msg: 'Order successfully processed',
            order: latestSuccessfulOrder
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

export const getOrder = async (req, res) => {
    const userId = req.user.id;

    try {
        const orders = await Order.find({ user: userId }).populate({
            path: 'items.product',
            select: '-createdAt -updatedAt'
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ msg: 'No orders found' });
        }

        const ordersWithImageUrls = orders.map(order => ({
            ...order._doc,
            items: order.items.map(item => {
                let product = item.product || {image: null};
                if (item.product != null) {
                    product = {
                        ...item.product._doc,
                        image: item.product.image
                            ? `${req.protocol}://${req.get('host')}${item.product.image}`
                            : null
                    }
                }
                return {
                    ...item._doc,
                    product: product
                }
            })
        }));

        res.json(ordersWithImageUrls);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

export const getOrderById = async (req, res) => {
    const { orderId } = req.params;

    try {
        const order = await Order.findOne({ transactionId: orderId }).populate('user', 'username').populate('items.product');
        
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        try {
            // Get transaction status from Midtrans
            const midtransResponse = await axios.get(
                `https://api.sandbox.midtrans.com/v2/${order.transactionId}/status`,
                {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                        Authorization: `Basic ${Buffer.from('SB-Mid-server-CEsX-3UaJAvJb8VUlnppza10:').toString('base64')}`
                    }
                }
            );

            const updatedOrder = {
                ...order._doc,
                midtransStatus: midtransResponse.data
            };

            res.json(updatedOrder);
        } catch (midtransError) {
            console.log('Midtrans API error:', midtransError.message);
            // Return order without Midtrans status if API call fails
            res.json(order);
        }
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};

export const getAllOrder = async (req, res) => {
    try {
        const orders = await Order.find().populate('user', 'username').populate('items.product');

        if (!orders) {
            return res.status(404).json({ msg: 'No orders found' });
        }

        res.json(orders);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};