import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, ShoppingBag, Star, Phone, Home, UtensilsCrossed } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';

const CustomerNavbar = () => {
  const { customer, logout } = useCustomerAuth();
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/about', label: 'About', icon: Star },
    { to: '/contact', label: 'Contact', icon: Phone },
  ];

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <UtensilsCrossed size={18} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-800">Foodie Paradise</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {links.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}`}>
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(true)} className="relative p-2 rounded-xl hover:bg-gray-100 transition-colors">
                <ShoppingCart size={20} className="text-gray-600" />
                {totalItems > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </motion.span>
                )}
              </button>

              {customer ? (
                <div className="hidden md:flex items-center gap-2">
                  <Link to="/profile" className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 text-sm">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">{customer.name?.[0]}</div>
                    <span className="font-medium text-gray-700">{customer.name?.split(' ')[0]}</span>
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className="p-2 rounded-xl hover:bg-red-50 text-red-400"><LogOut size={18} /></button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:flex btn-primary text-sm py-2">Sign In</Link>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100">
                {menuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-white border-b border-gray-100 shadow-lg p-4 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-50'}`}>
                <Icon size={18} />{label}
              </NavLink>
            ))}
            {customer ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50"><User size={18} />Profile</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-600 hover:bg-gray-50"><ShoppingBag size={18} />My Orders</Link>
                <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-red-500 hover:bg-red-50 w-full"><LogOut size={18} />Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block btn-primary text-sm text-center mt-2">Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-100 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {[
            { to: '/', label: 'Home', icon: Home },
            { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
            { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: totalItems },
            { to: '/orders', label: 'Orders', icon: ShoppingBag },
            { to: customer ? '/profile' : '/login', label: customer ? 'Profile' : 'Login', icon: User },
          ].map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 relative ${isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
              <Icon size={20} />
              {badge > 0 && <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>}
              <span className="text-[10px] font-medium">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default CustomerNavbar;
