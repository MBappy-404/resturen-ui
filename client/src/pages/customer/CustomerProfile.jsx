import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, ShoppingBag, Heart, MapPin, LogOut, Clock, ChevronRight } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { shopAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';

const CustomerProfile = () => {
  const { customer, logout } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    shopAPI.getMyOrders().then(({ data }) => setOrders(data.data || [])).catch(() => {});
  }, []);

  if (!customer) { navigate('/login'); return null; }

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Profile Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-2xl font-bold">{customer.name?.[0]}</div>
          <div>
            <h1 className="text-2xl font-bold">{customer.name}</h1>
            <p className="text-white/70">{customer.email}</p>
            {customer.phone && <p className="text-white/70 text-sm">{customer.phone}</p>}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-white/10 rounded-2xl p-4 text-center"><p className="text-2xl font-bold">{orders.length}</p><p className="text-sm text-white/70">Orders</p></div>
          <div className="bg-white/10 rounded-2xl p-4 text-center"><p className="text-2xl font-bold">{customer.loyaltyPoints || 0}</p><p className="text-sm text-white/70">Points</p></div>
          <div className="bg-white/10 rounded-2xl p-4 text-center"><p className="text-2xl font-bold">৳{orders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}</p><p className="text-sm text-white/70">Total Spent</p></div>
        </div>
      </motion.div>

      {/* Recent Orders */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">Recent Orders</h2>
          <Link to="/orders" className="text-sm text-indigo-600 font-medium hover:underline">View All</Link>
        </div>
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <ShoppingBag size={36} className="text-gray-200 mx-auto mb-2" />
            <p className="text-gray-400">No orders yet</p>
            <Link to="/menu" className="text-sm text-indigo-600 font-medium">Browse Menu</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.slice(0, 5).map(order => (
              <Link key={order._id} to={`/order-tracking/${order._id}`}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                <div>
                  <p className="font-semibold text-sm">{order.orderNo}</p>
                  <div className="flex items-center gap-2 mt-1"><Clock size={12} className="text-gray-400" /><span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span></div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right"><p className="font-bold text-indigo-600">৳{order.total?.toLocaleString()}</p><StatusBadge status={order.status} /></div>
                  <ChevronRight size={16} className="text-gray-400" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </motion.div>

      <button onClick={() => { logout(); navigate('/'); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-red-200 text-red-500 hover:bg-red-50 font-medium transition-colors">
        <LogOut size={18} /> Sign Out
      </button>
    </div>
  );
};

export default CustomerProfile;
