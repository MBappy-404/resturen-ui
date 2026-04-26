import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag, Clock, ChevronRight, ArrowLeft } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { shopAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const MyOrders = () => {
  const { customer } = useCustomerAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!customer) { navigate('/login'); return; }
    shopAPI.getMyOrders().then(({ data }) => setOrders(data.data || [])).catch(() => {}).finally(() => setLoading(false));
  }, [customer, navigate]);

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6"><ArrowLeft size={16} />Back</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag size={48} className="text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-1">No orders yet</h3>
          <p className="text-gray-400 mb-4">Start ordering delicious food!</p>
          <Link to="/menu" className="btn-primary">Browse Menu</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order, idx) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
              <Link to={`/order-tracking/${order._id}`} className="block bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div><span className="font-bold text-indigo-600">{order.orderNo}</span><div className="flex items-center gap-2 mt-0.5"><Clock size={12} className="text-gray-400" /><span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</span></div></div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
                <div className="flex flex-wrap gap-1 mb-3">{order.items?.slice(0, 3).map((item, i) => <span key={i} className="text-xs bg-gray-100 rounded-lg px-2 py-1">{item.name} x{item.quantity}</span>)}{order.items?.length > 3 && <span className="text-xs bg-gray-100 rounded-lg px-2 py-1">+{order.items.length - 3} more</span>}</div>
                <div className="flex items-center justify-between"><span className="text-lg font-bold text-gray-800">৳{order.total?.toLocaleString()}</span><StatusBadge status={order.status} /></div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
