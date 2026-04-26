const Organization = require('../models/Organization');
const Branch = require('../models/Branch');
const User = require('../models/User');

const getOrganization = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organization._id).populate('owner', 'name email');
    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrganization = async (req, res) => {
  try {
    const org = await Organization.findByIdAndUpdate(req.user.organization._id, req.body, { new: true });
    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateSettings = async (req, res) => {
  try {
    const org = await Organization.findById(req.user.organization._id);
    org.settings = { ...org.settings.toObject(), ...req.body };
    await org.save();
    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Branches
const getBranches = async (req, res) => {
  try {
    const branches = await Branch.find({ organization: req.user.organization._id }).populate('manager', 'name email');
    res.json({ success: true, data: branches });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createBranch = async (req, res) => {
  try {
    const branch = await Branch.create({ ...req.body, organization: req.user.organization._id });
    res.status(201).json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateBranch = async (req, res) => {
  try {
    const branch = await Branch.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, data: branch });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBranch = async (req, res) => {
  try {
    const branch = await Branch.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!branch) return res.status(404).json({ success: false, message: 'Branch not found' });
    res.json({ success: true, message: 'Branch deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Users
const getUsers = async (req, res) => {
  try {
    const users = await User.find({ organization: req.user.organization._id }).select('-password');
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const inviteUser = async (req, res) => {
  try {
    const { name, email, password, role, branch } = req.body;
    const user = await User.create({
      name, email, password: password || 'password123', role: role || 'staff',
      organization: req.user.organization._id, branch
    });
    res.status(201).json({ success: true, data: { _id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { role }, { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrganization, updateOrganization, updateSettings,
  getBranches, createBranch, updateBranch, deleteBranch,
  getUsers, inviteUser, updateUserRole
};
