const Organization = require('../models/Organization');
const Category = require('../models/Category');
const MenuItem = require('../models/MenuItem');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Reservation = require('../models/Reservation');
const Coupon = require('../models/Coupon');
const DeliveryZone = require('../models/DeliveryZone');
const CustomerUser = require('../models/CustomerUser');
const generateToken = require('../utils/generateToken');

// Customer Auth
const customerRegister = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const existing = await CustomerUser.findOne({ email });
    if (existing) return res.status(400).json({ success: false, message: 'Email already registered' });
    const customer = await CustomerUser.create({ name, email, password, phone });
    const token = generateToken(customer._id, true);
    res.status(201).json({ success: true, data: { customer: { _id: customer._id, name, email, phone }, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const customerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const customer = await CustomerUser.findOne({ email }).select('+password');
    if (!customer || !(await customer.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const token = generateToken(customer._id, true);
    res.json({ success: true, data: { customer: { _id: customer._id, name: customer.name, email: customer.email, phone: customer.phone, addresses: customer.addresses, loyaltyPoints: customer.loyaltyPoints }, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getCustomerProfile = async (req, res) => {
  try {
    res.json({ success: true, data: req.customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateCustomerProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const customer = await CustomerUser.findByIdAndUpdate(req.customer._id, { name, phone, avatar }, { new: true });
    res.json({ success: true, data: customer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const addAddress = async (req, res) => {
  try {
    const customer = await CustomerUser.findById(req.customer._id);
    if (req.body.isDefault) customer.addresses.forEach(a => { a.isDefault = false; });
    customer.addresses.push(req.body);
    await customer.save();
    res.json({ success: true, data: customer.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const customer = await CustomerUser.findById(req.customer._id);
    const addr = customer.addresses.id(req.params.id);
    if (!addr) return res.status(404).json({ success: false, message: 'Address not found' });
    Object.assign(addr, req.body);
    await customer.save();
    res.json({ success: true, data: customer.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const customer = await CustomerUser.findById(req.customer._id);
    customer.addresses.pull(req.params.id);
    await customer.save();
    res.json({ success: true, data: customer.addresses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Public Shop APIs
const getShopInfo = async (req, res) => {
  try {
    const org = await Organization.findOne().select('name logo coverImage description address phone email website socialMedia openingHours features settings.estimatedDeliveryTime settings.deliveryCharge settings.freeDeliveryMinOrder settings.minOrderAmount settings.acceptOnlineOrders settings.acceptReservations');
    if (!org) return res.status(404).json({ success: false, message: 'Restaurant not found' });
    res.json({ success: true, data: org });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getShopMenu = async (req, res) => {
  try {
    const { category, search, sort } = req.query;
    const categories = await Category.find({ isActive: true }).sort('sortOrder');
    const query = { isAvailable: true };
    if (category) query.category = category;
    if (search) query.$or = [{ name: new RegExp(search, 'i') }, { description: new RegExp(search, 'i') }];
    let sortOption = '-createdAt';
    if (sort === 'price_low') sortOption = 'price';
    else if (sort === 'price_high') sortOption = '-price';
    else if (sort === 'popular') sortOption = '-orderCount';
    else if (sort === 'rating') sortOption = '-rating';
    const items = await MenuItem.find(query).populate('category', 'name').sort(sortOption);
    res.json({ success: true, data: { categories, items } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getShopMenuItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id).populate('category', 'name');
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    const reviews = await Review.find({ menuItem: item._id, isPublished: true }).populate('customer', 'name avatar').sort('-createdAt').limit(10);
    res.json({ success: true, data: { item, reviews } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeaturedItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isFeatured: true, isAvailable: true }).populate('category', 'name').limit(12);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getPopularItems = async (req, res) => {
  try {
    const items = await MenuItem.find({ isAvailable: true }).populate('category', 'name').sort('-orderCount').limit(12);
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Online Order
const placeOrder = async (req, res) => {
  try {
    const org = await Organization.findOne();
    if (!org) return res.status(404).json({ success: false, message: 'Restaurant not found' });

    const orderData = {
      ...req.body,
      organization: org._id,
      orderSource: 'website',
      orderType: req.body.orderType || 'delivery'
    };
    if (req.customer) {
      orderData.customer = req.customer._id;
    }

    // Calculate
    if (orderData.items) {
      orderData.items = orderData.items.map(item => {
        const addonsTotal = (item.addons || []).reduce((s, a) => s + (a.price || 0), 0);
        item.subtotal = (item.unitPrice + addonsTotal) * item.quantity;
        return item;
      });
      orderData.subtotal = orderData.items.reduce((s, i) => s + i.subtotal, 0);
      orderData.tax = (orderData.subtotal * (org.taxRate || 0)) / 100;
      orderData.serviceCharge = (orderData.subtotal * (org.settings?.serviceCharge || 0)) / 100;
      orderData.total = orderData.subtotal + orderData.tax + orderData.serviceCharge + (orderData.deliveryCharge || 0) - (orderData.discount || 0);
    }

    orderData.timeline = [{ status: 'pending', timestamp: new Date(), note: 'Order placed online' }];
    const order = await Order.create(orderData);

    // Update customer stats
    if (req.customer) {
      await CustomerUser.findByIdAndUpdate(req.customer._id, { $inc: { totalOrders: 1, totalSpent: order.total } });
    }

    // Update menu item order counts
    for (const item of order.items) {
      if (item.menuItem) await MenuItem.findByIdAndUpdate(item.menuItem, { $inc: { orderCount: 1 } });
    }

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const trackOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select('orderNo status items subtotal tax serviceCharge deliveryCharge discount total paymentStatus paymentMethod estimatedTime deliveryAddress timeline createdAt');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ customer: req.customer._id }).sort('-createdAt');
    res.json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Reviews
const createReview = async (req, res) => {
  try {
    const org = await Organization.findOne();
    const review = await Review.create({ ...req.body, customer: req.customer._id, organization: org._id, isVerified: true });
    // Update menu item rating
    const reviews = await Review.find({ menuItem: req.body.menuItem, isPublished: true });
    const avgRating = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
    await MenuItem.findByIdAndUpdate(req.body.menuItem, { rating: avgRating.toFixed(1), reviewCount: reviews.length });
    const populated = await review.populate('customer', 'name avatar');
    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getItemReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ menuItem: req.params.menuItemId, isPublished: true })
      .populate('customer', 'name avatar').sort('-createdAt');
    res.json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Online Reservation
const createOnlineReservation = async (req, res) => {
  try {
    const org = await Organization.findOne();
    const reservation = await Reservation.create({
      ...req.body, organization: org._id, source: 'website',
      customer: req.customer ? req.customer._id : undefined
    });
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delivery Zones
const getDeliveryZones = async (req, res) => {
  try {
    const zones = await DeliveryZone.find({ isActive: true });
    res.json({ success: true, data: zones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Validate Coupon
const validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    const coupon = await Coupon.findOne({ code: code.toUpperCase(), isActive: true });
    if (!coupon) return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) return res.status(400).json({ success: false, message: 'Coupon expired' });
    if (coupon.usedCount >= coupon.usageLimit) return res.status(400).json({ success: false, message: 'Coupon usage limit reached' });
    if (orderAmount < coupon.minOrderAmount) return res.status(400).json({ success: false, message: `Minimum order amount is ${coupon.minOrderAmount}` });
    let discount = coupon.type === 'percentage' ? (orderAmount * coupon.value) / 100 : coupon.value;
    if (coupon.maxDiscount > 0 && discount > coupon.maxDiscount) discount = coupon.maxDiscount;
    res.json({ success: true, data: { code: coupon.code, type: coupon.type, value: coupon.value, discount } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  customerRegister, customerLogin, getCustomerProfile, updateCustomerProfile,
  addAddress, updateAddress, deleteAddress,
  getShopInfo, getShopMenu, getShopMenuItem, getFeaturedItems, getPopularItems,
  placeOrder, trackOrder, getMyOrders,
  createReview, getItemReviews,
  createOnlineReservation, getDeliveryZones, validateCoupon
};
