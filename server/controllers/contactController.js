const transporter = require('../config/mailer');

// @desc    Send a contact form submission by email
// @route   POST /api/contact
// @access  Public
const sendContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, message } = req.body;

    if (!name || !email || !phone || !message) {
      return res.status(400).json({ message: 'Please fill in all fields' });
    }

    await transporter.sendMail({
      from: `"HomeMarket Contact Form" <${process.env.EMAIL_USER}>`,
      to: 'infohorizoncentre@gmail.com',
      replyTo: email,
      subject: `New Contact Form Message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nMessage:\n${message}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({ message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('Contact form email error:', error.message);
    res.status(500).json({ message: 'Failed to send message. Please try again later.' });
  }
};

module.exports = { sendContactMessage };