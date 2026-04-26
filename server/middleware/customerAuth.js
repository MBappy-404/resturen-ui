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
    const decoded = jwt.verify(token, process.env.CUSTOMER_JWT_SECRET);
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
      const decoded = jwt.verify(token, process.env.CUSTOMER_JWT_SECRET);
      req.customer = await CustomerUser.findById(decoded.id);
    } catch (error) {
      // Silently continue without auth
    }
  }
  next();
};

module.exports = { customerProtect, optionalCustomerAuth };
