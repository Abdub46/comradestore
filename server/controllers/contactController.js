const transporter = require('../config/mailer');
const { stripHtml } = require('../utils/sanitize');
const { isValidEmailFormat } = require('../utils/validators');

const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    if (!isValidEmailFormat(email)) {
      return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    const safeName = stripHtml(name);
    const safeEmail = stripHtml(email);
    const safePhone = stripHtml(phone);
    const safeMessage = stripHtml(message);

    await transporter.sendMail({
      from: `"HomeMarket Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'infohorizoncentre@gmail.com',
      replyTo: safeEmail,
      subject: `New Contact Form Message from ${safeName}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\nPhone: ${safePhone}\n\nMessage:\n${safeMessage}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Contact form email error:', error.message);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};

module.exports = { sendContactMessage };