const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Quote Submission Endpoint using Resend HTTP API
app.post('/api/quote', async (req, res) => {
  const { name, phone, from, to, size, date, notes } = req.body;

  if (!from || !to || !size) {
    return res.status(400).json({ success: false, message: 'Missing required fields' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Light Touch Removals <onboarding@resend.dev>',
        to: [process.env.EMAIL_USER],
        subject: `Light Touch Removals: New Quote from ${name || 'Customer'} (${from} to ${to})`,
        html: `
          <h2>New Quote Request - Light Touch Removals</h2>
          <p><strong>Name:</strong> ${name || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <p><strong>Move From:</strong> ${from}</p>
          <p><strong>Move To:</strong> ${to}</p>
          <p><strong>Property Size:</strong> ${size}</p>
          <p><strong>Moving Date:</strong> ${date || 'Flexible'}</p>
          <p><strong>Special Notes:</strong> ${notes || 'None'}</p>
        `,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to send email via Resend');
    }

    res.status(200).json({ success: true, message: 'Quote submitted successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ success: false, message: 'Failed to send email notification' });
  }
});

app.listen(PORT, () => {
  console.log(`Light Touch Removals backend running on port ${PORT}`);
});