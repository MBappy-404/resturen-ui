const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');
const { getDashboardStats, getSalesReport, getRevenueReport, getTopItems, getOrderAnalytics } = require('../controllers/reportController');

router.use(protect);
router.use(roleCheck('super_admin', 'admin', 'manager'));
router.get('/dashboard', getDashboardStats);
router.get('/sales', getSalesReport);
router.get('/revenue', getRevenueReport);
router.get('/top-items', getTopItems);
router.get('/orders', getOrderAnalytics);

module.exports = router;
