const Staff = require('../models/Staff');
const User = require('../models/User');

const getStaff = async (req, res) => {
  try {
    const { position, department, shift } = req.query;
    const query = { organization: req.user.organization._id };
    if (position) query.position = position;
    if (department) query.department = department;
    if (shift) query.shift = shift;
    const staff = await Staff.find(query).populate('user', 'name email phone avatar role isActive').sort('-createdAt');
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStaffMember = async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization: req.user.organization._id })
      .populate('user', 'name email phone avatar role isActive');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, role, ...staffData } = req.body;
    const user = await User.create({
      name, email, password: password || 'password123', phone,
      role: role || 'staff', organization: req.user.organization._id
    });
    const staff = await Staff.create({
      ...staffData, user: user._id, organization: req.user.organization._id
    });
    const populated = await staff.populate('user', 'name email phone avatar role');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStaff = async (req, res) => {
  try {
    const { name, email, phone, ...staffData } = req.body;
    const staff = await Staff.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      staffData, { new: true }
    ).populate('user', 'name email phone avatar role');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    if (name || email || phone) {
      await User.findByIdAndUpdate(staff.user._id, { name, email, phone });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    await User.findByIdAndUpdate(staff.user, { isActive: false });
    res.json({ success: true, message: 'Staff removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const markAttendance = async (req, res) => {
  try {
    const { status, checkIn, checkOut, note } = req.body;
    const staff = await Staff.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });

    const today = new Date(); today.setHours(0, 0, 0, 0);
    const existingIndex = staff.attendance.findIndex(a => {
      const d = new Date(a.date); d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });

    const record = { date: today, status: status || 'present', checkIn, checkOut, note };
    if (checkIn && checkOut) {
      record.workHours = (new Date(checkOut) - new Date(checkIn)) / (1000 * 60 * 60);
    }

    if (existingIndex >= 0) {
      staff.attendance[existingIndex] = { ...staff.attendance[existingIndex].toObject(), ...record };
    } else {
      staff.attendance.push(record);
    }
    await staff.save();
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAttendance = async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff.attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPerformance = async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization: req.user.organization._id })
      .populate('user', 'name');
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    res.json({ success: true, data: staff.performance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const manageLeave = async (req, res) => {
  try {
    const staff = await Staff.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    staff.leaves.push(req.body);
    await staff.save();
    res.json({ success: true, data: staff.leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateLeave = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await Staff.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!staff) return res.status(404).json({ success: false, message: 'Staff not found' });
    const leave = staff.leaves.id(req.params.leaveId);
    if (!leave) return res.status(404).json({ success: false, message: 'Leave not found' });
    leave.status = status;
    leave.approvedBy = req.user._id;
    await staff.save();
    res.json({ success: true, data: staff.leaves });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getStaff, getStaffMember, createStaff, updateStaff, deleteStaff,
  markAttendance, getAttendance, getPerformance, manageLeave, updateLeave
};
