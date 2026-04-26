import { Link } from 'react-router-dom';
import { UtensilsCrossed, MapPin, Phone, Mail, Clock, Globe, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 pb-20 md:pb-0">
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center"><UtensilsCrossed size={18} className="text-white" /></div>
              <span className="text-lg font-bold text-white">Foodie Paradise</span>
            </div>
            <p className="text-sm leading-relaxed mb-4">Authentic flavors crafted with passion. Experience the finest dining with our carefully curated menu and warm hospitality.</p>
            <div className="flex gap-3">
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"><Globe size={16} /></a>
              <a href="#" className="w-9 h-9 rounded-full bg-gray-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"><Heart size={16} /></a>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <div className="space-y-2 text-sm">
              {[{ to: '/', label: 'Home' }, { to: '/menu', label: 'Our Menu' }, { to: '/about', label: 'About Us' }, { to: '/contact', label: 'Contact' }].map(l => (
                <Link key={l.to} to={l.to} className="block hover:text-white transition-colors">{l.label}</Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Contact Info</h4>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2"><MapPin size={16} className="text-indigo-400 mt-0.5 shrink-0" /><span>123 Food Street, Dhaka, Bangladesh</span></div>
              <div className="flex items-center gap-2"><Phone size={16} className="text-indigo-400 shrink-0" /><span>+880 1700-000000</span></div>
              <div className="flex items-center gap-2"><Mail size={16} className="text-indigo-400 shrink-0" /><span>info@foodieparadise.com</span></div>
            </div>
          </div>
          <div>
            <h4 className="font-semibold text-white mb-4">Opening Hours</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Mon - Fri</span><span className="text-white">10:00 AM - 11:00 PM</span></div>
              <div className="flex justify-between"><span>Sat - Sun</span><span className="text-white">9:00 AM - 12:00 AM</span></div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Foodie Paradise. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
