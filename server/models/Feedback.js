const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerUser' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '' },
  category: { type: String, enum: ['food', 'service', 'ambiance', 'cleanliness', 'delivery', 'overall'], default: 'overall' },
  response: { type: String, default: '' },
  respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  respondedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
