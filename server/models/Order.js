const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: { type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' },
  name: { type: String, required: true },
  image: { type: String, default: '' },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  variant: { type: String, default: '' },
  addons: [{ name: String, price: Number }],
  specialNote: { type: String, default: '' },
  subtotal: { type: Number, required: true }
}, { _id: true });

const timelineSchema = new mongoose.Schema({
  status: String,
  timestamp: { type: Date, default: Date.now },
  note: { type: String, default: '' },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNo: { type: String, unique: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  orderType: { type: String, enum: ['dine_in', 'takeaway', 'delivery', 'online'], default: 'dine_in' },
  orderSource: { type: String, enum: ['pos', 'website', 'phone'], default: 'pos' },
  table: { type: mongoose.Schema.Types.ObjectId, ref: 'Table' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerUser' },
  customerInfo: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
  },
  deliveryAddress: {
    fullAddress: { type: String, default: '' },
    area: { type: String, default: '' },
    city: { type: String, default: '' },
    zipCode: { type: String, default: '' },
    instructions: { type: String, default: '' }
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'served', 'delivered', 'completed', 'cancelled'],
    default: 'pending'
  },
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  serviceCharge: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  couponCode: { type: String, default: '' },
  total: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ['unpaid', 'partial', 'paid', 'refunded'], default: 'unpaid' },
  paymentMethod: { type: String, enum: ['cash', 'card', 'bkash', 'nagad', 'rocket', 'online', ''], default: '' },
  paidAmount: { type: Number, default: 0 },
  changeAmount: { type: Number, default: 0 },
  transactionId: { type: String, default: '' },
  servedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryPerson: { type: String, default: '' },
  deliveryPhone: { type: String, default: '' },
  kitchenNote: { type: String, default: '' },
  estimatedTime: { type: Number, default: 30 },
  completedAt: Date,
  deliveredAt: Date,
  cancelReason: { type: String, default: '' },
  timeline: [timelineSchema]
}, { timestamps: true });

orderSchema.pre('save', async function(next) {
  if (!this.orderNo) {
    const count = await mongoose.model('Order').countDocuments({ organization: this.organization });
    this.orderNo = `ORD-${String(count + 1).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
