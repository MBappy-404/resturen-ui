import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Clock } from 'lucide-react';
import { orderAPI, menuAPI, tableAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
const deliveryFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', orderType: '', page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [newOrder, setNewOrder] = useState({ orderType: 'dine_in', table: '', items: [], customerInfo: { name: '', phone: '' } });

  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await orderAPI.getOrders(filter);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleStatusUpdate = async (orderId, status) => {
    try {
      await orderAPI.updateStatus(orderId, { status });
      toast.success(`Order ${status}`);
      fetchOrders();
      if (selectedOrder?._id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch { toast.error('Error updating status'); }
  };

  const handlePayment = async (orderId, paymentData) => {
    try {
      await orderAPI.updatePayment(orderId, paymentData);
      toast.success('Payment updated');
      fetchOrders();
    } catch { toast.error('Error updating payment'); }
  };

  const openCreateOrder = async () => {
    try {
      const [menuRes, tableRes] = await Promise.all([menuAPI.getItems({}), tableAPI.getTables({ status: 'available' })]);
      setMenuItems(menuRes.data.data);
      setTables(tableRes.data.data);
      setNewOrder({ orderType: 'dine_in', table: '', items: [], customerInfo: { name: '', phone: '' } });
      setShowCreateModal(true);
    } catch { toast.error('Error loading data'); }
  };

  const addItemToOrder = (item) => {
    setNewOrder(prev => {
      const existing = prev.items.find(i => i.menuItem === item._id);
      if (existing) {
        return { ...prev, items: prev.items.map(i => i.menuItem === item._id ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.unitPrice } : i) };
      }
      return { ...prev, items: [...prev.items, { menuItem: item._id, name: item.name, image: item.image, unitPrice: item.price, quantity: 1, subtotal: item.price }] };
    });
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (newOrder.items.length === 0) { toast.error('Add at least one item'); return; }
    try {
      await orderAPI.createOrder(newOrder);
      toast.success('Order created');
      setShowCreateModal(false);
      fetchOrders();
    } catch (error) { toast.error(error.response?.data?.message || 'Error creating order'); }
  };

  if (loading) return <LoadingSpinner size="lg" text="Loading orders..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter({ ...filter, status: s, page: 1 })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter.status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All'}
            </button>
          ))}
        </div>
        <button onClick={openCreateOrder} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> New Order
        </button>
      </div>

      {orders.length === 0 ? (
        <EmptyState title="No orders" description="No orders found matching your filter" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {orders.map((order, idx) => (
            <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="card p-4 cursor-pointer hover:ring-2 hover:ring-indigo-500/20"
              onClick={() => { setSelectedOrder(order); setShowModal(true); }}>
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-indigo-600">{order.orderNo}</span>
                <StatusBadge status={order.status} />
              </div>
              <div className="space-y-1 text-sm text-gray-500">
                <p className="capitalize">{order.orderType?.replace('_', ' ')} {order.table?.tableNo ? `• ${order.table.tableNo}` : ''}</p>
                <p>{order.items?.length} items</p>
              </div>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-lg font-bold text-gray-800 dark:text-white">৳{order.total?.toLocaleString()}</span>
                <StatusBadge status={order.paymentStatus} />
              </div>
              <div className="flex gap-1 mt-3">
                {(order.orderType === 'delivery' ? deliveryFlow : statusFlow)
                  .filter(s => statusFlow.indexOf(s) > statusFlow.indexOf(order.status) || deliveryFlow.indexOf(s) > deliveryFlow.indexOf(order.status))
                  .slice(0, 2)
                  .map(s => (
                    <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, s); }}
                      className="text-xs px-2 py-1 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-medium capitalize">
                      {s.replace('_', ' ')}
                    </button>
                  ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Order Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Order ${selectedOrder?.orderNo}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Status</p><StatusBadge status={selectedOrder.status} /></div>
              <div><p className="text-xs text-gray-500">Payment</p><StatusBadge status={selectedOrder.paymentStatus} /></div>
              <div><p className="text-xs text-gray-500">Type</p><p className="text-sm font-medium capitalize">{selectedOrder.orderType?.replace('_', ' ')}</p></div>
              <div><p className="text-xs text-gray-500">Table</p><p className="text-sm font-medium">{selectedOrder.table?.tableNo || 'N/A'}</p></div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm bg-gray-50 dark:bg-gray-700/50 p-2 rounded-lg">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">৳{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
                <div className="flex justify-between"><span>Subtotal</span><span>৳{selectedOrder.subtotal}</span></div>
                <div className="flex justify-between"><span>Tax</span><span>৳{selectedOrder.tax?.toFixed(0)}</span></div>
                <div className="flex justify-between"><span>Service Charge</span><span>৳{selectedOrder.serviceCharge?.toFixed(0)}</span></div>
                {selectedOrder.discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{selectedOrder.discount}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span>৳{selectedOrder.total?.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pt-4 border-t">
              {(selectedOrder.orderType === 'delivery' ? deliveryFlow : statusFlow).map(s => (
                <button key={s} onClick={() => handleStatusUpdate(selectedOrder._id, s)}
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${selectedOrder.status === s ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  {s.replace('_', ' ')}
                </button>
              ))}
              <button onClick={() => handleStatusUpdate(selectedOrder._id, 'cancelled')} className="text-xs px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium">Cancel</button>
            </div>
            {selectedOrder.paymentStatus !== 'paid' && (
              <div className="flex gap-2 pt-2">
                {['cash', 'card', 'bkash', 'nagad'].map(method => (
                  <button key={method} onClick={() => handlePayment(selectedOrder._id, { paymentStatus: 'paid', paymentMethod: method, paidAmount: selectedOrder.total })}
                    className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 font-medium capitalize">
                    Pay ({method})
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Create Order Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="New Order" size="xl">
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Order Type</label>
              <select value={newOrder.orderType} onChange={(e) => setNewOrder({ ...newOrder, orderType: e.target.value })} className="input-field">
                <option value="dine_in">Dine In</option>
                <option value="takeaway">Takeaway</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
            {newOrder.orderType === 'dine_in' && (
              <div>
                <label className="block text-sm font-medium mb-1">Table</label>
                <select value={newOrder.table} onChange={(e) => setNewOrder({ ...newOrder, table: e.target.value })} className="input-field">
                  <option value="">Select Table</option>
                  {tables.map(t => <option key={t._id} value={t._id}>{t.tableNo} (Cap: {t.capacity})</option>)}
                </select>
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1">Customer Name</label>
              <input value={newOrder.customerInfo.name} onChange={(e) => setNewOrder({ ...newOrder, customerInfo: { ...newOrder.customerInfo, name: e.target.value } })} className="input-field" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-sm mb-2">Menu Items</h4>
              <div className="max-h-60 overflow-y-auto space-y-1">
                {menuItems.filter(i => i.isAvailable).map(item => (
                  <button key={item._id} type="button" onClick={() => addItemToOrder(item)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 text-left text-sm">
                    <span>{item.name}</span>
                    <span className="font-medium text-indigo-600">৳{item.price}</span>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Order Items ({newOrder.items.length})</h4>
              <div className="space-y-2">
                {newOrder.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg text-sm">
                    <span className="flex-1">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setNewOrder(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, quantity: Math.max(1, it.quantity - 1), subtotal: Math.max(1, it.quantity - 1) * it.unitPrice } : it) }))} className="w-6 h-6 rounded bg-gray-200 text-sm">-</button>
                      <span className="font-medium">{item.quantity}</span>
                      <button type="button" onClick={() => setNewOrder(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, quantity: it.quantity + 1, subtotal: (it.quantity + 1) * it.unitPrice } : it) }))} className="w-6 h-6 rounded bg-gray-200 text-sm">+</button>
                      <span className="font-medium w-16 text-right">৳{item.subtotal}</span>
                    </div>
                  </div>
                ))}
                {newOrder.items.length > 0 && (
                  <div className="pt-2 border-t text-right font-bold">
                    Total: ৳{newOrder.items.reduce((s, i) => s + i.subtotal, 0).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowCreateModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Order</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default OrdersPage;
