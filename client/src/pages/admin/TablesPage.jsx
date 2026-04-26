import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
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

  const fetchTables = useCallback(async () => {
    try { const { data } = await tableAPI.getTables(); setTables(data.data); } catch { toast.error('Error loading tables'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTables(); }, [fetchTables]);

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

  if (loading) return <LoadingSpinner size="lg" text="Loading tables..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-4 text-sm">
          {Object.entries({ available: tables.filter(t => t.status === 'available').length, occupied: tables.filter(t => t.status === 'occupied').length, reserved: tables.filter(t => t.status === 'reserved').length }).map(([status, count]) => (
            <span key={status} className="flex items-center gap-1.5">
              <span className={`w-3 h-3 rounded-full ${status === 'available' ? 'bg-emerald-500' : status === 'occupied' ? 'bg-red-500' : 'bg-blue-500'}`} />
              <span className="capitalize text-slate-600">{status}: {count}</span>
            </span>
          ))}
        </div>
        <button onClick={() => { setForm({ tableNo: '', capacity: '4', floor: 'Ground Floor', section: 'Indoor' }); setEditTable(null); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2">
          <Plus size={16} /> Add Table
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {tables.map((table, idx) => (
          <motion.div key={table._id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.03 }}
            className={`rounded-2xl border-2 p-4 text-center ${statusColors[table.status]}`}>
            <h3 className="text-xl font-bold mb-1">{table.tableNo}</h3>
            <div className="flex items-center justify-center gap-1 text-sm mb-2"><Users size={14} />{table.capacity}</div>
            <p className="text-xs opacity-70 mb-3">{table.section} • {table.floor}</p>
            <select value={table.status} onChange={(e) => handleStatusChange(table._id, e.target.value)} className="w-full text-xs rounded-lg border-0 bg-white/50 py-1 mb-2 capitalize">
              {['available', 'occupied', 'reserved', 'cleaning', 'out_of_service'].map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
            <div className="flex justify-center gap-1">
              <button onClick={() => { setEditTable(table); setForm({ tableNo: table.tableNo, capacity: table.capacity, floor: table.floor, section: table.section }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-white/50"><Edit2 size={12} /></button>
              <button onClick={() => setDeleteId(table._id)} className="p-1.5 rounded-lg hover:bg-white/50 text-red-500"><Trash2 size={12} /></button>
            </div>
          </motion.div>
        ))}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditTable(null); }} title={editTable ? 'Edit Table' : 'Add Table'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Table No *</label><input value={form.tableNo} onChange={(e) => setForm({ ...form, tableNo: e.target.value })} className="input-field" required placeholder="T-01" /></div>
          <div><label className="block text-sm font-medium mb-1">Capacity *</label><input type="number" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: e.target.value })} className="input-field" required min="1" /></div>
          <div><label className="block text-sm font-medium mb-1">Floor</label><input value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Section</label>
            <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="input-field">
              <option value="Indoor">Indoor</option><option value="Outdoor">Outdoor</option><option value="VIP">VIP</option><option value="Rooftop">Rooftop</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editTable ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default TablesPage;
