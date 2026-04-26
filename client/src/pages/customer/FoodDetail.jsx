import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, ChevronLeft, ShoppingCart, Minus, Plus, Heart } from 'lucide-react';
import { shopAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import toast from 'react-hot-toast';

const FoodDetail = () => {
  const { id } = useParams();
  const [item, setItem] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const [itemRes, reviewsRes] = await Promise.all([shopAPI.getMenuItem(id), shopAPI.getReviews(id)]);
        const itemData = itemRes.data.data?.item || itemRes.data.data;
        setItem(itemData);
        setReviews(itemRes.data.data?.reviews || reviewsRes.data.data || []);
        if (itemData?.variants?.length > 0) setSelectedVariant(itemData.variants[0]);
      } catch { toast.error('Error loading item'); }
      finally { setLoading(false); }
    };
    fetchItem();
  }, [id]);

  const handleAddToCart = () => {
    const price = selectedVariant?.price || item.price;
    addItem({ _id: item._id, name: item.name, price, image: item.image, variant: selectedVariant?.name, addons: selectedAddons });
    for (let i = 1; i < quantity; i++) addItem({ _id: item._id, name: item.name, price, image: item.image, variant: selectedVariant?.name, addons: selectedAddons });
    toast.success('Added to cart!');
  };

  if (loading) return <div className="py-32"><LoadingSpinner size="lg" /></div>;
  if (!item) return <div className="py-32 text-center text-slate-400">Item not found</div>;

  const totalPrice = ((selectedVariant?.price || item.price) + selectedAddons.reduce((s, a) => s + a.price, 0)) * quantity;

  return (
    <div className="pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        <Link to="/menu" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-8 group transition-colors">
          <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />Back to Menu
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Image */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200 }}>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-slate-300/30">
              <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'} alt={item.name}
                className="w-full h-80 lg:h-[500px] object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <button className="absolute top-4 right-4 w-11 h-11 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors hover:text-rose-500 text-slate-400">
                <Heart size={20} />
              </button>
              {item.tags?.includes('bestseller') && (
                <span className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-lg">Bestseller</span>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ type: 'spring', stiffness: 200 }} className="space-y-6">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {item.tags?.map(tag => (
                  <span key={tag} className="inline-flex items-center px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-[11px] font-bold uppercase tracking-wider">{tag}</span>
                ))}
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-800 mb-2 tracking-tight">{item.name}</h1>
              {item.nameBn && <p className="text-slate-400 mb-3">{item.nameBn}</p>}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-lg">
                  <Star size={15} className="text-amber-400 fill-amber-400" />
                  <span className="font-bold text-slate-700">{item.rating || 0}</span>
                  <span className="text-slate-400">({item.reviewCount || 0})</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg text-slate-500">
                  <Clock size={15} />
                  <span className="font-medium">{item.preparationTime || 15} min</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 leading-relaxed text-base">{item.description}</p>

            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold text-indigo-600">৳{item.price}</span>
              {item.discountPrice > 0 && <span className="text-xl text-slate-400 line-through">৳{item.discountPrice}</span>}
            </div>

            {/* Variants */}
            {item.variants?.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-slate-700 mb-2.5">Size / Variant</h3>
                <div className="flex flex-wrap gap-2">
                  {item.variants.map(v => (
                    <button key={v.name} onClick={() => setSelectedVariant(v)}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${selectedVariant?.name === v.name ? 'border-indigo-500 bg-indigo-50 text-indigo-600 shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      {v.name} — ৳{v.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Addons */}
            {item.addons?.length > 0 && (
              <div>
                <h3 className="font-bold text-sm text-slate-700 mb-2.5">Add-ons</h3>
                <div className="space-y-2">
                  {item.addons.map(a => (
                    <label key={a.name} className="flex items-center justify-between p-3.5 rounded-xl border-2 border-slate-100 hover:border-indigo-200 cursor-pointer transition-all group">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={selectedAddons.find(sa => sa.name === a.name)} onChange={(e) => {
                          if (e.target.checked) setSelectedAddons([...selectedAddons, a]);
                          else setSelectedAddons(selectedAddons.filter(sa => sa.name !== a.name));
                        }} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                        <span className="text-sm font-medium text-slate-700">{a.name}</span>
                      </div>
                      <span className="text-sm font-bold text-indigo-600">+৳{a.price}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 pt-6 border-t border-slate-100">
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors active:scale-95">
                  <Minus size={16} className="text-slate-600" />
                </button>
                <span className="w-10 text-center font-bold text-lg text-slate-800">{quantity}</span>
                <button onClick={() => setQuantity(quantity + 1)}
                  className="w-11 h-11 rounded-lg bg-white flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors active:scale-95">
                  <Plus size={16} className="text-slate-600" />
                </button>
              </div>
              <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddToCart}
                className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-4 rounded-2xl flex items-center justify-center gap-2.5 text-base font-bold shadow-xl shadow-indigo-500/20 hover:shadow-2xl hover:-translate-y-0.5 transition-all">
                <ShoppingCart size={20} /> Add to Cart — ৳{totalPrice.toLocaleString()}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Reviews */}
        {reviews.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-16">
            <h2 className="text-2xl font-extrabold text-slate-800 mb-6 tracking-tight">Reviews ({reviews.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviews.map(review => (
                <div key={review._id} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm">{review.customer?.name?.[0] || 'U'}</div>
                    <div>
                      <p className="font-semibold text-sm text-slate-800">{review.customer?.name || 'Customer'}</p>
                      <div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FoodDetail;
