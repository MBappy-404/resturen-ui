import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, ChefHat, Truck, Package, Circle, ArrowLeft, Phone } from 'lucide-react';
import { shopAPI } from '../../services/api';
import LoadingSpinner from '../../components/ui/LoadingSpinner';

const steps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'out_for_delivery', label: 'On the Way', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle },
];

const dineSteps = [
  { key: 'pending', label: 'Order Placed', icon: Clock },
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
  { key: 'preparing', label: 'Preparing', icon: ChefHat },
  { key: 'ready', label: 'Ready', icon: Package },
  { key: 'served', label: 'Served', icon: CheckCircle },
];

const OrderTracking = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try { const { data } = await shopAPI.trackOrder(id); setOrder(data.data); } catch { console.error('Error'); } finally { setLoading(false); }
    };
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [id]);

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" text="Loading order..." /></div>;
  if (!order) return <div className="py-20 text-center"><p className="text-gray-400">Order not found</p></div>;

  const trackSteps = order.orderType === 'delivery' ? steps : dineSteps;
  const currentIdx = trackSteps.findIndex(s => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8">
      <Link to="/orders" className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6"><ArrowLeft size={16} />My Orders</Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-xl font-bold">Order {order.orderNo}</h1>
            <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium capitalize">{order.status?.replace('_', ' ')}</span>
          </div>
          <p className="text-white/70 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
        </div>

        {/* Progress */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            {trackSteps.map((step, i) => {
              const isComplete = i <= currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <div key={step.key} className="flex flex-col items-center relative flex-1">
                  {i > 0 && <div className={`absolute top-4 -left-1/2 right-1/2 h-0.5 ${i <= currentIdx ? 'bg-indigo-600' : 'bg-gray-200'}`} />}
                  <motion.div initial={false} animate={isCurrent ? { scale: [1, 1.2, 1] } : {}} transition={{ repeat: isCurrent ? Infinity : 0, duration: 2 }}
                    className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center ${isComplete ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                    <step.icon size={16} />
                  </motion.div>
                  <p className={`text-[10px] mt-1.5 font-medium text-center ${isComplete ? 'text-indigo-600' : 'text-gray-400'}`}>{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items */}
        <div className="px-6 pb-6 space-y-3">
          <h3 className="font-semibold text-sm text-gray-800">Order Items</h3>
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between bg-gray-50 rounded-xl p-3 text-sm">
              <div className="flex gap-3">
                {item.image && <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover" />}
                <div><p className="font-medium">{item.name}</p><p className="text-gray-400 text-xs">Qty: {item.quantity}</p></div>
              </div>
              <span className="font-semibold">৳{item.subtotal}</span>
            </div>
          ))}

          <div className="border-t pt-3 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{order.subtotal}</span></div>
            {order.tax > 0 && <div className="flex justify-between"><span className="text-gray-500">Tax</span><span>৳{order.tax?.toFixed(0)}</span></div>}
            {order.deliveryCharge > 0 && <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>৳{order.deliveryCharge}</span></div>}
            {order.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{order.discount}</span></div>}
            <div className="flex justify-between text-lg font-bold pt-2 border-t"><span>Total</span><span className="text-indigo-600">৳{order.total?.toLocaleString()}</span></div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default OrderTracking;
