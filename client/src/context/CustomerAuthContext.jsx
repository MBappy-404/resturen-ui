import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { customerAuthAPI } from '../services/api';

const CustomerAuthContext = createContext(null);

export const CustomerAuthProvider = ({ children }) => {
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('customer_token');
    const saved = localStorage.getItem('customer_user');
    if (token && saved) {
      try { setCustomer(JSON.parse(saved)); } catch { localStorage.removeItem('customer_token'); }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await customerAuthAPI.login({ email, password });
    localStorage.setItem('customer_token', data.data.token);
    localStorage.setItem('customer_user', JSON.stringify(data.data.customer));
    setCustomer(data.data.customer);
    return data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await customerAuthAPI.register(formData);
    localStorage.setItem('customer_token', data.data.token);
    localStorage.setItem('customer_user', JSON.stringify(data.data.customer));
    setCustomer(data.data.customer);
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('customer_token');
    localStorage.removeItem('customer_user');
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ customer, loading, login, register, logout }}>
      {children}
    </CustomerAuthContext.Provider>
  );
};

export const useCustomerAuth = () => {
  const context = useContext(CustomerAuthContext);
  if (!context) throw new Error('useCustomerAuth must be within CustomerAuthProvider');
  return context;
};
