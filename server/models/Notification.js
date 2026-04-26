const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, required: true },
  recipientType: { type: String, enum: ['admin', 'customer'], required: true },
  type: { type: String, enum: ['order_placed', 'order_confirmed', 'order_ready', 'order_delivered', 'low_stock', 'new_reservation', 'review_posted', 'payment_received'], required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed },
  isRead: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
