const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');

// ===== CATEGORIES =====

const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ organization: req.user.organization._id }).sort('sortOrder');
    res.json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const category = await Category.create({ ...req.body, organization: req.user.organization._id });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const reorderCategories = async (req, res) => {
  try {
    const { categories } = req.body;
    const updates = categories.map((id, index) => Category.findByIdAndUpdate(id, { sortOrder: index }));
    await Promise.all(updates);
    res.json({ success: true, message: 'Categories reordered' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===== MENU ITEMS =====

const getMenuItems = async (req, res) => {
  try {
    const { category, search, available, featured, page = 1, limit = 50 } = req.query;
    const query = { organization: req.user.organization._id };
    if (category) query.category = category;
    if (available !== undefined) query.isAvailable = available === 'true';
    if (featured !== undefined) query.isFeatured = featured === 'true';
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];

    const total = await MenuItem.countDocuments(query);
    const items = await MenuItem.find(query)
      .populate('category', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ success: true, data: items, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, organization: req.user.organization._id }).populate('category');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.create({ ...req.body, organization: req.user.organization._id });
    const populated = await item.populate('category', 'name');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    ).populate('category', 'name');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleAvailability = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isAvailable = !item.isAvailable;
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const toggleFeatured = async (req, res) => {
  try {
    const item = await MenuItem.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    item.isFeatured = !item.isFeatured;
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory, reorderCategories,
  getMenuItems, getMenuItem, createMenuItem, updateMenuItem, deleteMenuItem,
  toggleAvailability, toggleFeatured
};
