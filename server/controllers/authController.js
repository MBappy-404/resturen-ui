const User = require('../models/User');
const Organization = require('../models/Organization');
const generateToken = require('../utils/generateToken');

// @desc    Register new organization + admin
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, phone, restaurantName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password, phone, role: 'admin' });

    const organization = await Organization.create({
      name: restaurantName || `${name}'s Restaurant`,
      owner: user._id,
      openingHours: [
        { day: 'Saturday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'Sunday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'Monday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'Tuesday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'Wednesday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'Thursday', open: '09:00', close: '23:00', isClosed: false },
        { day: 'Friday', open: '09:00', close: '23:00', isClosed: true }
      ]
    });

    user.organization = organization._id;
    await user.save();

    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role, organization: organization._id }, organization, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password').populate('organization');
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated' });
    }
    user.lastLogin = new Date();
    await user.save();
    const token = generateToken(user._id);
    res.json({
      success: true,
      data: { user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone, avatar: user.avatar, organization: user.organization }, token }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organization').populate('branch');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/profile
const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, { name, phone, avatar }, { new: true }).populate('organization');
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.matchPassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect' });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, updateProfile, changePassword };
