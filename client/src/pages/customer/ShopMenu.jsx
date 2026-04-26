import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, ShoppingCart, Filter } from 'lucide-react';
import { shopAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const ShopMenu = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const { addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes] = await Promise.all([
          shopAPI.getMenu({ category: selectedCategory, search }),
          shopAPI.getCategories()
        ]);
        setItems(menuRes.data.data || []);
        setCategories(catRes.data.data || []);
      } catch { console.error('Error loading menu'); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [selectedCategory, search]);

  const handleAddToCart = (item) => {
    addItem({ _id: item._id, name: item.name, price: item.price, image: item.image });
    toast.success(`${item.name} added to cart`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">Our Menu</h1>
        <p className="text-gray-500">Discover our wide range of delicious dishes</p>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} className="w-full px-4 py-3 pl-11 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm" placeholder="Search dishes..." />
        </div>
      </div>

      {/* Categories */}
      <div className="flex overflow-x-auto gap-2 pb-4 mb-6 scrollbar-hide">
        <button onClick={() => setSelectedCategory('')}
          className={`px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${!selectedCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat._id} onClick={() => setSelectedCategory(cat._id)}
            className={`px-5 py-2.5 rounded-2xl text-sm font-medium whitespace-nowrap transition-all ${selectedCategory === cat._id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner size="lg" text="Loading menu..." /> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.filter(i => i.isAvailable).map((item, idx) => (
            <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-gray-100">
              <Link to={`/menu/${item._id}`} className="block">
                <div className="relative h-48 overflow-hidden">
                  <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  {item.tags?.includes('bestseller') && <span className="absolute top-3 left-3 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded-lg">BESTSELLER</span>}
                  {item.tags?.includes('spicy') && <span className="absolute top-3 right-3 text-lg">🌶️</span>}
                </div>
              </Link>
              <div className="p-4">
                <Link to={`/menu/${item._id}`}>
                  <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                  {item.nameBn && <p className="text-xs text-gray-400 mb-1">{item.nameBn}</p>}
                </Link>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center gap-3 mb-3 text-sm">
                  <div className="flex items-center gap-1"><Star size={14} className="text-amber-400 fill-amber-400" /><span className="font-medium">{item.rating || 0}</span></div>
                  <div className="flex items-center gap-1 text-gray-400"><Clock size={14} />{item.preparationTime || 15} min</div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-indigo-600">৳{item.price}</span>
                    {item.discountPrice > 0 && <span className="text-sm text-gray-400 line-through ml-1">৳{item.discountPrice}</span>}
                  </div>
                  <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.preventDefault(); handleAddToCart(item); }}
                    className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 transition-all">
                    <ShoppingCart size={16} />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {!loading && items.filter(i => i.isAvailable).length === 0 && (
        <div className="text-center py-20">
          <p className="text-xl text-gray-400">No dishes found</p>
          <p className="text-sm text-gray-300 mt-1">Try a different search or category</p>
        </div>
      )}
    </div>
  );
};

export default ShopMenu;
