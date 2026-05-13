import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Eye, Clock, Monitor, Globe, Trash2, ArrowLeft } from 'lucide-react';


import { orderAPI, menuAPI, tableAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import toast from 'react-hot-toast';


const statusFlow = ['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed'];
const deliveryFlow = ['pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered'];

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: '', orderType: '', page: 1, limit: 10 });

  const [showModal, setShowModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [deleteId, setDeleteId] = useState(null);
  const [newOrder, setNewOrder] = useState({ orderType: 'dine_in', table: '', items: [], customerInfo: { name: '', phone: '' } });


  const fetchOrders = useCallback(async () => {
    try {
      const { data } = await orderAPI.getOrders(filter);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { 
    fetchOrders(); 
  }, [JSON.stringify(filter)]);


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
      // 1. Update Payment
      await orderAPI.updatePayment(orderId, paymentData);
      
      // 2. Automatically mark order as completed when paid from dashboard
      await orderAPI.updateStatus(orderId, { status: 'completed' });
      
      // 3. If it's a Dine-in order with a table, release the table
      const orderToUpdate = orders.find(o => o._id === orderId);
      if (orderToUpdate?.table?._id) {
        await tableAPI.updateStatus(orderToUpdate.table._id, { status: 'available' });
      }

      toast.success('Payment received and table released');
      fetchOrders();
      if (selectedOrder?._id === orderId) setShowModal(false);
    } catch { toast.error('Error updating payment'); }
  };


  const handleDelete = async () => {
    try {
      await orderAPI.deleteOrder(deleteId);
      toast.success('Order deleted');
      setDeleteId(null);
      fetchOrders();
    } catch { toast.error('Error deleting order'); }
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

  // Calculate Stats for Today
  const todayStats = orders.reduce((acc, order) => {
    const orderDate = new Date(order.createdAt).toDateString();
    const todayDate = new Date().toDateString();
    if (orderDate === todayDate) {
      acc.total++;
      if (order.status === 'pending') acc.pending++;
      acc.revenue += order.total || 0;
    }
    return acc;
  }, { total: 0, pending: 0, revenue: 0 });

  if (loading) return <LoadingSpinner size="lg" text="Loading orders..." />;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Monitor size={24} /></div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">All Time Total</p>
              <h3 className="text-2xl font-bold text-slate-800">{pagination.total || orders.length}</h3>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Clock size={24} /></div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Total</p>
              <h3 className="text-2xl font-bold text-slate-800">{todayStats.total}</h3>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Filter size={24} /></div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Pending</p>
              <h3 className="text-2xl font-bold text-slate-800">{todayStats.pending}</h3>
            </div>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Plus size={24} className="rotate-45" /></div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Today's Revenue</p>
              <h3 className="text-2xl font-bold text-slate-800">৳{todayStats.revenue.toLocaleString()}</h3>
            </div>
          </div>
        </motion.div>
      </div>


      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100">
        <div className="flex flex-wrap gap-2">
          {['', 'pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map(s => (
            <button key={s} onClick={() => setFilter({ ...filter, status: s, page: 1 })}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${filter.status === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-slate-50 text-slate-600 hover:bg-slate-100'}`}>
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Orders'}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={fetchOrders} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-slate-100 transition-all border border-slate-200 shadow-sm cursor-pointer" title="Refresh Data">
            <Search size={18} />
          </button>
          <button onClick={openCreateOrder} className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 cursor-pointer">
            <Plus size={18} /> New Order
          </button>
        </div>

      </div>


      {orders.length === 0 ? (
        <EmptyState title="No orders" description="No orders found matching your filter" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-12">SL</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Order Info</th>

                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Source & Type</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {orders.map((order, idx) => (
                  <motion.tr key={order._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }}
                    className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400">
                        {(((pagination.page || pagination.currentPage || filter.page || 1) - 1) * (pagination.limit || 10)) + idx + 1}
                      </span>
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{order.orderNo}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{new Date(order.createdAt).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`p-1 rounded-md ${order.orderSource === 'website' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                            {order.orderSource === 'website' ? <Globe size={10} /> : <Monitor size={10} />}
                          </span>
                          <span className="text-xs font-bold text-slate-700 capitalize">{order.orderType?.replace('_', ' ')}</span>
                        </div>
                        {order.table?.tableNo && <span className="text-[10px] font-bold text-indigo-600 ml-5">Table: {order.table.tableNo}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">৳{order.total?.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-400">{order.items?.length} Items</span>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4"><StatusBadge status={order.paymentStatus} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {(order.orderType === 'delivery' ? deliveryFlow : statusFlow)
                            .filter(s => statusFlow.indexOf(s) > statusFlow.indexOf(order.status) || deliveryFlow.indexOf(s) > deliveryFlow.indexOf(order.status))
                            .slice(0, 1)
                            .map(s => (
                              <button key={s} onClick={(e) => { e.stopPropagation(); handleStatusUpdate(order._id, s); }}
                                className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white text-[10px] font-bold transition-all uppercase">
                                {s.replace('_', ' ')}
                              </button>
                            ))}
                        </div>
                        <button onClick={() => { setSelectedOrder(order); setShowModal(true); }}
                          className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => setDeleteId(order._id)}
                          className="p-2 rounded-xl bg-slate-100 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - Hard Way Fix */}
          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Navigation</span>
              <span className="text-xs font-bold text-slate-600">
                Page {filter.page} {pagination.totalPages ? `of ${pagination.totalPages}` : ''}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                disabled={filter.page <= 1}
                onClick={() => setFilter(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all shadow-sm group"
              >
                <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
              </button>

              <div className="flex items-center flex-wrap gap-1.5 px-2">
                {Array.from({ length: pagination.totalPages || 1 }, (_, i) => i + 1).map((p) => (
                  <button 
                    key={p}
                    onClick={() => setFilter(prev => ({ ...prev, page: p }))}
                    className={`min-w-[36px] h-9 rounded-xl text-xs font-black transition-all transform active:scale-95 cursor-pointer ${filter.page === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 border-transparent' : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-400 hover:text-indigo-600'}`}
                  >
                    {p}
                  </button>
                ))}
              </div>



              <button 
                disabled={pagination.totalPages ? filter.page >= pagination.totalPages : orders.length < 10}
                onClick={() => setFilter(prev => ({ ...prev, page: prev.page + 1 }))}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-indigo-600 hover:text-white disabled:opacity-30 transition-all shadow-sm group"
              >
                <ArrowLeft size={16} className="rotate-180 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>

        </div>
      )}

      <ConfirmDialog 
        isOpen={!!deleteId} 
        onClose={() => setDeleteId(null)} 
        onConfirm={handleDelete} 
        title="Delete Order"
        message="Are you sure you want to delete this order? This action cannot be undone."
      />



      {/* Order Detail Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Order ${selectedOrder?.orderNo}`} size="lg">
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500">Status</p><StatusBadge status={selectedOrder.status} /></div>
              <div><p className="text-xs text-slate-500">Payment</p><StatusBadge status={selectedOrder.paymentStatus} /></div>
              <div><p className="text-xs text-slate-500">Type</p><p className="text-sm font-medium capitalize">{selectedOrder.orderType?.replace('_', ' ')}</p></div>
              <div><p className="text-xs text-slate-500">Source</p>
                <span className={`text-xs px-2 py-0.5 rounded-md font-medium inline-flex items-center gap-1 ${selectedOrder.orderSource === 'website' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'}`}>
                  {selectedOrder.orderSource === 'website' ? <Globe size={10} /> : <Monitor size={10} />}
                  {selectedOrder.orderSource === 'website' ? 'Online Order' : 'POS Order'}
                </span>
              </div>
              <div><p className="text-xs text-slate-500">Table</p><p className="text-sm font-medium">{selectedOrder.table?.tableNo || 'N/A'}</p></div>
            </div>
            <div>
              <h4 className="font-semibold text-sm mb-2">Items</h4>
              <div className="space-y-2">
                {selectedOrder.items?.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm bg-slate-50 dark:bg-slate-700/50 p-2 rounded-lg">
                    <span>{item.name} x{item.quantity}</span>
                    <span className="font-medium">৳{item.subtotal}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-1 text-sm">
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
                  className={`text-xs px-3 py-1.5 rounded-lg font-medium capitalize transition-all ${selectedOrder.status === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
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
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 text-left text-sm">
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
                  <div key={i} className="flex items-center justify-between bg-slate-50 p-2 rounded-lg text-sm">
                    <span className="flex-1">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <button type="button" onClick={() => setNewOrder(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, quantity: Math.max(1, it.quantity - 1), subtotal: Math.max(1, it.quantity - 1) * it.unitPrice } : it) }))} className="w-6 h-6 rounded bg-slate-200 text-sm">-</button>
                      <span className="font-medium">{item.quantity}</span>
                      <button type="button" onClick={() => setNewOrder(prev => ({ ...prev, items: prev.items.map((it, idx) => idx === i ? { ...it, quantity: it.quantity + 1, subtotal: (it.quantity + 1) * it.unitPrice } : it) }))} className="w-6 h-6 rounded bg-slate-200 text-sm">+</button>
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
