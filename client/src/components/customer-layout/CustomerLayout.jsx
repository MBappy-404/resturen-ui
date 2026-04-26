import { Outlet } from 'react-router-dom';
import CustomerNavbar from './CustomerNavbar';
import Footer from './Footer';
import CartDrawer from './CartDrawer';

const CustomerLayout = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <CustomerNavbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <CartDrawer />
    </div>
  );
};

export default CustomerLayout;
