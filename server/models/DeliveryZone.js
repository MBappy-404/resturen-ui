const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  name: { type: String, required: true },
  areas: [String],
  deliveryCharge: { type: Number, default: 60 },
  estimatedTime: { type: String, default: '30-45 min' },
  minOrderAmount: { type: Number, default: 100 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('DeliveryZone', deliveryZoneSchema);
