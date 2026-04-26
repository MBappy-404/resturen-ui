const express = require('express');
const router = express.Router();
const { customerProtect, optionalCustomerAuth } = require('../middleware/customerAuth');
const {
  customerRegister, customerLogin, getCustomerProfile, updateCustomerProfile,
  addAddress, updateAddress, deleteAddress,
  getShopInfo, getShopMenu, getShopMenuItem, getFeaturedItems, getPopularItems,
  placeOrder, trackOrder, getMyOrders,
  createReview, getItemReviews,
  createOnlineReservation, getDeliveryZones, validateCoupon
} = require('../controllers/ecommerceController');

// Customer Auth
router.post('/customer-auth/register', customerRegister);
router.post('/customer-auth/login', customerLogin);
router.get('/customer-auth/me', customerProtect, getCustomerProfile);
router.put('/customer-auth/profile', customerProtect, updateCustomerProfile);
router.post('/customer-auth/addresses', customerProtect, addAddress);
router.put('/customer-auth/addresses/:id', customerProtect, updateAddress);
router.delete('/customer-auth/addresses/:id', customerProtect, deleteAddress);

// Public Shop
router.get('/shop/info', getShopInfo);
router.get('/shop/menu', getShopMenu);
router.get('/shop/menu/:id', getShopMenuItem);
router.get('/shop/featured', getFeaturedItems);
router.get('/shop/popular', getPopularItems);
router.get('/shop/categories', async (req, res) => {
  const Category = require('../models/Category');
  const categories = await Category.find({ isActive: true }).sort('sortOrder');
  res.json({ success: true, data: categories });
});

// Orders
router.post('/shop/orders', optionalCustomerAuth, placeOrder);
router.get('/shop/orders/:id', trackOrder);
router.get('/shop/orders/my/list', customerProtect, getMyOrders);

// Reviews
router.post('/shop/reviews', customerProtect, createReview);
router.get('/shop/reviews/:menuItemId', getItemReviews);

// Reservations
router.post('/shop/reservations', optionalCustomerAuth, createOnlineReservation);

// Delivery & Coupons
router.get('/shop/delivery-zones', getDeliveryZones);
router.post('/shop/coupon/validate', validateCoupon);

module.exports = router;
