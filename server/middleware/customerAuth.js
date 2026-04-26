const jwt = require('jsonwebtoken');
const CustomerUser = require('../models/CustomerUser');

const customerProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  try {
    const secret = process.env.CUSTOMER_JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Customer JWT Secret is not configured' });
    }
    const decoded = jwt.verify(token, secret);
    req.customer = await CustomerUser.findById(decoded.id);
    if (!req.customer) {
      return res.status(401).json({ success: false, message: 'Customer not found' });
    }
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const optionalCustomerAuth = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (token) {
    try {
      const secret = process.env.CUSTOMER_JWT_SECRET;
      if (secret) {
        const decoded = jwt.verify(token, secret);
        req.customer = await CustomerUser.findById(decoded.id);
      }
    } catch (error) {
      // Silently continue without auth
    }
  }
  next();
};

module.exports = { customerProtect, optionalCustomerAuth };
