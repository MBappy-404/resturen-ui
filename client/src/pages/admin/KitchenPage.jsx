import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChefHat, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { orderAPI } from '../../services/api';
import StatusBadge from '../../components/ui/StatusBadge';
import toast from 'react-hot-toast';

const KitchenPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await orderAPI.getKitchenOrders();
      setOrders(data.data);
    } catch { toast.error('Error loading kitchen orders'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchOrders(); const interval = setInterval(fetchOrders, 30000); return () => clearInterval(interval); }, [fetchOrders]);

  const updateStatus = async (id, status) => {
    try {
      await orderAPI.updateStatus(id, { status });
      toast.success(`Marked as ${status}`);
      fetchOrders();
    } catch { toast.error('Error updating'); }
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const getTimeAgo = (date) => {
    const mins = Math.floor((Date.now() - new Date(date)) / 60000);
    return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
  };

  const statusColors = { pending: 'border-amber-400 bg-amber-50', confirmed: 'border-blue-400 bg-blue-50', preparing: 'border-purple-400 bg-purple-50', ready: 'border-emerald-400 bg-emerald-50' };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['all', 'pending', 'confirmed', 'preparing', 'ready'].map(s => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} ({s === 'all' ? orders.length : orders.filter(o => o.status === s).length})
            </button>
          ))}
        </div>
        <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2 text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        <AnimatePresence>
          {filtered.map(order => (
            <motion.div key={order._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className={`rounded-2xl border-2 p-4 ${statusColors[order.status] || 'border-slate-200 bg-white'}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <span className="font-bold text-lg">{order.orderNo}</span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge status={order.status} />
                    <span className="text-xs text-slate-500 capitalize">{order.orderType?.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium">
                  <Clock size={14} className="text-slate-400" />
                  <span className={`${parseInt(getTimeAgo(order.createdAt)) > 30 ? 'text-red-500' : 'text-slate-600'}`}>{getTimeAgo(order.createdAt)}</span>
                </div>
              </div>

              {order.table && <div className="text-xs bg-white/60 rounded-lg px-2 py-1 mb-2 inline-block">Table: {order.table.tableNo}</div>}

              <div className="space-y-1.5 mb-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-xs font-bold text-indigo-600">{item.quantity}</span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </div>
                ))}
              </div>

              {order.kitchenNote && (
                <div className="bg-amber-100 rounded-lg p-2 text-xs text-amber-700 mb-3">
                  <AlertCircle size={12} className="inline mr-1" /> {order.kitchenNote}
                </div>
              )}

              <div className="flex gap-2">
                {order.status === 'pending' && (
                  <button onClick={() => updateStatus(order._id, 'confirmed')} className="flex-1 btn-primary text-sm py-2 flex items-center justify-center gap-1">
                    <CheckCircle size={14} /> Accept
                  </button>
                )}
                {order.status === 'confirmed' && (
                  <button onClick={() => updateStatus(order._id, 'preparing')} className="flex-1 bg-purple-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-purple-600 flex items-center justify-center gap-1">
                    <ChefHat size={14} /> Start Cooking
                  </button>
                )}
                {order.status === 'preparing' && (
                  <button onClick={() => updateStatus(order._id, 'ready')} className="flex-1 btn-success text-sm py-2 flex items-center justify-center gap-1">
                    <CheckCircle size={14} /> Ready
                  </button>
                )}
                {order.status === 'ready' && (
                  <button onClick={() => updateStatus(order._id, order.orderType === 'dine_in' ? 'served' : 'out_for_delivery')}
                    className="flex-1 bg-sky-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-sky-600">
                    {order.orderType === 'dine_in' ? 'Served' : 'Out for Delivery'}
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20">
          <ChefHat size={48} className="text-slate-300 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No orders in kitchen</p>
        </div>
      )}
    </div>
  );
};

export default KitchenPage;
