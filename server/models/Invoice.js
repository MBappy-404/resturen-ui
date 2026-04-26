const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNo: { type: String },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomerUser' },
  customerInfo: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    variant: { type: String, default: '' },
    addons: [{ name: String, price: Number }],
    subtotal: { type: Number, required: true }
  }],
  subtotal: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  taxBreakdown: {
    vat: { type: Number, default: 0 },
    serviceTax: { type: Number, default: 0 }
  },
  serviceCharge: { type: Number, default: 0 },
  deliveryCharge: { type: Number, default: 0 },
  discount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['flat', 'percentage', ''], default: '' },
  couponCode: { type: String, default: '' },
  total: { type: Number, default: 0 },
  roundOff: { type: Number, default: 0 },
  grandTotal: { type: Number, default: 0 },
  paymentMethod: { type: String, default: '' },
  paymentDetails: {
    paidAmount: { type: Number, default: 0 },
    changeAmount: { type: Number, default: 0 },
    transactionId: { type: String, default: '' },
    splitPayments: [{ method: String, amount: Number }]
  },
  note: { type: String, default: '' },
  terms: { type: String, default: '' },
  generatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPrinted: { type: Boolean, default: false },
  printCount: { type: Number, default: 0 },
  printedAt: Date,
  emailSent: { type: Boolean, default: false },
  emailSentAt: Date,
  status: { type: String, enum: ['draft', 'final', 'void'], default: 'final' }
}, { timestamps: true });

// Compound index for uniqueness per organization
invoiceSchema.index({ organization: 1, invoiceNo: 1 }, { unique: true });

invoiceSchema.pre('save', async function(next) {
  if (!this.invoiceNo) {
    const year = new Date().getFullYear();
    const lastInvoice = await mongoose.model('Invoice')
      .findOne({ organization: this.organization })
      .sort({ invoiceNo: -1 });

    let nextNumber = 1;
    if (lastInvoice && lastInvoice.invoiceNo) {
      const parts = lastInvoice.invoiceNo.split('-');
      const lastNumber = parseInt(parts[parts.length - 1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    // Get organization prefix if possible
    let prefix = 'INV';
    try {
      const org = await mongoose.model('Organization').findById(this.organization);
      if (org && org.settings && org.settings.invoicePrefix) {
        prefix = org.settings.invoicePrefix;
      }
    } catch (err) {
      // Fallback to INV
    }

    this.invoiceNo = `${prefix}-${year}-${String(nextNumber).padStart(5, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Invoice', invoiceSchema);
