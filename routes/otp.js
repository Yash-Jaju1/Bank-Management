const express = require('express');
const router = express.Router();
const OtpCode = require('../models/OtpCode');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});


// Request OTP (send to email)
router.post('/request-otp', async (req, res) => {
  const { email, reason } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString();

  await OtpCode.create({ email, code, reason });

  await transporter.sendMail({
    from: `Bank Management <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP for ${reason}: ${code}\nThis OTP expires in 5 minutes.`
  });

  res.json({ message: 'OTP sent to email.' });
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  const found = await OtpCode.findOne({ email, code: otp });
  if (found) {
    await found.deleteOne(); // Remove OTP after use
    res.json({ valid: true });
  } else {
    res.status(400).json({ valid: false, message: 'Invalid or expired OTP.' });
  }
});

module.exports = router;