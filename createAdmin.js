const mongoose = require('mongoose');
const Admin = require('./models/Admin'); // Adjust path if needed

// Use your actual MongoDB Atlas connection string here. Make sure it starts with 'mongodb+srv://'
// Replace <username>, <password>, <cluster-address>, and <database-name> accordingly.
const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(async () => {
    console.log('MongoDB connected');

    const admin = new Admin({
      username: 'admin',
      password: 'admin123'  // Password will be hashed automatically by mongoose middleware
    });

    await admin.save();
    console.log('Admin user created');

    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error:', err);
    mongoose.disconnect();
  });
