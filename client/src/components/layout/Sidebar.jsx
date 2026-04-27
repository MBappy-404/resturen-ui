import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, UtensilsCrossed, ClipboardList, ChefHat, Armchair, Users, Package, UserCircle, FileText, BarChart3, Building2, Settings, LogOut, X, CalendarDays, Monitor } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/pos', icon: Monitor, label: 'POS Terminal', external: true },
  { path: '/admin/menu', icon: UtensilsCrossed, label: 'Menu' },
  { path: '/admin/orders', icon: ClipboardList, label: 'Orders' },
  { path: '/admin/kitchen', icon: ChefHat, label: 'Kitchen Display' },
  { path: '/admin/tables', icon: Armchair, label: 'Tables' },
  { path: '/admin/reservations', icon: CalendarDays, label: 'Reservations' },
  { path: '/admin/staff', icon: Users, label: 'Staff' },
  { path: '/admin/inventory', icon: Package, label: 'Inventory' },
  { path: '/admin/customers', icon: UserCircle, label: 'Customers' },
  { path: '/admin/invoices', icon: FileText, label: 'Invoices' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { path: '/admin/organization', icon: Building2, label: 'Organization' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-base shadow-lg shadow-indigo-500/20">
            {user?.organization?.name?.[0] || 'F'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-sm tracking-tight truncate">{user?.organization?.name || 'Foodie Paradise'}</h1>
            <p className="text-[11px] text-slate-400 truncate capitalize font-medium">{user?.role?.replace('_', ' ') || 'Admin'}</p>
          </div>
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {menuItems.map(({ path, icon: Icon, label, end, external }) => (
          external ? (
            <a key={path} href={path} onClick={onClose}
              className="sidebar-item flex items-center gap-2 text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
              <Icon size={18} />
              <span className="text-[13px]">{label}</span>
            </a>
          ) : (
            <NavLink key={path} to={path} end={end} onClick={onClose}
              className={({ isActive }) => `sidebar-item ${isActive ? 'active' : ''}`}>
              <Icon size={18} strokeWidth={isActive => isActive ? 2.5 : 1.8} />
              <span className="text-[13px]">{label}</span>
            </NavLink>
          )
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold shadow-md">
            {user?.name?.[0] || 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.name}</p>
            <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-item w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
          <LogOut size={18} />
          <span className="text-[13px]">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block w-[260px] fixed inset-y-0 left-0 z-30 shadow-2xl shadow-black/20">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 350 }}
              className="fixed inset-y-0 left-0 w-[260px] z-50 lg:hidden shadow-2xl"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
