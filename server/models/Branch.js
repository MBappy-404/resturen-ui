const mongoose = require('mongoose');

const branchSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },
  deliveryZones: [{
    area: String,
    charge: Number,
    estimatedTime: String
  }],
  isActive: { type: Boolean, default: true },
  openingTime: { type: String, default: '09:00' },
  closingTime: { type: String, default: '23:00' }
}, { timestamps: true });

module.exports = mongoose.model('Branch', branchSchema);
