import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';


import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Users, Eye, ShoppingCart, User as UserIcon, Receipt, X, ChevronDown } from 'lucide-react';



import { tableAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const statusColors = { available: 'bg-emerald-100 border-emerald-300 text-emerald-700', occupied: 'bg-red-100 border-red-300 text-red-700', reserved: 'bg-blue-100 border-blue-300 text-blue-700', cleaning: 'bg-amber-100 border-amber-300 text-amber-700', out_of_service: 'bg-slate-100 border-gray-300 text-slate-500' };

const TablesPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTable, setEditTable] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ tableNo: '', capacity: '4', floor: 'Ground Floor', section: 'Indoor' });
  const [viewingOrder, setViewingOrder] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [fetchingOrder, setFetchingOrder] = useState(false);
  const [activeSection, setActiveSection] = useState('All');
  const [openStatusId, setOpenStatusId] = useState(null);
  const [activeOrdersMap, setActiveOrdersMap] = useState({});
  const dropdownRef = useRef(null);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpenStatusId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sections = ['All', 'Indoor', 'Outdoor', 'VIP', 'Rooftop'];




  const fetchTables = useCallback(async () => {
    try {
      const [{ data: tableRes }, { data: orderRes }] = await Promise.all([
        tableAPI.getTables(),
        api.get('/orders/active')
      ]);

      setTables(tableRes.data);

      // Map orders to table IDs
      const orderMap = {};
      (orderRes.data || []).forEach(order => {
        const tableId = order.table?._id || order.table;
        if (tableId) orderMap[tableId] = order;
      });
      setActiveOrdersMap(orderMap);

    } catch {
      toast.error('Error loading data');
    } finally {
      setLoading(false);
    }
  }, []);


  useEffect(() => {
    fetchTables();
    // Auto-refresh tables every 5 seconds for real-time status sync
    const interval = setInterval(fetchTables, 5000);
    return () => clearInterval(interval);
  }, [fetchTables]);


  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editTable) await tableAPI.updateTable(editTable._id, { ...form, capacity: Number(form.capacity) });
      else await tableAPI.createTable({ ...form, capacity: Number(form.capacity) });
      toast.success(editTable ? 'Table updated' : 'Table created');
      setShowModal(false); setEditTable(null); fetchTables();
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
  };

  const handleStatusChange = async (id, status) => {
    try { await tableAPI.updateStatus(id, { status }); fetchTables(); } catch { toast.error('Error'); }
  };

  const handleDelete = async () => {
    try { await tableAPI.deleteTable(deleteId); toast.success('Deleted'); fetchTables(); } catch { toast.error('Error'); }
  };

  const handleViewActiveOrder = (tableId) => {
    const order = activeOrdersMap[tableId];
    if (order) {
      setViewingOrder(order);
      setShowViewModal(true);
    } else {
      toast.error('No active order found for this table');
    }
  };




  if (loading) return <LoadingSpinner size="lg" text="Loading tables..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          {sections.map(sec => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${activeSection === sec ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white text-slate-500 border border-slate-200 hover:border-indigo-400 hover:text-indigo-600'}`}
            >
              {sec}
            </button>
          ))}
          <div className="h-6 w-px bg-slate-200 mx-2 hidden sm:block" />
          <div className="flex gap-4 text-xs font-bold uppercase tracking-tighter">
            {Object.entries({
              available: tables.filter(t => t.status === 'available').length,
              occupied: tables.filter(t => t.status === 'occupied').length
            }).map(([status, count]) => (
              <span key={status} className="flex items-center gap-1.5 cursor-pointer hover:opacity-80 transition-opacity">
                <span className={`w-2.5 h-2.5 rounded-full ${status === 'available' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-slate-600">{status}: {count}</span>
              </span>
            ))}
          </div>
        </div>
        <button onClick={() => { setForm({ tableNo: '', capacity: '4', floor: 'Ground Floor', section: 'Indoor' }); setEditTable(null); setShowModal(true); }}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2 self-start md:self-auto cursor-pointer active:scale-95">
          <Plus size={16} /> Add Table
        </button>
      </div>



      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables
          .filter(t => activeSection === 'All' || t.section === activeSection)
          .map((table, idx) => (
            <motion.div key={table._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.02 }}
              className={`relative rounded-3xl border-1 p-5 text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${statusColors[table.status]} shadow-sm ${openStatusId === table._id ? 'z-40' : 'z-0'}`}>



              <div className="mb-1">
                <h3 className="text-3xl font-bold tracking-tighter leading-none">{table.tableNo}</h3>
                <p className="text-[10px] font-bold text-slate-500/60 uppercase tracking-widest mt-1 cursor-pointer hover:text-indigo-600 transition-colors" title="Table Section">
                  {table.section}
                </p>
              </div>


              {table.status === 'occupied' ? (
                <div className="my-4 py-2 bg-white/40 rounded-2xl border border-white/60 backdrop-blur-sm">
                  <p className="text-[10px] font-bold text-red-600 uppercase  mb-0.5">Ongoing Order</p>

                </div>
              ) : (
                <div className="my-4 flex items-center justify-center gap-2 text-xs font-bold text-slate-500/80">
                  <span className="flex items-center gap-1 bg-white/40 px-2 py-1 rounded-lg"><Users size={14} />{table.capacity} Max</span>
                </div>
              )}

              <div className="relative mb-5 px-2" ref={openStatusId === table._id ? dropdownRef : null}>
                <button
                  onClick={(e) => { e.stopPropagation(); setOpenStatusId(openStatusId === table._id ? null : table._id); }}
                  className="w-full py-3 px-4 bg-white/60 rounded-2xl border-0 ring-1 ring-slate-200 flex items-center justify-between hover:bg-white transition-all cursor-pointer shadow-sm active:scale-95"
                >
                  <span className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${table.status === 'available' ? 'bg-emerald-500' : table.status === 'occupied' ? 'bg-red-500' : 'bg-amber-500'}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-700">{table.status.replace('_', ' ')}</span>
                  </span>
                  <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${openStatusId === table._id ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {openStatusId === table._id && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -5 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -5 }}
                      className="absolute left-2 right-2 top-full mt-2 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 p-2 z-50 overflow-hidden"
                    >
                      {['available', 'occupied', 'reserved', 'cleaning', 'out_of_service'].map((s) => (
                        <button
                          key={s}
                          onClick={() => { handleStatusChange(table._id, s); setOpenStatusId(null); }}
                          className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all mb-1 last:mb-0 flex items-center gap-2 cursor-pointer ${table.status === s ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${s === 'available' ? (table.status === s ? 'bg-white' : 'bg-emerald-500') : s === 'occupied' ? (table.status === s ? 'bg-white' : 'bg-red-500') : (table.status === s ? 'bg-white' : 'bg-amber-500')}`} />
                          {s.replace('_', ' ')}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>




              <div className="flex justify-center gap-2">
                {table.status === 'occupied' && (
                  <button
                    onClick={() => handleViewActiveOrder(table._id)}
                    disabled={fetchingOrder}
                    className="p-2.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-90 cursor-pointer"
                    title="View Running Order"
                  >
                    <Eye size={16} />
                  </button>
                )}
                <button onClick={() => { setEditTable(table); setForm({ tableNo: table.tableNo, capacity: table.capacity, floor: table.floor, section: table.section }); setShowModal(true); }}
                  className="p-2.5 rounded-xl bg-white/60 text-slate-600 hover:bg-white shadow-sm transition-all active:scale-90 cursor-pointer">
                  <Edit2 size={16} />
                </button>
                <button onClick={() => setDeleteId(table._id)}
                  className="p-2.5 rounded-xl bg-white/60 text-red-500 hover:bg-red-50 shadow-sm transition-all active:scale-90 cursor-pointer">
                  <Trash2 size={16} />
                </button>
              </div>
            </motion.div>
          ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditTable(null); }} title={editTable ? 'Edit Table' : 'Add Table'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Table No *</label><input value={form.tableNo} onChange={(e) => setForm({ ...form, tableNo: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" required placeholder="T-01" /></div>
          <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Capacity *</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" required min="1" /></div>
          <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Floor</label><input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 placeholder:text-slate-300 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" /></div>
          <div><label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1.5">Section</label>
            <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full px-4 py-3 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 focus:ring-2 focus:ring-indigo-100 outline-none transition-all cursor-pointer">
              <option value="Indoor">Indoor</option><option value="Outdoor">Outdoor</option><option value="VIP">VIP</option><option value="Rooftop">Rooftop</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-dashed">
            <button type="button" onClick={() => setShowModal(false)} className="px-6 py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all cursor-pointer">Cancel</button>
            <button type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all cursor-pointer active:scale-95">{editTable ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>


      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />

      {/* View Running Order Modal - Simple Invoice Style */}
      <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Active Order Summary" size="md">
        <div className="min-h-[300px] flex flex-col font-sans">
          <AnimatePresence mode="wait">
            {fetchingOrder ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center space-y-3 py-20"
              >
                <div className="w-10 h-10 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Loading Order...</p>
              </motion.div>
            ) : viewingOrder ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="animate-in fade-in duration-500"
              >
                {/* Invoice Top: Order & Customer Side-by-Side */}
                <div className="flex justify-between items-start border-b border-dashed border-slate-200 pb-5 mb-5 px-1">
                  <div>
                    <div className="inline-block px-2 py-0.5 bg-red-100 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded mb-2">
                      Ongoing Order
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 uppercase tracking-tighter">Order: {viewingOrder.orderNo}</h3>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                      Time: {new Date(viewingOrder.createdAt).toLocaleTimeString()}
                    </p>
                    <p className="text-[10px] font-bold text-indigo-600 uppercase italic mt-1">Dine In Service</p>
                  </div>
                  <div className="text-right border-l border-slate-100 pl-6">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Customer Details</p>
                    <p className="text-sm font-bold text-slate-800">{viewingOrder.customerInfo?.name || 'Guest Customer'}</p>
                    <p className="text-xs font-bold text-slate-500 mt-0.5">{viewingOrder.customerInfo?.phone || 'No Phone Data'}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase mt-2">{viewingOrder.items?.length || 0} items in cart</p>
                  </div>
                </div>

                {/* Bill Table */}
                <div className="mb-6">
                  <div className="flex items-center text-[10px] font-bold text-slate-500 uppercase tracking-widest border-b border-slate-200 pb-2 px-2">
                    <span className="flex-1">Item Description</span>
                    <span className="w-16 text-center">Qty</span>
                    <span className="w-20 text-right">Amount</span>
                  </div>
                  <div className="max-h-[250px] overflow-y-auto custom-scrollbar">
                    {viewingOrder.items?.map((item, i) => (
                      <div key={i} className="flex items-center py-3 px-2 border-b border-slate-50 last:border-0">
                        <div className="flex-1">
                          <p className="text-sm font-bold text-slate-800">{item.name}</p>
                          {item.variant && <p className="text-[11px] text-slate-500 italic mt-0.5">{item.variant}</p>}
                        </div>
                        <p className="w-16 text-center text-sm font-bold text-slate-600">x{item.quantity}</p>
                        <p className="w-20 text-right text-sm font-bold text-slate-900">৳{item.subtotal}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total Section - Simple & Clean */}
                <div className="pt-4 mt-2 border-t-2 border-slate-900 border-dotted px-2 mb-6">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Total Bill</p>
                    <p className="text-3xl font-bold text-slate-900 tracking-tighter">৳{viewingOrder.total?.toLocaleString()}</p>
                  </div>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 text-right  ">* Including all taxes & service charges</p>
                </div>

                <button
                  onClick={() => setShowViewModal(false)}
                  className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-sm   uppercase  hover:bg-indigo-700 transition-all active:scale-95 cursor-pointer shadow-lg shadow-indigo-100"
                >
                  Close Bill Summary
                </button>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </Modal>
    </div>
  );
};

export default TablesPage;


