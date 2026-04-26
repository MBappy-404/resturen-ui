const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  logo: { type: String, default: '' },
  coverImage: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  email: { type: String, default: '' },
  website: { type: String, default: '' },
  socialMedia: {
    facebook: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' }
  },
  taxRate: { type: Number, default: 0 },
  currency: { type: String, default: 'BDT' },
  currencySymbol: { type: String, default: '৳' },
  settings: {
    serviceCharge: { type: Number, default: 0 },
    vatRate: { type: Number, default: 0 },
    invoicePrefix: { type: String, default: 'INV' },
    orderPrefix: { type: String, default: 'ORD' },
    deliveryCharge: { type: Number, default: 60 },
    freeDeliveryMinOrder: { type: Number, default: 500 },
    minOrderAmount: { type: Number, default: 100 },
    estimatedDeliveryTime: { type: String, default: '30-45 min' },
    acceptOnlineOrders: { type: Boolean, default: true },
    acceptReservations: { type: Boolean, default: true }
  },
  openingHours: [{
    day: String,
    open: String,
    close: String,
    isClosed: { type: Boolean, default: false }
  }],
  features: [String],
  subscription: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' }
}, { timestamps: true });

module.exports = mongoose.model('Organization', organizationSchema);
