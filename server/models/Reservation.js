const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  reservationNo: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerUser' },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  customerEmail: { type: String, default: '' },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  date: { type: Date, required: true },
  timeSlot: { type: String, required: true },
  guestCount: { type: Number, required: true, min: 1 },
  occasion: { type: String, default: '' },
  status: { type: String, enum: ['pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show'], default: 'pending' },
  specialRequest: { type: String, default: '' },
  reminderSent: { type: Boolean, default: false },
  source: { type: String, enum: ['admin', 'website', 'phone'], default: 'admin' }
}, { timestamps: true });

reservationSchema.pre('save', async function(next) {
  if (!this.reservationNo) {
    const count = await mongoose.model('Reservation').countDocuments({ organization: this.organization });
    this.reservationNo = `RES-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Reservation', reservationSchema);
