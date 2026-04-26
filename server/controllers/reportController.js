const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');
const Customer = require('../models/Customer');
const Inventory = require('../models/Inventory');

const getDashboardStats = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayOrders, totalRevenue, activeOrders, totalCustomers, todayRevenue, lowStock] = await Promise.all([
      Order.countDocuments({ organization: orgId, createdAt: { $gte: today, $lt: tomorrow } }),
      Order.aggregate([{ $match: { organization: orgId, paymentStatus: 'paid' } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Order.countDocuments({ organization: orgId, status: { $nin: ['completed', 'cancelled', 'delivered'] } }),
      Customer.countDocuments({ organization: orgId }),
      Order.aggregate([{ $match: { organization: orgId, paymentStatus: 'paid', createdAt: { $gte: today, $lt: tomorrow } } }, { $group: { _id: null, total: { $sum: '$total' } } }]),
      Inventory.countDocuments({ organization: orgId, $expr: { $lte: ['$currentStock', '$minimumStock'] } })
    ]);

    // Last 7 days sales
    const sevenDaysAgo = new Date(); sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const dailySales = await Order.aggregate([
      { $match: { organization: orgId, paymentStatus: 'paid', createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, total: { $sum: '$total' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Recent orders
    const recentOrders = await Order.find({ organization: orgId }).populate('table', 'tableNo').sort('-createdAt').limit(10);

    // Top selling items
    const topItems = await Order.aggregate([
      { $match: { organization: orgId, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
      { $sort: { totalQty: -1 } },
      { $limit: 10 }
    ]);

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $match: { organization: orgId, createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      success: true,
      data: {
        todayOrders,
        todayRevenue: todayRevenue[0]?.total || 0,
        totalRevenue: totalRevenue[0]?.total || 0,
        activeOrders,
        totalCustomers,
        lowStockCount: lowStock,
        dailySales,
        recentOrders,
        topItems,
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getSalesReport = async (req, res) => {
  try {
    const { startDate, endDate, period = 'daily' } = req.query;
    const orgId = req.user.organization._id;
    const match = { organization: orgId, paymentStatus: 'paid' };
    if (startDate && endDate) {
      match.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }
    const format = period === 'monthly' ? '%Y-%m' : period === 'weekly' ? '%Y-W%V' : '%Y-%m-%d';
    const sales = await Order.aggregate([
      { $match: match },
      { $group: { _id: { $dateToString: { format, date: '$createdAt' } }, totalRevenue: { $sum: '$total' }, orderCount: { $sum: 1 }, avgOrderValue: { $avg: '$total' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data: sales });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRevenueReport = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const revenue = await Order.aggregate([
      { $match: { organization: orgId, paymentStatus: 'paid', createdAt: { $gte: thirtyDaysAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$total' }, tax: { $sum: '$tax' }, serviceCharge: { $sum: '$serviceCharge' }, discount: { $sum: '$discount' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ success: true, data: revenue });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getTopItems = async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const topItems = await Order.aggregate([
      { $match: { organization: req.user.organization._id, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.name', image: { $first: '$items.image' }, totalQty: { $sum: '$items.quantity' }, totalRevenue: { $sum: '$items.subtotal' } } },
      { $sort: { totalQty: -1 } },
      { $limit: parseInt(limit) }
    ]);
    res.json({ success: true, data: topItems });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrderAnalytics = async (req, res) => {
  try {
    const orgId = req.user.organization._id;
    const [byType, bySource, byPayment] = await Promise.all([
      Order.aggregate([{ $match: { organization: orgId } }, { $group: { _id: '$orderType', count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { organization: orgId } }, { $group: { _id: '$orderSource', count: { $sum: 1 }, revenue: { $sum: '$total' } } }]),
      Order.aggregate([{ $match: { organization: orgId, paymentStatus: 'paid' } }, { $group: { _id: '$paymentMethod', count: { $sum: 1 }, revenue: { $sum: '$total' } } }])
    ]);
    res.json({ success: true, data: { byType, bySource, byPayment } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getDashboardStats, getSalesReport, getRevenueReport, getTopItems, getOrderAnalytics };
