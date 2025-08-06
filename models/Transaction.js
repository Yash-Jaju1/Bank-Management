const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
  transactionDate: { type: Date, default: Date.now },
  remarks: { type: String },
  creditAmount: { type: Number, default: 0 },
  debitAmount: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', TransactionSchema);