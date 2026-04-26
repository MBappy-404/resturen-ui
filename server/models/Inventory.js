const mongoose = require('mongoose');

const stockHistorySchema = new mongoose.Schema({
  type: { type: String, enum: ['added', 'used', 'wasted', 'returned', 'adjusted'], required: true },
  quantity: { type: Number, required: true },
  previousStock: { type: Number },
  newStock: { type: Number },
  note: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  doneBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { _id: true });

const inventorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  sku: { type: String, default: '' },
  category: { type: String, enum: ['raw_materials', 'beverages', 'packaging', 'cleaning', 'equipment', 'spices', 'dairy', 'meat', 'vegetables'], default: 'raw_materials' },
  unit: { type: String, enum: ['kg', 'g', 'l', 'ml', 'piece', 'box', 'packet', 'dozen', 'bag'], default: 'kg' },
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 10 },
  maximumStock: { type: Number, default: 1000 },
  costPerUnit: { type: Number, default: 0 },
  supplier: {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    company: { type: String, default: '' },
    address: { type: String, default: '' }
  },
  history: [stockHistorySchema],
  expiryDate: Date,
  lastRestocked: Date,
  reorderLevel: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

inventorySchema.virtual('totalValue').get(function() {
  return this.currentStock * this.costPerUnit;
});

inventorySchema.virtual('isLowStock').get(function() {
  return this.currentStock <= this.minimumStock;
});

inventorySchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Inventory', inventorySchema);
