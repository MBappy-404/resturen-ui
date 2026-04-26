const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  nameBn: { type: String, default: '' },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  discountPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', required: true },
  branch: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
  image: { type: String, default: '' },
  images: [String],
  tags: [{ type: String, enum: ['bestseller', 'new', 'spicy', 'vegetarian', 'halal', 'chef_special', 'popular'] }],
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  preparationTime: { type: Number, default: 15 },
  ingredients: [String],
  allergens: [String],
  nutritionInfo: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    fat: { type: Number, default: 0 }
  },
  variants: [{
    name: { type: String },
    price: { type: Number }
  }],
  addons: [{
    name: { type: String },
    price: { type: Number }
  }],
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  orderCount: { type: Number, default: 0 }
}, { timestamps: true });

menuItemSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('MenuItem', menuItemSchema);
