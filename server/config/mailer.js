const nodemailer = require('nodemailer');

// Sends email through Gmail's SMTP server using your Gmail address + an
// App Password (NOT your normal Gmail password - see .env.example for
// instructions on generating one).
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

module.exports = transporter;