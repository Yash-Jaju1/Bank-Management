require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // <-- added this
const app = express();




// Enable CORS for all origins (including your React frontend)
app.use(cors());

// Middleware to parse JSON
app.use(express.json());

// MongoDB connection string (placeholder)
const mongoURI = 'mongodb+srv://yjaju16:jaadu@bank-management.klwb5o4.mongodb.net/test?retryWrites=true&w=majority&appName=Bank-Management';

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

const customerRoutes = require('./routes/customer');
app.use('/api/customers', customerRoutes);

const transactionRoutes = require('./routes/transaction');
app.use('/api/transactions', transactionRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

const adminAnalyticsRoutes = require('./routes/adminAnalytics');
app.use('/api/admin/analytics', adminAnalyticsRoutes);

const otpRoutes = require('./routes/otp');
app.use('/api/otp', otpRoutes);

// Simple route
app.get('/', (req, res) => {
  res.send('Welcome to Bank Management Backend!');
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
