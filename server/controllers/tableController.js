const Table = require('../models/Table');

const getTables = async (req, res) => {
  try {
    const { floor, status } = req.query;
    const query = { organization: req.user.organization._id };
    if (floor) query.floor = floor;
    if (status) query.status = status;
    const tables = await Table.find(query).populate('currentOrder').sort('tableNo');
    res.json({ success: true, data: tables });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createTable = async (req, res) => {
  try {
    const table = await Table.create({ ...req.body, organization: req.user.organization._id });
    res.status(201).json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTable = async (req, res) => {
  try {
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteTable = async (req, res) => {
  try {
    const table = await Table.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, message: 'Table deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateTableStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const table = await Table.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { status }, { new: true }
    );
    if (!table) return res.status(404).json({ success: false, message: 'Table not found' });
    res.json({ success: true, data: table });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTables, createTable, updateTable, deleteTable, updateTableStatus };
