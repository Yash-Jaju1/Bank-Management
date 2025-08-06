const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Customer = require('../models/Customer');

// Total customers
router.get('/total-customers', async (req, res) => {
  try {
    const count = await Customer.countDocuments();
    res.json({ totalCustomers: count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Total deposits and withdrawals (optionally filter by dates)
router.get('/total-transactions', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const match = {};
    if (startDate || endDate) {
      match.transactionDate = {};
      if (startDate) match.transactionDate.$gte = new Date(startDate);
      if (endDate)   match.transactionDate.$lte = new Date(endDate);
    }
    const result = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalCredit: { $sum: "$creditAmount" },
          totalDebit:  { $sum: "$debitAmount" }
        }
      }
    ]);
    res.json({
      totalCredit: result[0]?.totalCredit || 0,
      totalDebit: result[0]?.totalDebit || 0
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Customer growth by day for last X days (default 30)
router.get('/customer-growth', async (req, res) => {
  try {
    const days = parseInt(req.query.days) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const result = await Customer.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;