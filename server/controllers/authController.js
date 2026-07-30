const crypto = require('crypto');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const verifyGoogleToken = require('../utils/verifyGoogleToken');
const transporter = require('../config/mailer');
const { formatPhoneNumber, isValidKenyanPhone } = require('../utils/phoneFormatter');

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res, next) => {
  try {
    const { firstName, lastName, email, password, confirmPassword, phone, residence } = req.body;

    if (!firstName || !lastName || !email || !password || !phone || !residence) {
      return res.status(400).json({ message: 'Please fill in all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    if (!isValidKenyanPhone(phone)) {
      return res.status(400).json({ message: 'Please enter a valid WhatsApp phone number' });
    }

    if (!['Sokomoko', 'KU', 'Annex'].includes(residence)) {
      return res.status(400).json({ message: 'Please select a valid residence' });
    }

    const normalizedPhone = formatPhoneNumber(phone);

    const emailExists = await User.findOne({ email: email.toLowerCase() });
    if (emailExists) {
      return res.status(400).json({ message: 'An account with that email already exists' });
    }

    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({ message: 'An account with that phone number already exists' });
    }

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phone: normalizedPhone,
      residence,
    });

    res.status(201).json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.json({
      user,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in user's profile
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res, next) => {
  try {
    res.json(req.user);
  } catch (error) {
    next(error);
  }
};

// @desc    Update logged-in user's profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { firstName, lastName, residence, phone, avatar } = req.body;

    if (phone && phone !== user.phone) {
      if (!isValidKenyanPhone(phone)) {
        return res.status(400).json({ message: 'Please enter a valid WhatsApp phone number' });
      }
      user.phone = formatPhoneNumber(phone);
    }

    if (residence && !['Sokomoko', 'KU', 'Annex'].includes(residence)) {
      return res.status(400).json({ message: 'Please select a valid residence' });
    }

    user.firstName = firstName || user.firstName;
    user.lastName = lastName || user.lastName;
    user.residence = residence || user.residence;
    user.avatar = avatar || user.avatar;

    const updated = await user.save();
    res.json(updated);
  } catch (error) {
    next(error);
  }
};

// @desc    Log in or sign up with Google
// @route   POST /api/auth/google
// @access  Public
const googleAuth = async (req, res, next) => {
  try {
    const { credential, phone, residence } = req.body;

    if (!credential) {
      return res.status(400).json({ message: 'Missing Google credential' });
    }

    const googleProfile = await verifyGoogleToken(credential);

    let user = await User.findOne({
      $or: [{ googleId: googleProfile.googleId }, { email: googleProfile.email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = googleProfile.googleId;
        await user.save();
      }
      return res.json({ user, token: generateToken(user._id) });
    }

    if (!phone || !residence) {
      return res.json({
        needsProfile: true,
        profile: {
          email: googleProfile.email,
          firstName: googleProfile.firstName,
          lastName: googleProfile.lastName,
          avatar: googleProfile.avatar,
        },
      });
    }

    if (!isValidKenyanPhone(phone)) {
      return res.status(400).json({ message: 'Please enter a valid WhatsApp phone number' });
    }

    if (!['Sokomoko', 'KU', 'Annex'].includes(residence)) {
      return res.status(400).json({ message: 'Please select a valid residence' });
    }

    const normalizedPhone = formatPhoneNumber(phone);
    const phoneExists = await User.findOne({ phone: normalizedPhone });
    if (phoneExists) {
      return res.status(400).json({ message: 'An account with that phone number already exists' });
    }

    user = await User.create({
      firstName: googleProfile.firstName,
      lastName: googleProfile.lastName,
      email: googleProfile.email,
      googleId: googleProfile.googleId,
      phone: normalizedPhone,
      residence,
      avatar: googleProfile.avatar,
    });

    res.status(201).json({ user, token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Please provide your email address' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const genericResponse = {
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
    };

    if (!user) return res.json(genericResponse);

    const rawToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const siteUrl = (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
    const resetUrl = `${siteUrl}/reset-password/${rawToken}`;

    try {
      await transporter.sendMail({
        from: `"ComradeMarket" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Reset your ComradeMarket password',
        text: `We received a request to reset your password. Click this link to choose a new one (expires in 1 hour): ${resetUrl}\n\nIf you didn't request this, you can safely ignore this email.`,
        html: `
          <h3>Reset your password</h3>
          <p>We received a request to reset your ComradeMarket password.</p>
          <p><a href="${resetUrl}">Click here to choose a new password</a> (this link expires in 1 hour).</p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      console.error('Password reset email error:', emailError.message);
      return res.status(500).json({ message: 'Could not send reset email. Please try again later.' });
    }

    res.json(genericResponse);
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ message: 'Please fill in both password fields' });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    }).select('+resetPasswordToken +resetPasswordExpires');

    if (!user) {
      return res.status(400).json({ message: 'This reset link is invalid or has expired' });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ user, token: generateToken(user._id) });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  googleAuth,
  forgotPassword,
  resetPassword,
};
