import axios from 'axios';

const API_URL = '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      if (window.location.pathname.startsWith('/admin')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Customer API instance
const customerApi = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

customerApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('customer_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

customerApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer_token');
      localStorage.removeItem('customer_user');
    }
    return Promise.reject(error);
  }
);

// Admin APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

export const menuAPI = {
  getCategories: () => api.get('/menu/categories'),
  createCategory: (data) => api.post('/menu/categories', data),
  updateCategory: (id, data) => api.put(`/menu/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/menu/categories/${id}`),
  getItems: (params) => api.get('/menu', { params }),
  getItem: (id) => api.get(`/menu/${id}`),
  createItem: (data) => api.post('/menu', data),
  updateItem: (id, data) => api.put(`/menu/${id}`, data),
  deleteItem: (id) => api.delete(`/menu/${id}`),
  toggleAvailability: (id) => api.patch(`/menu/${id}/availability`),
  toggleFeatured: (id) => api.patch(`/menu/${id}/featured`),
};

export const orderAPI = {
  getOrders: (params) => api.get('/orders', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (data) => api.post('/orders', data),
  updateOrder: (id, data) => api.put(`/orders/${id}`, data),
  updateStatus: (id, data) => api.patch(`/orders/${id}/status`, data),
  updatePayment: (id, data) => api.patch(`/orders/${id}/payment`, data),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  getKitchenOrders: () => api.get('/orders/kitchen'),
  getActiveOrders: () => api.get('/orders/active'),
};

export const tableAPI = {
  getTables: (params) => api.get('/tables', { params }),
  createTable: (data) => api.post('/tables', data),
  updateTable: (id, data) => api.put(`/tables/${id}`, data),
  deleteTable: (id) => api.delete(`/tables/${id}`),
  updateStatus: (id, data) => api.patch(`/tables/${id}/status`, data),
};

export const reservationAPI = {
  getReservations: (params) => api.get('/reservations', { params }),
  create: (data) => api.post('/reservations', data),
  update: (id, data) => api.put(`/reservations/${id}`, data),
  updateStatus: (id, data) => api.patch(`/reservations/${id}/status`, data),
  delete: (id) => api.delete(`/reservations/${id}`),
  getAvailableSlots: (date) => api.get('/reservations/available-slots', { params: { date } }),
};

export const staffAPI = {
  getStaff: (params) => api.get('/staff', { params }),
  getStaffMember: (id) => api.get(`/staff/${id}`),
  createStaff: (data) => api.post('/staff', data),
  updateStaff: (id, data) => api.put(`/staff/${id}`, data),
  deleteStaff: (id) => api.delete(`/staff/${id}`),
  markAttendance: (id, data) => api.post(`/staff/${id}/attendance`, data),
  getAttendance: (id) => api.get(`/staff/${id}/attendance`),
};

export const inventoryAPI = {
  getInventory: (params) => api.get('/inventory', { params }),
  createItem: (data) => api.post('/inventory', data),
  updateItem: (id, data) => api.put(`/inventory/${id}`, data),
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  updateStock: (id, data) => api.post(`/inventory/${id}/stock`, data),
  getLowStock: () => api.get('/inventory/low-stock'),
};

export const customerAdminAPI = {
  getCustomers: (params) => api.get('/customers', { params }),
  getCustomer: (id) => api.get(`/customers/${id}`),
  createCustomer: (data) => api.post('/customers', data),
  updateCustomer: (id, data) => api.put(`/customers/${id}`, data),
  deleteCustomer: (id) => api.delete(`/customers/${id}`),
};

export const invoiceAPI = {
  getInvoices: (params) => api.get('/invoices', { params }),
  getInvoice: (id) => api.get(`/invoices/${id}`),
  createInvoice: (data) => api.post('/invoices', data),
  voidInvoice: (id) => api.patch(`/invoices/${id}/void`),
  getPrintInvoice: (id) => api.get(`/invoices/${id}/print`),
};

export const reportAPI = {
  getDashboard: () => api.get('/reports/dashboard'),
  getSalesReport: (params) => api.get('/reports/sales', { params }),
  getRevenueReport: () => api.get('/reports/revenue'),
  getTopItems: (params) => api.get('/reports/top-items', { params }),
  getOrderAnalytics: () => api.get('/reports/orders'),
};

export const organizationAPI = {
  getOrganization: () => api.get('/organization'),
  updateOrganization: (data) => api.put('/organization', data),
  updateSettings: (data) => api.put('/organization/settings', data),
  getBranches: () => api.get('/organization/branches'),
  createBranch: (data) => api.post('/organization/branches', data),
  updateBranch: (id, data) => api.put(`/organization/branches/${id}`, data),
  deleteBranch: (id) => api.delete(`/organization/branches/${id}`),
  getUsers: () => api.get('/organization/users'),
  inviteUser: (data) => api.post('/organization/users/invite', data),
};

// Customer / Shop APIs
export const shopAPI = {
  getShopInfo: () => customerApi.get('/shop/info'),
  getMenu: (params) => customerApi.get('/shop/menu', { params }),
  getMenuItem: (id) => customerApi.get(`/shop/menu/${id}`),
  getFeatured: () => customerApi.get('/shop/featured'),
  getPopular: () => customerApi.get('/shop/popular'),
  getCategories: () => customerApi.get('/shop/categories'),
  placeOrder: (data) => customerApi.post('/shop/orders', data),
  trackOrder: (id) => customerApi.get(`/shop/orders/${id}`),
  getMyOrders: () => customerApi.get('/shop/orders/my/list'),
  createReview: (data) => customerApi.post('/shop/reviews', data),
  getReviews: (menuItemId) => customerApi.get(`/shop/reviews/${menuItemId}`),
  createReservation: (data) => customerApi.post('/shop/reservations', data),
  getDeliveryZones: () => customerApi.get('/shop/delivery-zones'),
  validateCoupon: (data) => customerApi.post('/shop/coupon/validate', data),
};

export const customerAuthAPI = {
  register: (data) => customerApi.post('/customer-auth/register', data),
  login: (data) => customerApi.post('/customer-auth/login', data),
  getProfile: () => customerApi.get('/customer-auth/me'),
  updateProfile: (data) => customerApi.put('/customer-auth/profile', data),
  addAddress: (data) => customerApi.post('/customer-auth/addresses', data),
  updateAddress: (id, data) => customerApi.put(`/customer-auth/addresses/${id}`, data),
  deleteAddress: (id) => customerApi.delete(`/customer-auth/addresses/${id}`),
};

export default api;
