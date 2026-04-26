const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
  tableNo: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  capacity: { type: Number, required: true, min: 1 },
  status: { type: String, enum: ['available', 'occupied', 'reserved', 'cleaning', 'out_of_service'], default: 'available' },
  floor: { type: String, default: 'Ground Floor' },
  section: { type: String, default: 'Indoor' },
  position: {
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 }
  },
  qrCode: { type: String, default: '' },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Table', tableSchema);
