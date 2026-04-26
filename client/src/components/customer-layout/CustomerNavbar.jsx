import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, Menu, X, LogOut, ShoppingBag, Star, Phone, Home, UtensilsCrossed } from 'lucide-react';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { useCart } from '../../context/CartContext';

const CustomerNavbar = () => {
  const { customer, logout } = useCustomerAuth();
  const { totalItems, setIsOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
    { to: '/about', label: 'About', icon: Star },
    { to: '/contact', label: 'Contact', icon: Phone },
  ];

  const navBg = scrolled || !isHome || menuOpen
    ? 'bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm'
    : 'bg-transparent border-b border-transparent';
  const textColor = scrolled || !isHome ? 'text-slate-700' : 'text-white';
  const logoText = scrolled || !isHome ? 'text-slate-800' : 'text-white';

  return (
    <>
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <UtensilsCrossed size={18} className="text-white" />
              </div>
              <span className={`text-lg font-extrabold tracking-tight ${logoText} transition-colors`}>Foodie Paradise</span>
            </Link>

            <div className="hidden md:flex items-center gap-0.5">
              {links.map(({ to, label }) => (
                <NavLink key={to} to={to} end={to === '/'}
                  className={({ isActive }) => `px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? (scrolled || !isHome ? 'bg-indigo-50 text-indigo-600' : 'bg-white/15 text-white')
                      : `${textColor} ${scrolled || !isHome ? 'hover:bg-slate-50' : 'hover:bg-white/10'}`
                  }`}>
                  {label}
                </NavLink>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => setIsOpen(true)} className={`relative p-2.5 rounded-xl transition-all active:scale-95 ${scrolled || !isHome ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                <ShoppingCart size={20} className={scrolled || !isHome ? 'text-slate-600' : 'text-white'} />
                {totalItems > 0 && (
                  <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
                    {totalItems}
                  </motion.span>
                )}
              </button>

              {customer ? (
                <div className="hidden md:flex items-center gap-1.5">
                  <Link to="/profile" className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm ${scrolled || !isHome ? 'hover:bg-slate-50' : 'hover:bg-white/10'}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">{customer.name?.[0]}</div>
                    <span className={`font-semibold ${textColor} transition-colors`}>{customer.name?.split(' ')[0]}</span>
                  </Link>
                  <button onClick={() => { logout(); navigate('/'); }} className={`p-2 rounded-xl ${scrolled || !isHome ? 'hover:bg-rose-50 text-rose-400' : 'hover:bg-white/10 text-white/60'} transition-all`}>
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <Link to="/login" className="hidden md:inline-flex btn-primary text-sm !py-2">Sign In</Link>
              )}

              <button onClick={() => setMenuOpen(!menuOpen)} className={`md:hidden p-2.5 rounded-xl transition-all ${scrolled || !isHome ? 'hover:bg-slate-100' : 'hover:bg-white/10'}`}>
                {menuOpen ? <X size={20} className={scrolled || !isHome ? 'text-slate-600' : 'text-white'} /> : <Menu size={20} className={scrolled || !isHome ? 'text-slate-600' : 'text-white'} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed inset-x-0 top-16 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-xl p-4 space-y-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} end={to === '/'} onClick={() => setMenuOpen(false)}
                className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon size={18} />{label}
              </NavLink>
            ))}
            {customer ? (
              <>
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50"><User size={18} />Profile</Link>
                <Link to="/orders" onClick={() => setMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-slate-600 hover:bg-slate-50"><ShoppingBag size={18} />My Orders</Link>
                <button onClick={() => { logout(); setMenuOpen(false); navigate('/'); }} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-500 hover:bg-rose-50 w-full"><LogOut size={18} />Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block btn-primary text-sm text-center mt-2">Sign In</Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-100 safe-area-inset-bottom">
        <div className="grid grid-cols-5 h-16">
          {[
            { to: '/', label: 'Home', icon: Home },
            { to: '/menu', label: 'Menu', icon: UtensilsCrossed },
            { to: '/cart', label: 'Cart', icon: ShoppingCart, badge: totalItems },
            { to: '/orders', label: 'Orders', icon: ShoppingBag },
            { to: customer ? '/profile' : '/login', label: customer ? 'Profile' : 'Login', icon: User },
          ].map(({ to, label, icon: Icon, badge }) => (
            <NavLink key={to} to={to} end={to === '/'}
              className={({ isActive }) => `flex flex-col items-center justify-center gap-0.5 relative transition-colors ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
              <Icon size={20} strokeWidth={isActive => isActive ? 2.5 : 1.5} />
              {badge > 0 && <span className="absolute top-1 right-1/4 w-4 h-4 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[9px] font-bold flex items-center justify-center">{badge}</span>}
              <span className="text-[10px] font-semibold">{label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};

export default CustomerNavbar;
