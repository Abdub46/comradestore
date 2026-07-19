const User = require('../models/User');
const generateToken = require('../utils/generateToken');
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

module.exports = { registerUser, loginUser, getProfile, updateProfile };
