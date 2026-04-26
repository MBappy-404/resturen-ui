import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Phone, User, CreditCard, Truck, Store, Tag, ArrowLeft } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCustomerAuth } from '../../context/CustomerAuthContext';
import { shopAPI } from '../../services/api';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { customer } = useCustomerAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderType, setOrderType] = useState('delivery');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [form, setForm] = useState({
    name: customer?.name || '', phone: customer?.phone || '', email: customer?.email || '',
    address: '', area: '', notes: '', paymentMethod: 'cash'
  });

  const deliveryCharge = orderType === 'delivery' ? 60 : 0;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + tax + deliveryCharge - discount;

  const validateCoupon = async () => {
    if (!couponCode) return;
    try {
      const { data } = await shopAPI.validateCoupon({ code: couponCode, orderTotal: subtotal });
      setDiscount(data.data.discountAmount);
      toast.success(`Coupon applied! ৳${data.data.discountAmount} off`);
    } catch (error) { toast.error(error.response?.data?.message || 'Invalid coupon'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setLoading(true);
    try {
      const orderData = {
        orderType,
        items: items.map(i => ({
          menuItem: i._id, name: i.name, image: i.image,
          unitPrice: i.price || i.unitPrice, quantity: i.quantity,
          variant: i.variant, addons: i.addons,
          subtotal: ((i.price || i.unitPrice) + (i.addons || []).reduce((s, a) => s + a.price, 0)) * i.quantity
        })),
        customerInfo: { name: form.name, phone: form.phone, email: form.email },
        deliveryAddress: orderType === 'delivery' ? { address: form.address, area: form.area } : undefined,
        paymentMethod: form.paymentMethod,
        deliveryCharge, discount, notes: form.notes, couponCode: discount > 0 ? couponCode : undefined
      };
      const { data } = await shopAPI.placeOrder(orderData);
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/order-tracking/${data.data._id}`);
    } catch (error) { toast.error(error.response?.data?.message || 'Error placing order'); }
    finally { setLoading(false); }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center px-4">
        <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-4">Add items from the menu to checkout</p>
        <button onClick={() => navigate('/menu')} className="btn-primary">Browse Menu</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-indigo-600 mb-6"><ArrowLeft size={16} /> Back</button>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Order Type */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold mb-4">Order Type</h3>
              <div className="flex gap-3">
                {[{ type: 'delivery', icon: Truck, label: 'Delivery' }, { type: 'takeaway', icon: Store, label: 'Pickup' }].map(({ type, icon: Icon, label }) => (
                  <button key={type} type="button" onClick={() => setOrderType(type)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium transition-all ${orderType === type ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500 hover:border-gray-300'}`}>
                    <Icon size={18} />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
              <h3 className="font-semibold">Contact Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Name *</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" required /></div>
                <div><label className="block text-sm font-medium mb-1">Phone *</label><input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" required /></div>
              </div>
              {orderType === 'delivery' && (
                <div><label className="block text-sm font-medium mb-1">Delivery Address *</label><textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="input-field" rows={2} required /></div>
              )}
              <div><label className="block text-sm font-medium mb-1">Order Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="input-field" rows={2} placeholder="Any special instructions..." /></div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-semibold mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {['cash', 'bkash', 'nagad', 'card'].map(m => (
                  <button key={m} type="button" onClick={() => setForm({ ...form, paymentMethod: m })}
                    className={`py-3 rounded-xl border-2 text-sm font-medium capitalize transition-all ${form.paymentMethod === m ? 'border-indigo-600 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-500'}`}>
                    {m === 'cash' ? 'Cash on Delivery' : m}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100 sticky top-24">
              <h3 className="font-semibold mb-4">Order Summary</h3>
              <div className="space-y-3 mb-4">
                {items.map(item => (
                  <div key={item.cartKey} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x{item.quantity}</span>
                    <span className="font-medium">৳{((item.price || item.unitPrice) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Coupon */}
              <div className="flex gap-2 mb-4">
                <input value={couponCode} onChange={(e) => setCouponCode(e.target.value)} className="input-field text-sm flex-1" placeholder="Coupon code" />
                <button type="button" onClick={validateCoupon} className="btn-secondary text-sm px-4"><Tag size={14} /></button>
              </div>

              <div className="space-y-2 text-sm border-t pt-4">
                <div className="flex justify-between"><span className="text-gray-500">Subtotal</span><span>৳{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tax (5%)</span><span>৳{tax}</span></div>
                {orderType === 'delivery' && <div className="flex justify-between"><span className="text-gray-500">Delivery</span><span>৳{deliveryCharge}</span></div>}
                {discount > 0 && <div className="flex justify-between text-green-600"><span>Discount</span><span>-৳{discount}</span></div>}
                <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-indigo-600">৳{total.toLocaleString()}</span></div>
              </div>

              <motion.button whileTap={{ scale: 0.98 }} type="submit" disabled={loading}
                className="btn-primary w-full mt-6 py-3.5 text-lg flex items-center justify-center gap-2">
                {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Place Order'}
              </motion.button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
