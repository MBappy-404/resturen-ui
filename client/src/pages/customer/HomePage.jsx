import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Truck, Shield, UtensilsCrossed, ShoppingCart } from 'lucide-react';
import { shopAPI } from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200, damping: 20 } } };

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);
  const { addItem } = useCart();

  useEffect(() => {
    Promise.all([shopAPI.getFeatured(), shopAPI.getPopular()])
      .then(([featRes, popRes]) => { setFeatured(featRes.data.data || []); setPopular(popRes.data.data || []); })
      .catch(() => {});
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920')] bg-cover bg-center opacity-15" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />

        {/* Decorative elements */}
        <div className="absolute top-20 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10 w-full">
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }} className="max-w-2xl text-white">
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-sm font-medium mb-8">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Welcome to Foodie Paradise
            </motion.span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-6 tracking-tight">
              Authentic Flavors,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400">Unforgettable</span><br />
              Experience
            </h1>
            <p className="text-base sm:text-lg text-slate-300 mb-10 max-w-lg leading-relaxed">
              Discover our carefully crafted menu featuring the finest ingredients and culinary traditions. Order online for delivery or reserve a table.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl font-semibold shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all flex items-center gap-2">
                Order Now <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/about" className="px-8 py-4 bg-white/5 text-white border border-white/15 rounded-2xl font-semibold backdrop-blur-sm hover:bg-white/10 transition-all">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features */}
      <section className="py-8 px-4 -mt-20 relative z-10">
        <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: UtensilsCrossed, title: 'Fresh Food', desc: '100% fresh ingredients', color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-600' },
            { icon: Truck, title: 'Fast Delivery', desc: '30 mins guaranteed', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
            { icon: Shield, title: 'Hygienic', desc: 'WHO standard kitchen', color: 'from-sky-500 to-sky-600', bg: 'bg-sky-50', text: 'text-sky-600' },
            { icon: Clock, title: 'Open Late', desc: 'Till midnight everyday', color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50', text: 'text-amber-600' },
          ].map((f, i) => (
            <motion.div key={i} variants={fadeUp}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-slate-200/50 text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100">
              <div className={`w-14 h-14 rounded-2xl ${f.bg} flex items-center justify-center mx-auto mb-4`}>
                <f.icon size={24} className={f.text} />
              </div>
              <h3 className="font-bold text-slate-800 mb-1">{f.title}</h3>
              <p className="text-xs text-slate-500">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Featured Items */}
      {featured.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-b from-white to-slate-50">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-3">Chef&apos;s Pick</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Featured Dishes</h2>
              <p className="text-slate-500 max-w-md mx-auto">Handpicked favorites from our chef&apos;s collection</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((item) => (
                <motion.div key={item._id} variants={fadeUp}>
                  <Link to={`/menu/${item._id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-100">
                    <div className="relative h-52 overflow-hidden">
                      <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.tags?.includes('bestseller') && (
                        <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-lg">Bestseller</span>
                      )}
                      <button
                        onClick={(e) => { e.preventDefault(); addItem({ ...item, quantity: 1 }); toast.success(`${item.name} added to cart!`); }}
                        className="absolute bottom-3 right-3 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all hover:bg-indigo-600 hover:text-white text-slate-600"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                    <div className="p-4">
                      <h3 className="font-bold text-slate-800 mb-1.5 group-hover:text-indigo-600 transition-colors">{item.name}</h3>
                      <div className="flex items-center gap-2 text-sm mb-3">
                        <div className="flex items-center gap-1"><Star size={13} className="text-amber-400 fill-amber-400" /><span className="font-semibold text-slate-700">{item.rating || 0}</span></div>
                        <span className="text-slate-300">·</span>
                        <span className="text-slate-400 text-xs flex items-center gap-1"><Clock size={12} />{item.preparationTime || 15} min</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-extrabold text-indigo-600">৳{item.price}</span>
                        {item.discountPrice > 0 && <span className="text-sm text-slate-400 line-through">৳{item.discountPrice}</span>}
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mt-10">
              <Link to="/menu" className="btn-primary inline-flex items-center gap-2 px-8 py-3.5 text-base">
                View Full Menu <ArrowRight size={18} />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Popular Items */}
      {popular.length > 0 && (
        <section className="py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <span className="inline-block px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-xs font-bold uppercase tracking-wider mb-3">Trending</span>
              <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-3 tracking-tight">Most Popular</h2>
              <p className="text-slate-500">Our customers&apos; all-time favorites</p>
            </motion.div>
            <motion.div variants={container} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {popular.slice(0, 6).map((item) => (
                <motion.div key={item._id} variants={fadeUp}>
                  <Link to={`/menu/${item._id}`} className="group flex gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 border border-slate-100">
                    <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                      <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors truncate">{item.name}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-2 leading-relaxed">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-extrabold text-indigo-600">৳{item.price}</span>
                        <div className="flex items-center gap-1 text-sm text-slate-500"><Star size={13} className="text-amber-400 fill-amber-400" /><span className="font-semibold">{item.rating || 0}</span></div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="relative py-24 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center text-white relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-4 tracking-tight">Ready to Order?</h2>
          <p className="text-indigo-100 mb-10 text-lg max-w-md mx-auto">Get your favorite meals delivered right to your door. Fast, fresh, and delicious.</p>
          <Link to="/menu" className="group inline-flex items-center gap-2 px-10 py-4 bg-white text-indigo-600 rounded-2xl font-bold text-lg shadow-xl shadow-black/10 hover:shadow-2xl hover:-translate-y-1 transition-all">
            Order Now <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
