import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';

const ContactPage = () => {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Message sent! We will get back to you soon.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">Contact Us</h1>
        <p className="text-gray-500 max-w-lg mx-auto">Have a question? We'd love to hear from you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Info Cards */}
        <div className="space-y-4">
          {[
            { icon: MapPin, title: 'Address', info: '123 Food Street, Gulshan, Dhaka, Bangladesh' },
            { icon: Phone, title: 'Phone', info: '+880 1700-000000' },
            { icon: Mail, title: 'Email', info: 'info@foodieparadise.com' },
            { icon: Clock, title: 'Hours', info: 'Mon-Sun: 10:00 AM - 11:00 PM' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-5 bg-white rounded-2xl border border-gray-100">
              <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0"><item.icon size={20} className="text-indigo-600" /></div>
              <div><h3 className="font-semibold text-gray-800 mb-0.5">{item.title}</h3><p className="text-sm text-gray-500">{item.info}</p></div>
            </motion.div>
          ))}
        </div>

        {/* Contact Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
              <div><label className="block text-sm font-medium mb-1">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input-field" required /></div>
            </div>
            <div><label className="block text-sm font-medium mb-1">Subject</label><input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input-field" /></div>
            <div><label className="block text-sm font-medium mb-1">Message *</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input-field" rows={5} required /></div>
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ContactPage;
