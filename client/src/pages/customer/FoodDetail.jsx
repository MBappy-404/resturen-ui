import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, Clock, ChevronLeft, ShoppingCart, Minus, Plus } from 'lucide-react';
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
        setItem(itemRes.data.data);
        setReviews(reviewsRes.data.data || []);
        if (itemRes.data.data?.variants?.length > 0) setSelectedVariant(itemRes.data.data.variants[0]);
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

  if (loading) return <div className="py-20"><LoadingSpinner size="lg" /></div>;
  if (!item) return <div className="py-20 text-center text-gray-400">Item not found</div>;

  const totalPrice = ((selectedVariant?.price || item.price) + selectedAddons.reduce((s, a) => s + a.price, 0)) * quantity;

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8">
      <Link to="/menu" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6"><ChevronLeft size={16} />Back to Menu</Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'} alt={item.name} className="w-full h-80 lg:h-[500px] object-cover rounded-3xl" />
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
          <div>
            <div className="flex flex-wrap gap-2 mb-2">
              {item.tags?.map(tag => <span key={tag} className="badge badge-purple text-xs capitalize">{tag}</span>)}
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">{item.name}</h1>
            {item.nameBn && <p className="text-gray-400 mb-2">{item.nameBn}</p>}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1"><Star size={16} className="text-amber-400 fill-amber-400" /><span className="font-semibold">{item.rating || 0}</span><span className="text-gray-400">({item.reviewCount || 0} reviews)</span></div>
              <div className="flex items-center gap-1 text-gray-500"><Clock size={16} />{item.preparationTime || 15} min</div>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed">{item.description}</p>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold text-indigo-600">৳{item.price}</span>
            {item.discountPrice > 0 && <span className="text-lg text-gray-400 line-through">৳{item.discountPrice}</span>}
          </div>

          {/* Variants */}
          {item.variants?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Size / Variant</h3>
              <div className="flex flex-wrap gap-2">
                {item.variants.map(v => (
                  <button key={v.name} onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${selectedVariant?.name === v.name ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {v.name} — ৳{v.price}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {item.addons?.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Add-ons</h3>
              <div className="space-y-2">
                {item.addons.map(a => (
                  <label key={a.name} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-indigo-200 cursor-pointer transition-colors">
                    <div className="flex items-center gap-3">
                      <input type="checkbox" checked={selectedAddons.find(sa => sa.name === a.name)} onChange={(e) => {
                        if (e.target.checked) setSelectedAddons([...selectedAddons, a]);
                        else setSelectedAddons(selectedAddons.filter(sa => sa.name !== a.name));
                      }} className="w-4 h-4 rounded text-indigo-600" />
                      <span className="text-sm">{a.name}</span>
                    </div>
                    <span className="text-sm font-medium text-indigo-600">+৳{a.price}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Quantity & Add */}
          <div className="flex items-center gap-4 pt-4 border-t">
            <div className="flex items-center gap-3 bg-gray-100 rounded-xl p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm"><Minus size={16} /></button>
              <span className="w-8 text-center font-bold text-lg">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm"><Plus size={16} /></button>
            </div>
            <motion.button whileTap={{ scale: 0.95 }} onClick={handleAddToCart}
              className="flex-1 btn-primary py-3.5 flex items-center justify-center gap-2 text-lg">
              <ShoppingCart size={20} /> Add — ৳{totalPrice.toLocaleString()}
            </motion.button>
          </div>
        </motion.div>
      </div>

      {/* Reviews */}
      {reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Reviews ({reviews.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map(review => (
              <div key={review._id} className="bg-gray-50 rounded-2xl p-5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">{review.customer?.name?.[0] || 'U'}</div>
                  <div><p className="font-medium text-sm">{review.customer?.name || 'Customer'}</p><div className="flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={12} className={i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-300'} />)}</div></div>
                </div>
                <p className="text-sm text-gray-600">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodDetail;
