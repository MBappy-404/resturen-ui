import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Star, Clock, ShoppingCart, UtensilsCrossed } from 'lucide-react';
import { shopAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 250, damping: 22 } } };

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
        const menuData = menuRes.data.data;
        setItems(Array.isArray(menuData) ? menuData : menuData?.items || []);
        const catData = catRes.data.data;
        setCategories(Array.isArray(catData) ? catData : catData?.categories || []);
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
    <div className="pt-20 pb-12">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-16 mb-10 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1920')] bg-cover bg-center opacity-10" />
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 text-center text-white">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider mb-4">
              <UtensilsCrossed size={14} />
              Explore Our Menu
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-3">Our Menu</h1>
            <p className="text-indigo-100 max-w-md mx-auto">Discover our wide range of delicious dishes prepared with love</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-lg">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-3.5 pl-11 rounded-2xl bg-white border-1.5 border-slate-200 focus:outline-none focus:ring-3 focus:ring-indigo-500/10 focus:border-indigo-400 text-sm shadow-sm transition-all placeholder:text-slate-400"
              placeholder="Search dishes..." />
          </div>
        </div>

        {/* Categories */}
        <div className="flex overflow-x-auto gap-2 pb-4 mb-8 scrollbar-hide">
          <button onClick={() => setSelectedCategory('')}
            className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            All
          </button>
          {categories.map(cat => (
            <button key={cat._id} onClick={() => setSelectedCategory(cat._id)}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedCategory === cat._id ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/20' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner size="lg" text="Loading menu..." /> : (
          <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.filter(i => i.isAvailable).map((item) => (
              <motion.div key={item._id} variants={fadeUp}
                className="bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group border border-slate-100 shadow-sm">
                <Link to={`/menu/${item._id}`} className="block">
                  <div className="relative h-52 overflow-hidden">
                    <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    {item.tags?.includes('bestseller') && (
                      <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow">Bestseller</span>
                    )}
                    {item.tags?.includes('spicy') && <span className="absolute top-3 right-3 text-lg">🌶️</span>}
                  </div>
                </Link>
                <div className="p-4">
                  <Link to={`/menu/${item._id}`}>
                    <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                  </Link>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3 leading-relaxed">{item.description}</p>
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    <div className="flex items-center gap-1"><Star size={13} className="text-amber-400 fill-amber-400" /><span className="font-semibold text-slate-700">{item.rating || 0}</span></div>
                    <span className="text-slate-300">·</span>
                    <div className="flex items-center gap-1 text-slate-400"><Clock size={13} />{item.preparationTime || 15} min</div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                    <div>
                      <span className="text-xl font-extrabold text-indigo-600">৳{item.price}</span>
                      {item.discountPrice > 0 && <span className="text-sm text-slate-400 line-through ml-1.5">৳{item.discountPrice}</span>}
                    </div>
                    <motion.button whileTap={{ scale: 0.9 }} onClick={(e) => { e.preventDefault(); handleAddToCart(item); }}
                      className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center hover:shadow-lg hover:shadow-indigo-500/25 transition-all">
                      <ShoppingCart size={16} />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && items.filter(i => i.isAvailable).length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24">
            <UtensilsCrossed size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-xl font-semibold text-slate-400">No dishes found</p>
            <p className="text-sm text-slate-400 mt-1">Try a different search or category</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ShopMenu;
