const generateOrderNo = async (Order, organizationId) => {
  const count = await Order.countDocuments({ organization: organizationId });
  return `ORD-${String(count + 1).padStart(5, '0')}`;
};

const generateInvoiceNo = async (Invoice, organizationId) => {
  const year = new Date().getFullYear();
  const count = await Invoice.countDocuments({ organization: organizationId });
  return `INV-${year}-${String(count + 1).padStart(5, '0')}`;
};

const calculateOrderTotal = (items, tax = 0, serviceCharge = 0, deliveryCharge = 0, discount = 0) => {
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const taxAmount = (subtotal * tax) / 100;
  const serviceAmount = (subtotal * serviceCharge) / 100;
  const total = subtotal + taxAmount + serviceAmount + deliveryCharge - discount;
  return { subtotal, tax: taxAmount, serviceCharge: serviceAmount, total: Math.max(0, total) };
};

const paginate = (query, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;
  return query.skip(skip).limit(limit);
};

module.exports = { generateOrderNo, generateInvoiceNo, calculateOrderTotal, paginate };
