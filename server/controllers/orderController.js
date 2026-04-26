const Order = require('../models/Order');
const Table = require('../models/Table');
const MenuItem = require('../models/MenuItem');

const getOrders = async (req, res) => {
  try {
    const { status, orderType, source, date, page = 1, limit = 20 } = req.query;
    const query = { organization: req.user.organization._id };
    if (status) query.status = status;
    if (orderType) query.orderType = orderType;
    if (source) query.orderSource = source;
    if (date) {
      const start = new Date(date);
      start.setHours(0, 0, 0, 0);
      const end = new Date(date);
      end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }
    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('table', 'tableNo')
      .populate('customer', 'name phone')
      .populate('servedBy', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    res.json({ success: true, data: orders, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, organization: req.user.organization._id })
      .populate('table').populate('customer', 'name phone email').populate('servedBy', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createOrder = async (req, res) => {
  try {
    const orderData = { ...req.body, organization: req.user.organization._id, servedBy: req.user._id };

    // Calculate item subtotals
    if (orderData.items) {
      orderData.items = orderData.items.map(item => {
        const addonsTotal = (item.addons || []).reduce((sum, a) => sum + (a.price || 0), 0);
        item.subtotal = (item.unitPrice + addonsTotal) * item.quantity;
        return item;
      });
      orderData.subtotal = orderData.items.reduce((sum, item) => sum + item.subtotal, 0);
      const taxRate = req.user.organization?.taxRate || 0;
      const serviceRate = req.user.organization?.settings?.serviceCharge || 0;
      orderData.tax = (orderData.subtotal * taxRate) / 100;
      orderData.serviceCharge = (orderData.subtotal * serviceRate) / 100;
      orderData.total = orderData.subtotal + orderData.tax + orderData.serviceCharge + (orderData.deliveryCharge || 0) - (orderData.discount || 0);
    }

    orderData.timeline = [{ status: 'pending', timestamp: new Date(), note: 'Order created', updatedBy: req.user._id }];

    const order = await Order.create(orderData);

    // Update table status if dine-in
    if (order.table && order.orderType === 'dine_in') {
      await Table.findByIdAndUpdate(order.table, { status: 'occupied', currentOrder: order._id });
    }

    // Update menu item order counts
    for (const item of order.items) {
      if (item.menuItem) {
        await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { orderCount: 1 } });
      }
    }

    const populated = await order.populate([
      { path: 'table', select: 'tableNo' },
      { path: 'servedBy', select: 'name' }
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    ).populate('table', 'tableNo').populate('servedBy', 'name');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const order = await Order.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.status = status;
    order.timeline.push({ status, timestamp: new Date(), note: note || '', updatedBy: req.user._id });

    if (status === 'completed' || status === 'delivered') {
      order.completedAt = new Date();
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, { status: 'cleaning', currentOrder: null });
      }
    }
    if (status === 'delivered') order.deliveredAt = new Date();
    if (status === 'cancelled') {
      order.cancelReason = note || '';
      if (order.table) {
        await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
      }
    }

    await order.save();
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updatePayment = async (req, res) => {
  try {
    const { paymentStatus, paymentMethod, paidAmount, transactionId } = req.body;
    const order = await Order.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    order.paymentStatus = paymentStatus;
    order.paymentMethod = paymentMethod || order.paymentMethod;
    order.paidAmount = paidAmount || order.paidAmount;
    order.changeAmount = Math.max(0, (paidAmount || 0) - order.total);
    order.transactionId = transactionId || order.transactionId;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, organization: req.user.organization._id });
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    if (order.table) {
      await Table.findByIdAndUpdate(order.table, { status: 'available', currentOrder: null });
    }
    await order.deleteOne();
    res.json({ success: true, message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getKitchenOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      organization: req.user.organization._id,
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] }
    }).populate('table', 'tableNo').sort('createdAt');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getActiveOrders = async (req, res) => {
  try {
    const orders = await Order.find({
      organization: req.user.organization._id,
      status: { $nin: ['completed', 'cancelled', 'delivered'] }
    }).populate('table', 'tableNo').populate('servedBy', 'name').sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getOrders, getOrder, createOrder, updateOrder,
  updateOrderStatus, updatePayment, deleteOrder,
  getKitchenOrders, getActiveOrders
};
