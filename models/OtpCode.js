// models/OtpCode.js
const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
  email: { type: String, required: true },
  code: { type: String, required: true },
  reason: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: 300 } // auto-expires after 5min
});

module.exports = mongoose.model('OtpCode', otpSchema);