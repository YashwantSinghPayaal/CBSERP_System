const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const resultRoutes = require('./routes/resultRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Uploaded PDFs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'CBSERP School ERP Server is running smoothly' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/results', resultRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('API Error:', err.stack || err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cbserp_db';

// Ensure MongoDB connection in Serverless environment
let isConnected = false;
const connectDB = async () => {
  if (isConnected && mongoose.connection.readyState === 1) return;
  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB database successfully.');
  } catch (err) {
    console.error('❌ Database Connection Error:', err.message);
  }
};

// Middleware to check DB connection for each request
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

if (require.main === module) {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 CBSERP Backend Server running on port ${PORT}`);
    });
  });
}

module.exports = app;
