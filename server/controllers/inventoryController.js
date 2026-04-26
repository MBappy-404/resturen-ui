const Inventory = require('../models/Inventory');

const getInventory = async (req, res) => {
  try {
    const { category, search, lowStock } = req.query;
    const query = { organization: req.user.organization._id };
    if (category) query.category = category;
    if (search) query.name = new RegExp(search, 'i');
    if (lowStock === 'true') query.$expr = { $lte: ['$currentStock', '$minimumStock'] };
    const items = await Inventory.find(query).sort('name');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.create({ ...req.body, organization: req.user.organization._id });
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteInventoryItem = async (req, res) => {
  try {
    const item = await Inventory.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, message: 'Item deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateStock = async (req, res) => {
  try {
    const { type, quantity, note } = req.body;
    const item = await Inventory.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });

    const previousStock = item.currentStock;
    if (type === 'added') item.currentStock += quantity;
    else if (type === 'used' || type === 'wasted') item.currentStock = Math.max(0, item.currentStock - quantity);
    else if (type === 'returned') item.currentStock += quantity;
    else if (type === 'adjusted') item.currentStock = quantity;

    item.history.push({ type, quantity, previousStock, newStock: item.currentStock, note, doneBy: req.user._id });
    if (type === 'added') item.lastRestocked = new Date();
    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getLowStock = async (req, res) => {
  try {
    const items = await Inventory.find({
      organization: req.user.organization._id,
      $expr: { $lte: ['$currentStock', '$minimumStock'] }
    }).sort('currentStock');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getStockHistory = async (req, res) => {
  try {
    const item = await Inventory.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item.history });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem, updateStock, getLowStock, getStockHistory };
