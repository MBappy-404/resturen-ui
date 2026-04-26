import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles = {
  '/admin': 'Dashboard',
  '/admin/menu': 'Menu Management',
  '/admin/orders': 'Orders',
  '/admin/kitchen': 'Kitchen Display',
  '/admin/tables': 'Tables',
  '/admin/reservations': 'Reservations',
  '/admin/staff': 'Staff Management',
  '/admin/inventory': 'Inventory',
  '/admin/customers': 'Customers',
  '/admin/invoices': 'Invoices',
  '/admin/reports': 'Reports & Analytics',
  '/admin/organization': 'Organization',
  '/admin/settings': 'Settings',
};

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
