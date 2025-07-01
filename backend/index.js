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

// CORS Configuration - PERBAIKAN UTAMA
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost',
    'http://127.0.0.1',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'https://travelsite-react-express-typl.vercel.app', 
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'Pragma'
  ],
  optionsSuccessStatus: 200 // untuk legacy browser support
};

// Middleware
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: '10mb' })); // Menambah limit untuk upload file
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Security headers
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  next();
});

// Logging middleware untuk debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  console.log('Origin:', req.headers.origin);
  next();
});

// Test Build
app.get('/', (req, res) => {
  res.json({ 
    message: "Welcome To MataElang!", 
    status: "Server is running",
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Routes
app.use('/uploads', express.static('uploads'));
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/category', categoryRoutes);
app.use('/cart', cartRoutes);
app.use('/order', orderRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    message: 'Something went wrong!', 
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    message: 'Route not found',
    path: req.originalUrl
  });
});

const initializeAdminUser = async () => {
  try {
    const existingAdmin = await User.findOne({ username: 'admin', role: 'Admin' });

    if (existingAdmin) {
      console.log('Admin user already exists. Skipping initialization.');
      return;
    }

    const adminPassword = process.env.ADMIN_PASSWORD || '123'; // Gunakan environment variable
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    const adminUser = new User({
      username: 'admin',
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: hashedPassword,
      role: 'Admin',
      phone: '123456789',
      address: 'Admin Address',
    });

    await adminUser.save();
    console.log('Admin user created successfully.');
    console.log('Admin credentials:');
    console.log('Username: admin');
    console.log('Password:', adminPassword);
  } catch (err) {
    console.error('Error initializing admin user:', err.message);
  }
};

// Database Connection
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
    
    // Initialize admin user after successful connection
    await initializeAdminUser();
    
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Connect to database
connectDB();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received. Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Server URL: http://localhost:${PORT}`);
});