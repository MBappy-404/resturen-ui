const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerUser', required: true },
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem', required: true },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, default: '' },
  comment: { type: String, default: '' },
  images: [String],
  isVerified: { type: Boolean, default: false },
  helpfulCount: { type: Number, default: 0 },
  response: { type: String, default: '' },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt: Date,
  isPublished: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);
