import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, ShoppingBag } from 'lucide-react';
import { customerAdminAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '', notes: '' });

  const fetchCustomers = useCallback(async () => {
    try { const { data } = await customerAdminAPI.getCustomers({ search }); setCustomers(data.data); } catch { toast.error('Error'); } finally { setLoading(false); }
  }, [search]);
  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editCustomer) await customerAdminAPI.updateCustomer(editCustomer._id, form);
      else await customerAdminAPI.createCustomer(form);
      toast.success(editCustomer ? 'Updated' : 'Created'); setShowModal(false); setEditCustomer(null); fetchCustomers();
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
  };

  const handleDelete = async () => { try { await customerAdminAPI.deleteCustomer(deleteId); toast.success('Deleted'); fetchCustomers(); } catch { toast.error('Error'); } };

  if (loading) return <LoadingSpinner size="lg" text="Loading..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="relative max-w-xs w-full"><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 text-sm" placeholder="Search customers..." /></div>
        <button onClick={() => { setForm({ name: '', phone: '', email: '', address: '', notes: '' }); setEditCustomer(null); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Add Customer</button>
      </div>

      {customers.length === 0 ? <EmptyState title="No customers" /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {customers.map((c, idx) => (
            <motion.div key={c._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="card p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">{c.name?.[0]}</div>
                  <div><h4 className="font-semibold">{c.name}</h4><p className="text-xs text-gray-500">{c.phone}</p></div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditCustomer(c); setForm({ name: c.name, phone: c.phone, email: c.email, address: c.address, notes: c.notes }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit2 size={14} className="text-blue-500" /></button>
                  <button onClick={() => setDeleteId(c._id)} className="p-1.5 rounded-lg hover:bg-gray-100"><Trash2 size={14} className="text-red-400" /></button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center"><p className="text-lg font-bold text-indigo-600">{c.totalOrders || 0}</p><p className="text-xs text-gray-500">Orders</p></div>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-2 text-center"><p className="text-lg font-bold text-emerald-600">৳{(c.totalSpent || 0).toLocaleString()}</p><p className="text-xs text-gray-500">Spent</p></div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editCustomer ? 'Edit Customer' : 'Add Customer'} size="sm">
        <form onSubmit={handleSave} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Phone</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Address</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editCustomer ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default CustomersPage;
