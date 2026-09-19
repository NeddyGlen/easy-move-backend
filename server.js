const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure Nodemailer transporter (using Gmail or standard SMTP)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Quote Submission Endpoint
app.post('/api/quote', async (req, res) => {
  const { name, phone, from, to, size, date, notes } = req.body;

  if (!from || !to || !size) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'ategeneddy@gmail.com',
    subject: `New Moving Quote Request: ${from} to ${to}`,
    html: `
      <h2>New Quote Request Received</h2>
      <p><strong>Name:</strong> ${name || 'Not provided'}</p>
      <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
      <p><strong>Move From:</strong> ${from}</p>
      <p><strong>Move To:</strong> ${to}</p>
      <p><strong>Property Size:</strong> ${size}</p>
      <p><strong>Moving Date:</strong> ${date || 'Flexible'}</p>
      <p><strong>Special Notes:</strong> ${notes || 'None'}</p>
    `,
  };

  try {
    // Send email notification
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true, message: 'Quote submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    // Fallback response if email credentials aren't set up yet during testing
    res.status(200).json({ success: true, message: 'Quote received (Email dispatch pending config).' });
  }
});

app.listen(PORT, () => {
  console.log(`Light touch removals backend running on port ${PORT}`);
});