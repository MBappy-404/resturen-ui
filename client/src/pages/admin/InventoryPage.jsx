import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, AlertTriangle, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { inventoryAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const InventoryPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [stockItem, setStockItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', category: 'raw_materials', unit: 'kg', currentStock: '', minimumStock: '10', costPerUnit: '', supplier: { name: '', phone: '' } });
  const [stockForm, setStockForm] = useState({ type: 'added', quantity: '', note: '' });

  const fetchItems = useCallback(async () => {
    try { const { data } = await inventoryAPI.getInventory({ search }); setItems(data.data); } catch { toast.error('Error'); } finally { setLoading(false); }
  }, [search]);
  useEffect(() => { fetchItems(); }, [fetchItems]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, currentStock: Number(form.currentStock), minimumStock: Number(form.minimumStock), costPerUnit: Number(form.costPerUnit) };
      if (editItem) await inventoryAPI.updateItem(editItem._id, payload);
      else await inventoryAPI.createItem(payload);
      toast.success(editItem ? 'Updated' : 'Created'); setShowModal(false); setEditItem(null); fetchItems();
    } catch (error) { toast.error(error.response?.data?.message || 'Error'); }
  };

  const handleStockUpdate = async (e) => {
    e.preventDefault();
    try {
      await inventoryAPI.updateStock(stockItem._id, { ...stockForm, quantity: Number(stockForm.quantity) });
      toast.success('Stock updated'); setShowStockModal(false); fetchItems();
    } catch { toast.error('Error'); }
  };

  const handleDelete = async () => { try { await inventoryAPI.deleteItem(deleteId); toast.success('Deleted'); fetchItems(); } catch { toast.error('Error'); } };

  const lowStockCount = items.filter(i => i.currentStock <= i.minimumStock).length;

  if (loading) return <LoadingSpinner size="lg" text="Loading inventory..." />;

  return (
    <div className="space-y-6">
      {lowStockCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-amber-500" size={20} />
          <span className="text-amber-700 font-medium">{lowStockCount} items are running low on stock!</span>
        </motion.div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field max-w-xs text-sm" placeholder="Search inventory..." />
        <button onClick={() => { setForm({ name: '', category: 'raw_materials', unit: 'kg', currentStock: '', minimumStock: '10', costPerUnit: '', supplier: { name: '', phone: '' } }); setEditItem(null); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2"><Plus size={16} /> Add Item</button>
      </div>

      {items.length === 0 ? <EmptyState icon={Package} title="No inventory items" /> : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead><tr className="border-b border-gray-100 bg-gray-50">
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Item</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Category</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Stock</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Cost/Unit</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Value</th>
              <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
              <th className="text-right py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
            </tr></thead>
            <tbody>
              {items.map((item, idx) => {
                const isLow = item.currentStock <= item.minimumStock;
                return (
                  <motion.tr key={item._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.02 }} className="border-b border-gray-50 hover:bg-gray-50/50">
                    <td className="py-3 px-4"><p className="font-medium text-sm">{item.name}</p><p className="text-xs text-gray-400">{item.sku || '-'}</p></td>
                    <td className="py-3 px-4 text-sm text-gray-600 capitalize">{item.category?.replace('_', ' ')}</td>
                    <td className="py-3 px-4"><span className={`font-semibold text-sm ${isLow ? 'text-red-500' : 'text-gray-800'}`}>{item.currentStock} {item.unit}</span><p className="text-xs text-gray-400">Min: {item.minimumStock}</p></td>
                    <td className="py-3 px-4 text-sm">৳{item.costPerUnit}</td>
                    <td className="py-3 px-4 text-sm font-medium">৳{(item.currentStock * item.costPerUnit).toLocaleString()}</td>
                    <td className="py-3 px-4">{isLow ? <span className="badge badge-danger"><AlertTriangle size={10} className="mr-1" />Low</span> : <span className="badge badge-success">OK</span>}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => { setStockItem(item); setStockForm({ type: 'added', quantity: '', note: '' }); setShowStockModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100" title="Update Stock"><TrendingUp size={14} className="text-emerald-500" /></button>
                        <button onClick={() => { setEditItem(item); setForm({ name: item.name, category: item.category, unit: item.unit, currentStock: item.currentStock, minimumStock: item.minimumStock, costPerUnit: item.costPerUnit, supplier: item.supplier || { name: '', phone: '' } }); setShowModal(true); }} className="p-1.5 rounded-lg hover:bg-gray-100"><Edit2 size={14} className="text-blue-500" /></button>
                        <button onClick={() => setDeleteId(item._id)} className="p-1.5 rounded-lg hover:bg-gray-100"><Trash2 size={14} className="text-red-400" /></button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Item' : 'Add Item'} size="md">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
            <div><label className="block text-sm font-medium mb-1">Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                {['raw_materials', 'beverages', 'packaging', 'cleaning', 'equipment', 'spices', 'dairy', 'meat', 'vegetables'].map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Unit</label>
              <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input-field">
                {['kg', 'g', 'l', 'ml', 'piece', 'box', 'packet', 'dozen', 'bag'].map(u => <option key={u} value={u}>{u}</option>)}
              </select></div>
            <div><label className="block text-sm font-medium mb-1">Current Stock</label><input type="number" value={form.currentStock} onChange={(e) => setForm({ ...form, currentStock: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Min Stock</label><input type="number" value={form.minimumStock} onChange={(e) => setForm({ ...form, minimumStock: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Cost/Unit (৳)</label><input type="number" value={form.costPerUnit} onChange={(e) => setForm({ ...form, costPerUnit: e.target.value })} className="input-field" /></div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">{editItem ? 'Update' : 'Create'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={showStockModal} onClose={() => setShowStockModal(false)} title={`Update Stock: ${stockItem?.name}`} size="sm">
        <form onSubmit={handleStockUpdate} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Type</label>
            <select value={stockForm.type} onChange={(e) => setStockForm({ ...stockForm, type: e.target.value })} className="input-field">
              <option value="added">Add Stock</option><option value="used">Used</option><option value="wasted">Wasted</option><option value="returned">Returned</option><option value="adjusted">Adjust</option>
            </select></div>
          <div><label className="block text-sm font-medium mb-1">Quantity *</label><input type="number" value={stockForm.quantity} onChange={(e) => setStockForm({ ...stockForm, quantity: e.target.value })} className="input-field" required min="1" /></div>
          <div><label className="block text-sm font-medium mb-1">Note</label><input value={stockForm.note} onChange={(e) => setStockForm({ ...stockForm, note: e.target.value })} className="input-field" /></div>
          <div className="flex justify-end gap-3 pt-4 border-t"><button type="button" onClick={() => setShowStockModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary">Update</button></div>
        </form>
      </Modal>
      <ConfirmDialog isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} />
    </div>
  );
};

export default InventoryPage;
