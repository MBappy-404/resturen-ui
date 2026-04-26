import { motion } from 'framer-motion';
import { Award, Users, Clock, Heart, UtensilsCrossed, Star } from 'lucide-react';

const AboutPage = () => {
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920')] bg-cover bg-center opacity-30" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Story</h1>
          <p className="text-lg text-white/70">From a small kitchen to a beloved destination for food lovers across Bangladesh</p>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-4 -mt-12 relative z-10">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { value: '5+', label: 'Years', icon: Clock },
            { value: '50K+', label: 'Happy Customers', icon: Users },
            { value: '200+', label: 'Menu Items', icon: UtensilsCrossed },
            { value: '4.8', label: 'Rating', icon: Star },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <s.icon size={24} className="text-indigo-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{s.value}</p>
              <p className="text-sm text-gray-500">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600" alt="Chef" className="w-full rounded-3xl shadow-xl" />
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Crafted with Passion</h2>
            <p className="text-gray-600 leading-relaxed mb-4">At Foodie Paradise, we believe food is more than just sustenance — it's an experience. Our expert chefs use the freshest ingredients and time-honored recipes to create dishes that tantalize your taste buds.</p>
            <p className="text-gray-600 leading-relaxed mb-6">Every meal we serve is prepared with love and dedication, ensuring that each bite brings you closer to the authentic flavors of Bangladesh and beyond.</p>
            <div className="space-y-3">
              {['100% Fresh & Halal Ingredients', 'Experienced & Passionate Chefs', 'Hygienic Kitchen Standards', 'Fast & Reliable Delivery'].map((point, i) => (
                <div key={i} className="flex items-center gap-3"><Heart size={16} className="text-indigo-600 shrink-0" /><span className="text-gray-700">{point}</span></div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Our Values</h2>
          <p className="text-gray-500">What makes us different</p>
        </div>
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: Award, title: 'Quality', desc: 'We never compromise on the quality of our ingredients and cooking methods.' },
            { icon: Heart, title: 'Care', desc: 'Every dish is prepared with love, care, and attention to detail.' },
            { icon: Users, title: 'Community', desc: 'We are part of the community and give back through various programs.' },
          ].map((v, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="bg-white rounded-2xl p-8 text-center shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center mx-auto mb-4"><v.icon size={24} className="text-indigo-600" /></div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{v.title}</h3>
              <p className="text-sm text-gray-500">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
