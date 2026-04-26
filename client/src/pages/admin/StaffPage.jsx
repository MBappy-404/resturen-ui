import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Calendar, Award } from 'lucide-react';
import { staffAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import StatusBadge from '../../components/ui/StatusBadge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const StaffPage = () => {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editStaff, setEditStaff] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'staff', position: 'waiter', department: 'service', shift: 'full_day', salary: '' });

  const fetchStaff = useCallback(async () => {
    try { const { data } = await staffAPI.getStaff(); setStaff(data.data); } catch { toast.error('Error'); } finally { setLoading(false); }
  }, []);
  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editStaff) await staffAPI.updateStaff(editStaff._id, { ...form, salary: Number(form.salary) });
      else await staffAPI.createStaff({ ...form, salary: Number(form.salary) });
      toast.success(editStaff ? 'Updated' : 'Created');
      setShowModal(false); setEditStaff(null); fetchStaff();
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => { try { await staffAPI.deleteStaff(deleteId); toast.success('Removed'); fetchStaff(); } catch { toast.error('Error'); } };

  if (loading) return <LoadingSpinner size="lg" text="Loading staff..." />;

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button onClick={() => { setForm({ name: '', email: '', phone: '', password: '', role: 'staff', position: 'waiter', department: 'service', shift: 'full_day', salary: '' }); setEditStaff(null); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Add Staff</button>
      </div>

      {staff.length === 0 ? <EmptyState title="No staff members" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {staff.map((s, idx) => (
            <motion.div key={s._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    {s.user?.name?.[0] || 'S'}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 dark:text-white">{s.user?.name}</h4>
                    <p className="text-xs text-gray-500">{s.employeeId} • {s.user?.email}</p>
                  </div>
                </div>
                <StatusBadge status={s.user?.isActive ? 'active' : 'inactive'} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div><span className="text-gray-400 text-xs">Position</span><p className="capitalize font-medium">{s.position?.replace('_', ' ')}</p></div>
                <div><span className="text-gray-400 text-xs">Department</span><p className="capitalize font-medium">{s.department}</p></div>
                <div><span className="text-gray-400 text-xs">Shift</span><p className="capitalize font-medium">{s.shift?.replace('_', ' ')}</p></div>
                <div><span className="text-gray-400 text-xs">Salary</span><p className="font-medium">৳{s.salary?.toLocaleString()}</p></div>
              </div>
              <div className="flex justify-end gap-1 pt-3 border-t border-gray-100">
                <button onClick={() => { setEditStaff(s); setForm({ name: s.user?.name, email: s.user?.email, phone: s.user?.phone || '', role: s.user?.role, position: s.position, department: s.department, shift: s.shift, salary: s.salary }); setShowModal(true); }} className="p-2 rounded-lg hover:bg-gray-100"><Edit2 size={14} className="text-blue-500" /></button>
                <button onClick={() => setDeleteId(s._id)} className="p-2 rounded-lg hover:bg-gray-100"><Trash2 size={14} className="text-red-400" /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditStaff(null); }} title={editStaff ? 'Edit Staff' : 'Add Staff'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
            {!editStaff && <div><label className="block text-sm font-medium mb-1">Password</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input-field" placeholder="Default: password123" /></div>}
            <div><label className="block text-sm font-medium mb-1">Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="input-field">
                <option value="staff">Staff</option><option value="manager">Manager</option><option value="kitchen">Kitchen</option><option value="admin">Admin</option>
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Position</label>
              <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className="input-field">
                {['manager', 'chef', 'head_chef', 'sous_chef', 'waiter', 'cashier', 'cleaner', 'delivery_boy', 'host'].map(p => <option key={p} value={p}>{p.replace('_', ' ')}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Department</label>
              <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="input-field">
                {['kitchen', 'service', 'management', 'delivery', 'maintenance'].map(d => <option key={d} value={d}>{d}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Salary</label><input type="number" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editStaff ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default StaffPage;
