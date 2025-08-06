const express = require('express');
const router = express.Router();
const Customer = require('../models/Customer');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

// Deposit money
router.post('/deposit/:id', async (req, res) => {
  try {
    const { amount, remarks } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Deposit amount must be positive' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.amount += amount;
    await customer.save();

    const transaction = new Transaction({
      customerId: customer._id,
      remarks: remarks || 'Deposit',
      creditAmount: amount,
      totalAmount: customer.amount
    });
    await transaction.save();

    res.json({ message: 'Deposit successful', balance: customer.amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Withdraw money
router.post('/withdraw/:id', async (req, res) => {
  try {
    const { amount, remarks } = req.body;
    if (amount <= 0) {
      return res.status(400).json({ message: 'Withdrawal amount must be positive' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    if (customer.amount < amount) {
      return res.status(400).json({ message: 'Insufficient balance' });
    }

    customer.amount -= amount;
    await customer.save();

    const transaction = new Transaction({
      customerId: customer._id,
      remarks: remarks || 'Withdrawal',
      debitAmount: amount,
      totalAmount: customer.amount
    });
    await transaction.save();

    res.json({ message: 'Withdrawal successful', balance: customer.amount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Transfer money from one customer to another
router.post('/transfer', async (req, res) => {
  try {
    const { fromCustomerId, toCustomerId, amount, remarks } = req.body;

    if (amount <= 0) {
      return res.status(400).json({ message: 'Transfer amount must be positive' });
    }

    if (fromCustomerId === toCustomerId) {
      return res.status(400).json({ message: 'Cannot transfer to the same account' });
    }

    const sender = await Customer.findById(fromCustomerId);
    const receiver = await Customer.findById(toCustomerId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: 'Sender or receiver not found' });
    }

    if (sender.amount < amount) {
      return res.status(400).json({ message: 'Insufficient balance in sender account' });
    }

    // Deduct from sender
    sender.amount -= amount;
    await sender.save();

    // Add to receiver
    receiver.amount += amount;
    await receiver.save();

    // Save transactions
    const senderTransaction = new Transaction({
      customerId: sender._id,
      remarks: remarks || `Transfer to ${receiver.name}`,
      debitAmount: amount,
      totalAmount: sender.amount
    });
    await senderTransaction.save();

    const receiverTransaction = new Transaction({
      customerId: receiver._id,
      remarks: remarks || `Transfer from ${sender.name}`,
      creditAmount: amount,
      totalAmount: receiver.amount
    });
    await receiverTransaction.save();

    res.json({ message: 'Transfer successful' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all transactions for a customer
router.get('/history/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    console.log("Incoming customerId:", customerId);

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      console.error("Invalid customerId:", customerId);
      return res.status(400).json({ message: 'Invalid customer id' });
    }

    const objectId = new mongoose.Types.ObjectId(customerId);
    const query = { customerId: objectId };
    console.log("MongoDB Query:", query);

    const total = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(total / 10);
    const transactions = await Transaction.find(query).sort({ transactionDate: -1 }).limit(10);

    res.json({ transactions, totalPages });
  } catch (err) {
    console.error("Server error:", err); // This is the error you must check!
    res.status(500).json({ error: err.message });
  }
});


// Get transaction by ID
router.get('/:id', async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ message: 'Transaction not found' });
    res.json(transaction);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get paginated transaction history with optional date filters
router.get('/history/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { startDate, endDate } = req.query;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer id' });
    }

    const query = { customerId: mongoose.Types.ObjectId(customerId) }; // <<-- convert to ObjectId!

    if (startDate || endDate) {
      query.transactionDate = {};
      if (startDate) query.transactionDate.$gte = new Date(startDate);
      if (endDate) query.transactionDate.$lte = new Date(endDate);
    }

    const total = await Transaction.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    const transactions = await Transaction.find(query)
      .sort({ transactionDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    res.json({ transactions, totalPages });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get account summary for customer (total credits, debits, current balance)
router.get('/summary/:customerId', async (req, res) => {
  try {
    const { customerId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(customerId)) {
      return res.status(400).json({ message: 'Invalid customer id' });
    }

    // Aggregate sums of credit and debit amounts
    const summary = await Transaction.aggregate([
      { $match: { customerId: mongoose.Types.ObjectId(customerId) } },
      {
        $group: {
          _id: null,
          totalCredit: { $sum: "$creditAmount" },
          totalDebit: { $sum: "$debitAmount" }
        }
      }
    ]);

    const accountSummary = summary[0] || { totalCredit: 0, totalDebit: 0 };

    // Optionally, fetch current balance from Customer collection
    const customer = await require('../models/Customer').findById(customerId).select('amount');

    res.json({
      totalCredit: accountSummary.totalCredit || 0,
      totalDebit: accountSummary.totalDebit || 0,
      currentBalance: customer ? customer.amount : 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;