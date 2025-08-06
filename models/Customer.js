const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  dob: { type: Date, required: true },
  address: { type: String, required: true },
  mobileNo: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  accountType: { type: String, required: true },
  amount: { type: Number, required: true, min: 2000 },
  mpin: { type: String, required: true },
  securityQuestion: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);