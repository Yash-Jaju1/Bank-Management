const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const bcrypt = require('bcrypt');

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

// Route to create a new customer
router.post('/', async (req, res) => {
  try {
    console.log('Request body:', req.body);   // Log incoming data
    // Hash mpin before saving
    if (req.body.mpin) {
      const salt = await bcrypt.genSalt(10);
      req.body.mpin = await bcrypt.hash(req.body.mpin, salt);
    }
    const newCustomer = new Customer(req.body);
    const savedCustomer = await newCustomer.save();
    res.status(201).json(savedCustomer);
  } catch (err) {
    console.error('Error:', err);   // Log full error stack
    res.status(400).json({ error: err.message });
  }
});

// Get customer details by ID
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update customer profile (name, email, mobileNo)
router.put('/profile/:id', async (req, res) => {
  try {
    const updates = {};
    if (req.body.name) updates.name = req.body.name;
    if (req.body.email) updates.email = req.body.email;
    if (req.body.mobileNo) updates.mobileNo = req.body.mobileNo;

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );
    if (!updatedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json(updatedCustomer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Change customer mpin (password)
router.put('/change-password/:id', async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    // Verify old mpin
    const match = await bcrypt.compare(oldPassword, customer.mpin);
    if (!match) return res.status(401).json({ message: 'Invalid current MPIN' });

    // Hash new mpin & save
    const salt = await bcrypt.genSalt(10);
    customer.mpin = await bcrypt.hash(newPassword, salt);
    await customer.save();

    res.json({ message: 'MPIN changed successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete customer by ID
router.delete('/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    res.json({ message: 'Customer deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login route (verify email and hashed mpin)
router.post('/login', async (req, res) => {
  try {
    const { email, mpin } = req.body;
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    const isMatch = await bcrypt.compare(mpin, customer.mpin);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid MPIN' });
    }

    // You can later add JWT token here
    res.json({ message: 'Login successful', customerId: customer._id, name: customer.name });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const crypto = require('crypto');
// At the top, add: const bcrypt = require('bcrypt'); (if not already imported)
const resetTokens = new Map(); // In-memory token store for demo -- use DB or Redis for production

// Request password reset: generates and returns token for given email
router.post('/password-reset/request', async (req, res) => {
  const { email } = req.body;
  try {
    const customer = await Customer.findOne({ email });
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }
    const token = crypto.randomBytes(20).toString('hex');
    resetTokens.set(token, { customerId: customer._id, expires: Date.now() + 3600000 }); // 1 hour
    // In production: send this token via email in a reset link!
    res.json({ message: 'Password reset token generated', token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reset password using token
router.post('/password-reset/reset', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!resetTokens.has(token)) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }
    const { customerId, expires } = resetTokens.get(token);
    if (Date.now() > expires) {
      resetTokens.delete(token);
      return res.status(400).json({ message: 'Token expired' });
    }
    const customer = await Customer.findById(customerId);
    if (!customer) return res.status(404).json({ message: 'Customer not found' });

    const salt = await bcrypt.genSalt(10);
    customer.mpin = await bcrypt.hash(newPassword, salt);
    await customer.save();
    resetTokens.delete(token);

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// customer.js (add this route)
router.get('/by-account/:accountNumber', async (req, res) => {
  try {
    const accountNumber = req.params.accountNumber;

    // Adjust the field if your schema uses different unique field
    const customer = await Customer.findOne({ accountNumber: accountNumber });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json(customer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;