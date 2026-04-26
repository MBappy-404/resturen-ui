import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const { items, totalItems, subtotal, updateQuantity, removeItem, clearCart, isOpen, setIsOpen } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setIsOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShoppingBag size={20} className="text-indigo-600" />
                <h2 className="text-lg font-bold text-gray-800">Your Cart ({totalItems})</h2>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <ShoppingBag size={48} className="text-gray-200 mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-1">Cart is empty</h3>
                <p className="text-sm text-gray-400 mb-4">Add items from the menu to get started</p>
                <button onClick={() => { setIsOpen(false); navigate('/menu'); }} className="btn-primary text-sm">Browse Menu</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {items.map(item => (
                    <motion.div key={item.cartKey} layout className="flex gap-3 p-3 rounded-xl bg-gray-50 group">
                      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="font-medium text-sm text-gray-800 truncate">{item.name}</h4>
                          <button onClick={() => removeItem(item.cartKey)} className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded"><Trash2 size={14} className="text-red-400" /></button>
                        </div>
                        {item.variant && <p className="text-xs text-gray-400">{item.variant}</p>}
                        {item.addons?.length > 0 && <p className="text-xs text-gray-400">+{item.addons.map(a => a.name).join(', ')}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Minus size={12} /></button>
                            <span className="text-sm font-semibold w-5 text-center">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartKey, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50"><Plus size={12} /></button>
                          </div>
                          <span className="font-semibold text-indigo-600">৳{((item.price || item.unitPrice) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="px-6 py-4 border-t border-gray-100 space-y-3">
                  <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-semibold">৳{subtotal.toLocaleString()}</span></div>
                  <p className="text-xs text-gray-400">Tax & delivery calculated at checkout</p>
                  <button onClick={handleCheckout} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                    Checkout <ArrowRight size={16} />
                  </button>
                  <button onClick={clearCart} className="w-full text-sm text-gray-400 hover:text-red-500 transition-colors py-1">Clear Cart</button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
