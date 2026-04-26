const Customer = require('../models/Customer');
const Order = require('../models/Order');

const getCustomers = async (req, res) => {
  try {
    const { search, tag, page = 1, limit = 20 } = req.query;
    const query = { organization: req.user.organization._id };
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { phone: new RegExp(search, 'i') }];
    if (tag) query.tags = tag;
    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query).sort('-totalSpent').skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: customers, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    const orders = await Order.find({ 'customerInfo.phone': customer.phone, organization: req.user.organization._id }).sort('-createdAt').limit(20);
    res.json({ success: true, data: { customer, orders } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({ ...req.body, organization: req.user.organization._id });
    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    );
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findOneAndDelete({ _id: req.params.id, organization: req.user.organization._id });
    if (!customer) return res.status(404).json({ success: false, message: 'Customer not found' });
    res.json({ success: true, message: 'Customer deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getCustomers, getCustomer, createCustomer, updateCustomer, deleteCustomer };
