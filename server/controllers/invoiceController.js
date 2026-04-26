const Invoice = require('../models/Invoice');
const Order = require('../models/Order');

const getInvoices = async (req, res) => {
  try {
    const { status, date, page = 1, limit = 20 } = req.query;
    const query = { organization: req.user.organization._id };
    if (status) query.status = status;
    if (date) {
      const start = new Date(date); start.setHours(0, 0, 0, 0);
      const end = new Date(date); end.setHours(23, 59, 59, 999);
      query.createdAt = { $gte: start, $lte: end };
    }
    const total = await Invoice.countDocuments(query);
    const invoices = await Invoice.find(query)
      .populate('order', 'orderNo orderType')
      .populate('generatedBy', 'name')
      .sort('-createdAt')
      .skip((page - 1) * limit).limit(parseInt(limit));
    res.json({ success: true, data: invoices, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, organization: req.user.organization._id })
      .populate('order').populate('generatedBy', 'name').populate({ path: 'organization', select: 'name logo address phone email settings' });
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createInvoice = async (req, res) => {
  try {
    const { orderId, ...invoiceData } = req.body;
    let order;
    if (orderId) {
      order = await Order.findById(orderId);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      invoiceData.order = order._id;
      invoiceData.items = order.items.map(item => ({
        name: item.name, quantity: item.quantity, unitPrice: item.unitPrice,
        variant: item.variant, addons: item.addons, subtotal: item.subtotal
      }));
      invoiceData.subtotal = order.subtotal;
      invoiceData.tax = order.tax;
      invoiceData.serviceCharge = order.serviceCharge;
      invoiceData.deliveryCharge = order.deliveryCharge;
      invoiceData.discount = order.discount;
      invoiceData.total = order.total;
      invoiceData.grandTotal = order.total;
      invoiceData.paymentMethod = order.paymentMethod;
      invoiceData.paymentDetails = {
        paidAmount: order.paidAmount,
        changeAmount: order.changeAmount,
        transactionId: order.transactionId
      };
      invoiceData.customerInfo = order.customerInfo;
    }
    invoiceData.organization = req.user.organization._id;
    invoiceData.generatedBy = req.user._id;
    const invoice = await Invoice.create(invoiceData);
    const populated = await invoice.populate([
      { path: 'organization', select: 'name logo address phone email settings currencySymbol' },
      { path: 'generatedBy', select: 'name' }
    ]);
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      req.body, { new: true }
    ).populate('organization', 'name logo address phone email settings');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const voidInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { status: 'void' }, { new: true }
    );
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPrintInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, organization: req.user.organization._id },
      { isPrinted: true, printedAt: new Date(), $inc: { printCount: 1 } }, { new: true }
    ).populate('organization', 'name logo address phone email settings currencySymbol');
    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    res.json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getInvoices, getInvoice, createInvoice, updateInvoice, voidInvoice, getPrintInvoice };
