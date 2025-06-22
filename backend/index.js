import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './models/UserModel.js';

import userRoutes from './routes/UserRoute.js';
import productRoutes from './routes/ProductRoutes.js';
import categoryRoutes from './routes/CategoryRoutes.js';
import cartRoutes from './routes/CartRoutes.js';
import orderRoutes from './routes/OrderRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());

app.use(cors({
  origin: ['http://localhost:3000', 'https://travelsite-react-express-typl.vercel.app'], // bisa ditambahkan origin dari frontend production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));


// Test Build
app.get('/', (req, res) => {
  res.send("Welcome To MyApotik!");
})

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/category', categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);

const initializeAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin', role: 'Admin' });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping initialization.');
      return;
    }

    const adminPassword = '123';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
      phone: '123456789',
      address: 'Admin Address',
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
  } catch (err) {
    console.error('Error initializing admin user:', err.message);
  }
};

// Database Connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    initializeAdminUser(); // Initialize admin user after successful connection
  })
  .catch((err) => console.log(err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
