import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Edit2, Trash2, Eye, EyeOff, Star, Tag } from 'lucide-react';
import { menuAPI } from '../../services/api';
import Modal from '../../components/ui/Modal';
import StatusBadge from '../../components/ui/StatusBadge';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import toast from 'react-hot-toast';

const MenuPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editCategory, setEditCategory] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ name: '', nameBn: '', description: '', price: '', discountPrice: '', category: '', image: '', tags: [], isAvailable: true, isFeatured: false, preparationTime: '15', variants: [], addons: [] });
  const [catForm, setCatForm] = useState({ name: '', nameBn: '', description: '', icon: 'utensils' });

  const fetchData = useCallback(async () => {
    try {
      const [catRes, itemRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getItems({ category: selectedCategory, search })
      ]);
      setCategories(catRes.data.data);
      setItems(itemRes.data.data);
    } catch (error) {
      toast.error('Failed to load menu data');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, search]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSaveItem = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, price: Number(form.price), discountPrice: Number(form.discountPrice) || 0, preparationTime: Number(form.preparationTime) };
      if (editItem) {
        await menuAPI.updateItem(editItem._id, payload);
        toast.success('Item updated');
      } else {
        await menuAPI.createItem(payload);
        toast.success('Item created');
      }
      setShowModal(false);
      setEditItem(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving item');
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editCategory) {
        await menuAPI.updateCategory(editCategory._id, catForm);
        toast.success('Category updated');
      } else {
        await menuAPI.createCategory(catForm);
        toast.success('Category created');
      }
      setShowCategoryModal(false);
      setEditCategory(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving category');
    }
  };

  const handleDelete = async () => {
    try {
      if (deleteTarget.type === 'item') await menuAPI.deleteItem(deleteTarget.id);
      else await menuAPI.deleteCategory(deleteTarget.id);
      toast.success('Deleted successfully');
      fetchData();
    } catch (error) {
      toast.error('Error deleting');
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await menuAPI.toggleAvailability(id);
      fetchData();
    } catch (error) {
      toast.error('Error toggling availability');
    }
  };

  const toggleFeatured = async (id) => {
    try {
      await menuAPI.toggleFeatured(id);
      fetchData();
    } catch (error) {
      toast.error('Error toggling featured');
    }
  };

  const openEditItem = (item) => {
    setEditItem(item);
    setForm({
      name: item.name, nameBn: item.nameBn || '', description: item.description || '', price: item.price,
      discountPrice: item.discountPrice || '', category: item.category?._id || item.category, image: item.image || '',
      tags: item.tags || [], isAvailable: item.isAvailable, isFeatured: item.isFeatured,
      preparationTime: item.preparationTime || '15', variants: item.variants || [], addons: item.addons || []
    });
    setShowModal(true);
  };

  const tagOptions = ['bestseller', 'new', 'spicy', 'vegetarian', 'halal', 'chef_special', 'popular'];

  if (loading) return <LoadingSpinner size="lg" text="Loading menu..." />;

  return (
    <div className="space-y-6">
      {/* Categories */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800 dark:text-white">Categories</h3>
          <button onClick={() => { setCatForm({ name: '', nameBn: '', description: '', icon: 'utensils' }); setEditCategory(null); setShowCategoryModal(true); }} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Add Category
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setSelectedCategory('')} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setSelectedCategory(cat._id)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${selectedCategory === cat._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300'}`}>
              {cat.name}
              <span className="text-xs opacity-70">({items.filter(i => (i.category?._id || i.category) === cat._id).length})</span>
              <button onClick={(e) => { e.stopPropagation(); setEditCategory(cat); setCatForm({ name: cat.name, nameBn: cat.nameBn, description: cat.description, icon: cat.icon }); setShowCategoryModal(true); }} className="opacity-60 hover:opacity-100"><Edit2 size={12} /></button>
            </button>
          ))}
        </div>
      </div>

      {/* Menu Items */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-10 text-sm" placeholder="Search menu items..." />
          </div>
          <button onClick={() => { setForm({ name: '', nameBn: '', description: '', price: '', discountPrice: '', category: categories[0]?._id || '', image: '', tags: [], isAvailable: true, isFeatured: false, preparationTime: '15', variants: [], addons: [] }); setEditItem(null); setShowModal(true); }} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Add Item
          </button>
        </div>

        {items.length === 0 ? (
          <EmptyState title="No menu items" description="Add your first menu item to get started" />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {items.map((item, idx) => (
              <motion.div key={item._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }} className="card overflow-hidden group">
                <div className="relative h-44 bg-slate-100 overflow-hidden">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">No Image</div>
                  )}
                  <div className="absolute top-2 right-2 flex gap-1">
                    {item.isFeatured && <span className="badge badge-warning"><Star size={10} className="mr-1" />Featured</span>}
                    {!item.isAvailable && <span className="badge badge-danger">Unavailable</span>}
                  </div>
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {item.tags?.map(tag => <span key={tag} className="badge badge-purple text-[10px]">{tag}</span>)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-800 dark:text-white">{item.name}</h4>
                      {item.nameBn && <p className="text-xs text-slate-400">{item.nameBn}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-indigo-600">৳{item.price}</p>
                      {item.discountPrice > 0 && <p className="text-xs text-slate-400 line-through">৳{item.discountPrice}</p>}
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1 text-xs text-slate-400">
                      <Star size={12} className="text-amber-400 fill-amber-400" />
                      {item.rating || 0} ({item.reviewCount || 0})
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => toggleAvailability(item._id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Toggle availability">
                        {item.isAvailable ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-red-400" />}
                      </button>
                      <button onClick={() => toggleFeatured(item._id)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700" title="Toggle featured">
                        <Star size={14} className={item.isFeatured ? 'text-amber-400 fill-amber-400' : 'text-slate-400'} />
                      </button>
                      <button onClick={() => openEditItem(item)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Edit2 size={14} className="text-blue-500" /></button>
                      <button onClick={() => setDeleteTarget({ type: 'item', id: item._id })} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"><Trash2 size={14} className="text-red-400" /></button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Item Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Edit Item' : 'Add Item'} size="lg">
        <form onSubmit={handleSaveItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Name (Bangla)</label>
              <input value={form.nameBn} onChange={(e) => setForm({ ...form, nameBn: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Price *</label>
              <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Discount Price</label>
              <input type="number" value={form.discountPrice} onChange={(e) => setForm({ ...form, discountPrice: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category *</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field" required>
                <option value="">Select</option>
                {categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prep Time (min)</label>
              <input type="number" value={form.preparationTime} onChange={(e) => setForm({ ...form, preparationTime: e.target.value })} className="input-field" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field" rows={2} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
            <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} className="input-field" placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Tags</label>
            <div className="flex flex-wrap gap-2">
              {tagOptions.map(tag => (
                <button key={tag} type="button" onClick={() => setForm({ ...form, tags: form.tags.includes(tag) ? form.tags.filter(t => t !== tag) : [...form.tags, tag] })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${form.tags.includes(tag) ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Available</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
              <span className="text-sm text-slate-700 dark:text-slate-300">Featured</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editItem ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showCategoryModal} onClose={() => { setShowCategoryModal(false); setEditCategory(null); }} title={editCategory ? 'Edit Category' : 'Add Category'} size="sm">
        <form onSubmit={handleSaveCategory} className="space-y-4">
          <div><label className="block text-sm font-medium mb-1">Name *</label><input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input-field" required /></div>
          <div><label className="block text-sm font-medium mb-1">Name (Bangla)</label><input value={catForm.nameBn} onChange={(e) => setCatForm({ ...catForm, nameBn: e.target.value })} className="input-field" /></div>
          <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input-field" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button type="button" onClick={() => setShowCategoryModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">{editCategory ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} title="Delete Item" message="Are you sure? This action cannot be undone." />
    </div>
  );
};

export default MenuPage;
