import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, Clock, Truck, Shield, UtensilsCrossed, Phone, MapPin } from 'lucide-react';
import { shopAPI } from '../../services/api';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    Promise.all([shopAPI.getFeatured(), shopAPI.getPopular()])
      .then(([featRes, popRes]) => { setFeatured(featRes.data.data || []); setPopular(popRes.data.data || []); })
      .catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1920')] bg-cover bg-center opacity-20" />
        <div className="max-w-7xl mx-auto px-4 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-2xl text-white">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
              className="inline-block px-4 py-1.5 rounded-full bg-white/20 backdrop-blur text-sm font-medium mb-6">
              Welcome to Foodie Paradise
            </motion.span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6">
              Authentic Flavors,<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">Unforgettable</span> Experience
            </h1>
            <p className="text-lg text-white/80 mb-8 max-w-lg">
              Discover our carefully crafted menu featuring the finest ingredients and culinary traditions. Order online for delivery or reserve a table.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/menu" className="px-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-semibold shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2">
                Order Now <ArrowRight size={18} />
              </Link>
              <Link to="/about" className="px-8 py-3.5 bg-white/10 text-white border border-white/30 rounded-2xl font-semibold backdrop-blur hover:bg-white/20 transition-all">
                Learn More
              </Link>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Features */}
      <section className="py-16 px-4 -mt-16 relative z-10">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: UtensilsCrossed, title: 'Fresh Food', desc: '100% fresh ingredients' },
            { icon: Truck, title: 'Fast Delivery', desc: '30 mins guaranteed' },
            { icon: Shield, title: 'Hygienic', desc: 'WHO standard kitchen' },
            { icon: Clock, title: 'Open Late', desc: 'Till midnight everyday' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg shadow-gray-100 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center mx-auto mb-3"><f.icon size={22} className="text-indigo-600" /></div>
              <h3 className="font-semibold text-gray-800 mb-1">{f.title}</h3>
              <p className="text-xs text-gray-500">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Items */}
      {featured.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Featured Dishes</h2>
              <p className="text-gray-500 max-w-lg mx-auto">Handpicked favorites from our chef's collection</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.slice(0, 8).map((item, idx) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                  <Link to={`/menu/${item._id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      {item.discountPrice > 0 && <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-lg">SALE</span>}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <div className="flex items-center gap-1 text-sm mb-2"><Star size={14} className="text-amber-400 fill-amber-400" /><span className="font-medium">{item.rating || 0}</span><span className="text-gray-400">({item.reviewCount || 0})</span></div>
                      <div className="flex items-center justify-between">
                        <span className="text-xl font-bold text-indigo-600">৳{item.price}</span>
                        <span className="text-xs text-gray-400">{item.preparationTime || 15} min</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/menu" className="btn-primary inline-flex items-center gap-2">View Full Menu <ArrowRight size={16} /></Link>
            </div>
          </div>
        </section>
      )}

      {/* Popular Items */}
      {popular.length > 0 && (
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Most Popular</h2>
              <p className="text-gray-500">Our customers' all-time favorites</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popular.slice(0, 6).map((item, idx) => (
                <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: idx * 0.05 }}>
                  <Link to={`/menu/${item._id}`} className="group flex gap-4 p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all">
                    <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} alt={item.name} className="w-24 h-24 rounded-xl object-cover group-hover:scale-105 transition-transform" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800 mb-1">{item.name}</h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-indigo-600">৳{item.price}</span>
                        <div className="flex items-center gap-1 text-sm"><Star size={12} className="text-amber-400 fill-amber-400" />{item.rating || 0}</div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-2xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-white/80 mb-8">Get your favorite meals delivered right to your door. Fast, fresh, and delicious.</p>
          <Link to="/menu" className="inline-flex items-center gap-2 px-8 py-3.5 bg-white text-indigo-600 rounded-2xl font-semibold shadow-xl hover:shadow-2xl hover:scale-105 transition-all">
            Order Now <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>
    </div>
  );
};

export default HomePage;
