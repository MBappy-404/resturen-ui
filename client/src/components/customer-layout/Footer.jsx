import { Link } from 'react-router-dom';
import { UtensilsCrossed, MapPin, Phone, Mail, Globe, Heart, ArrowRight } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Newsletter */}
        <div className="relative -mt-12 mb-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 md:p-10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-white text-center md:text-left">
                <h3 className="text-xl font-bold mb-1">Stay Updated</h3>
                <p className="text-indigo-100 text-sm">Subscribe to get special offers and updates</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <input type="email" placeholder="Enter your email"
                  className="flex-1 md:w-64 px-4 py-3 rounded-xl bg-white/15 border border-white/20 text-white placeholder:text-white/50 text-sm focus:outline-none focus:bg-white/20 transition-colors backdrop-blur-sm" />
                <button className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-semibold text-sm hover:bg-indigo-50 transition-colors flex items-center gap-1.5 shadow-lg whitespace-nowrap">
                  Subscribe <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-10">
          <div>
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <UtensilsCrossed size={20} className="text-white" />
              </div>
              <span className="text-lg font-extrabold text-white tracking-tight">Foodie Paradise</span>
            </div>
            <p className="text-sm leading-relaxed mb-5">Authentic flavors crafted with passion. Experience the finest dining with our carefully curated menu.</p>
            <div className="flex gap-2.5">
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-600 transition-all"><Globe size={15} /></a>
              <a href="#" className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-indigo-600 hover:border-indigo-600 transition-all"><Heart size={15} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-3 text-sm">
              {[{ to: '/', label: 'Home' }, { to: '/menu', label: 'Our Menu' }, { to: '/about', label: 'About Us' }, { to: '/contact', label: 'Contact' }].map(l => (
                <Link key={l.to} to={l.to} className="block hover:text-white hover:translate-x-1 transition-all">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Contact Info</h4>
            <div className="space-y-3.5 text-sm">
              <div className="flex items-start gap-3"><MapPin size={16} className="text-indigo-400 mt-0.5 shrink-0" /><span>123 Food Street, Dhaka, Bangladesh</span></div>
              <div className="flex items-center gap-3"><Phone size={16} className="text-indigo-400 shrink-0" /><span>+880 1700-000000</span></div>
              <div className="flex items-center gap-3"><Mail size={16} className="text-indigo-400 shrink-0" /><span>info@foodieparadise.com</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-white mb-5 text-sm uppercase tracking-wider">Opening Hours</h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span>Mon - Fri</span><span className="text-white font-medium">10:00 AM - 11:00 PM</span></div>
              <div className="flex justify-between"><span>Sat - Sun</span><span className="text-white font-medium">9:00 AM - 12:00 AM</span></div>
              <div className="mt-4 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Currently Open
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/5 py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-500">
          <span>&copy; {new Date().getFullYear()} Foodie Paradise. All rights reserved.</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
