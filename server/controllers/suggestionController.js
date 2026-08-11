const transporter = require('../config/mailer');
const Settings = require('../models/Settings');
const { stripHtml } = require('../utils/sanitize');

// @desc    Send an app-improvement suggestion by email
// @route   POST /api/suggestions
// @access  Private (email is pulled from the logged-in user's account,
//          never entered by hand)
const sendSuggestion = async (req, res, next) => {
  try {
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: 'Please write a message before sending' });
    }

    const name = `${req.user.firstName} ${req.user.lastName}`.trim();
    const email = req.user.email;

    // Strip any HTML/scripts before any of this text gets embedded into the email
    const safeName = stripHtml(name);
    const safeEmail = stripHtml(email);
    const safeMessage = stripHtml(message);

    const settings = await Settings.getSingleton();

    await transporter.sendMail({
      from: `"HomeMarket Suggestions" <${process.env.EMAIL_USER}>`,
      to: settings.contactEmail,
      replyTo: safeEmail,
      subject: `New Improvement Suggestion from ${safeName}`,
      text: `Name: ${safeName}\nEmail: ${safeEmail}\n\nSuggestion:\n${safeMessage}`,
      html: `
        <h3>New Improvement Suggestion</h3>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Suggestion:</strong></p>
        <p>${safeMessage.replace(/\n/g, '<br>')}</p>
      `,
    });

    res.json({ message: 'Your suggestion has been sent successfully.' });
  } catch (error) {
    console.error('Suggestion email error:', error.message);
    res.status(500).json({ message: 'Failed to send suggestion. Please try again later.' });
  }
};

module.exports = { sendSuggestion };