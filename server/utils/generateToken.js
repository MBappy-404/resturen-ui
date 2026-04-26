const jwt = require('jsonwebtoken');

const generateToken = (id, isCustomer = false) => {
  const secret = isCustomer ? process.env.CUSTOMER_JWT_SECRET : process.env.JWT_SECRET;
  const expire = isCustomer ? process.env.CUSTOMER_JWT_EXPIRE : process.env.JWT_EXPIRE;
  
  if (!secret) {
    throw new Error(`JWT Secret is not defined in environment variables (${isCustomer ? 'CUSTOMER_JWT_SECRET' : 'JWT_SECRET'})`);
  }

  return jwt.sign({ id }, secret, { expiresIn: expire || '30d' });
};

module.exports = generateToken;
