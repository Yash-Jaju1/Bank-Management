const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Customer = require('../models/Customer');
const bcrypt = require('bcrypt');

const JWT_SECRET = 'your_jwt_secret_here'; // Change to secure value in production

// Admin login route
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });
    if (!admin) return res.status(404).json({ message: 'Admin not found' });

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: admin._id }, JWT_SECRET, { expiresIn: '1d' });
    return res.json({ token, adminId: admin._id, username: admin.username });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// JWT verification middleware
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.adminId = decoded.id;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// Protect routes below
router.use(verifyToken);

// Get all customers (exclude mpin and security question)
router.get('/customers', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const total = await Customer.countDocuments(query);
    const totalPages = Math.ceil(total / limit);
    const customers = await Customer.find(query)
      .select('-mpin -securityQuestion')
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ customers, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get one customer by ID
router.get('/customers/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id).select('-mpin -securityQuestion');
    if (!customer) return res.status(404).json({ message: 'Customer not found' });
    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new customer
router.post('/customers', async (req, res) => {
  try {
    const { name, email, mobileNo, accountType, amount, mpin, address, dob, securityQuestion } = req.body;
    if (!name || !email || !mpin || !address || !dob || !securityQuestion) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) return res.status(409).json({ message: 'Email already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedMpin = await bcrypt.hash(mpin, salt);

    const newCustomer = new Customer({
      name,
      email,
      mobileNo,
      accountType,
      amount,
      mpin: hashedMpin,
      address,
      dob,
      securityQuestion
    });

    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update existing customer
router.put('/customers/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.mpin) {
      const salt = await bcrypt.genSalt(10);
      updates.mpin = await bcrypt.hash(updates.mpin, salt);
    }
    const updatedCustomer = await Customer.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    });
    if (!updatedCustomer) return res.status(404).json({ message: 'Customer not found' });
    res.json(updatedCustomer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete a customer
router.delete('/customers/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) return res.status(404).json({ message: 'Customer not found' });
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update MPIN endpoint
router.post('/update-mpin', async (req, res) => {
  const { email, newMpin } = req.body;

  if (!newMpin || !/^\d{6}$/.test(newMpin)) {
    return res.status(400).json({ message: 'MPIN must be 6 digits' });
  }

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Hash the MPIN
    const hashedMpin = await bcrypt.hash(newMpin, 10);
    customer.mpin = hashedMpin;

    await customer.save();

    res.json({ message: 'MPIN updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating MPIN' });
  }
});

// Update Security Question endpoint
router.post('/update-security-question', async (req, res) => {
  const { email, question, answer } = req.body;

  if (!question || !answer) {
    return res.status(400).json({ message: 'Question and answer are required' });
  }

  try {
    const customer = await Customer.findOne({ email });
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    customer.securityQuestion = question;
    customer.securityAnswer = answer;
    await customer.save();

    res.json({ message: 'Security question updated successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error updating security question' });
  }
});

module.exports = router;