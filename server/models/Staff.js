const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  status: { type: String, enum: ['present', 'absent', 'late', 'leave', 'half_day'], default: 'present' },
  checkIn: Date,
  checkOut: Date,
  workHours: { type: Number, default: 0 },
  overtime: { type: Number, default: 0 },
  note: { type: String, default: '' }
}, { _id: true });

const leaveSchema = new mongoose.Schema({
  type: { type: String, enum: ['casual', 'sick', 'annual', 'unpaid'], default: 'casual' },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const staffSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  employeeId: { type: String },
  position: { type: String, enum: ['manager', 'chef', 'head_chef', 'sous_chef', 'waiter', 'cashier', 'cleaner', 'delivery_boy', 'host'], default: 'waiter' },
  department: { type: String, enum: ['kitchen', 'service', 'management', 'delivery', 'maintenance'], default: 'service' },
  salary: { type: Number, default: 0 },
  salaryType: { type: String, enum: ['monthly', 'daily', 'hourly'], default: 'monthly' },
  joiningDate: { type: Date, default: Date.now },
  shift: { type: String, enum: ['morning', 'evening', 'night', 'full_day', 'rotational'], default: 'full_day' },
  shiftStart: { type: String, default: '09:00' },
  shiftEnd: { type: String, default: '17:00' },
  emergencyContact: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relation: { type: String, default: '' }
  },
  documents: [{ type: { type: String }, url: String, name: String }],
  bankInfo: {
    bankName: { type: String, default: '' },
    accountNo: { type: String, default: '' },
    mobileBanking: { type: String, default: '' }
  },
  performance: {
    totalOrders: { type: Number, default: 0 },
    avgRating: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },
    complaints: { type: Number, default: 0 }
  },
  attendance: [attendanceSchema],
  leaves: [leaveSchema],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

staffSchema.pre('save', async function(next) {
  if (!this.employeeId) {
    const count = await mongoose.model('Staff').countDocuments({ organization: this.organization });
    this.employeeId = `EMP-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Staff', staffSchema);
