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
        const orderItems = cart.items.map(item => {
            total += item.product.price * item.quantity;
            return {
                id: item.product._id.toString(),
                price: item.product.price,
                quantity: item.quantity,
                name: item.product.productName,
            };
        });

        const parameter = {
            transaction_details: {
                order_id: `ORDER-${Date.now()}`, // ID unik untuk transaksi
                gross_amount: total,
            },
            item_details: orderItems,
            customer_details: {
                email: req.user.email,
                first_name: req.user.username,
                phone: req.user.phone || '08123456789',
                shipping_address: address,
            },
            callbacks: {
                finish: 'http://localhost:3000/', // URL untuk kembali ke website
            }
        };

        console.log(parameter)

        const transaction = await snap.createTransaction(parameter);

        const order = new Order({
            user: userId,
            items: cart.items,
            total: total,
            address: address,
            paymentLink: transaction.redirect_url,
            transactionId: parameter.transaction_details.order_id // Simpan transaction ID
        });

        await order.save();

        // Kosongkan keranjang setelah checkout berhasil
        await Cart.findOneAndDelete({ user: userId });

        res.status(201).json({ 
            msg: 'Checkout successful', 
            paymentUrl: transaction.redirect_url, 
            order,
            finishUrl: 'http://localhost:3000/order/success' 
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
};


export const handleMidtransNotification = async (req, res) => {
    try {
        const notification = req.body;
        const statusResponse = await snap.transaction.notification(notification);
        console.log(statusResponse)

        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;

        let order = await Order.findOne({ transactionId: orderId });
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Update order status based on Midtrans transaction status
        switch(transactionStatus) {
            case 'capture':
            case 'settlement':
                order.status = 'Successful';
                break;
            case 'cancel':
            case 'expire':
                order.status = 'Cancelled';
                break;
            case 'pending':
                order.status = 'Pending';
                break;
            default:
                order.status = 'Failed';
        }

        await order.save();

        res.status(200).json({
            msg: 'Payment status updated',
            status: transactionStatus,
            redirectUrl: '/' // Redirect user to success page
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server error');
    }
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
        // Ambil semua pesanan milik pengguna berdasarkan userId
        const orders = await Order.find({ user: userId }).populate({
            path: 'items.product',
            select: '-createdAt -updatedAt' // Mengabaikan timestamps
        });

        if (!orders || orders.length === 0) {
            return res.status(404).json({ msg: 'No orders found' });
        }

        // Modifikasi setiap produk dalam items untuk menambahkan URL gambar lengkap
        const ordersWithImageUrls = orders.map(order => ({
            ...order._doc,
            items: order.items.map(item => ({
                ...item._doc,
                product: {
                    ...item.product._doc,
                    image: item.product.image
                        ? `${req.protocol}://${req.get('host')}${item.product.image}`
                        : null
                }
            }))
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
        // Cari order berdasarkan orderId
        const order = await Order.findOne({ transactionId: orderId }).populate('user', 'username').populate('items.product');
        console.log(order)
        if (!order) {
            return res.status(404).json({ msg: 'Order not found' });
        }

        // Panggil API Midtrans untuk mendapatkan status order
        const midtransResponse = await axios.get(
            `https://api.sandbox.midtrans.com/v2/${order.transactionId}/status`,
            {
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                    Authorization: `Basic U0ItTWlkLXNlcnZlci0xVWgwZjJSLUhPb3pLTlBnczMwcjRVUGs=`
                }
            }
        );

        // Gabungkan informasi order lokal dengan status dari Midtrans
        const updatedOrder = {
            ...order._doc,
            midtransStatus: midtransResponse.data
        };

        res.json(updatedOrder);
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
