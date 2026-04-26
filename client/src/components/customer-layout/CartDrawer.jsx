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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                  <ShoppingBag size={18} className="text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-800">Your Cart</h2>
                  <p className="text-xs text-slate-400">{totalItems} items</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="p-2.5 rounded-xl hover:bg-slate-100 transition-colors active:scale-95"><X size={18} className="text-slate-400" /></button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-8">
                <div className="w-20 h-20 rounded-2xl bg-slate-50 flex items-center justify-center mb-5">
                  <ShoppingBag size={36} className="text-slate-200" />
                </div>
                <h3 className="text-lg font-bold text-slate-700 mb-1">Cart is empty</h3>
                <p className="text-sm text-slate-400 mb-6">Add items from the menu to get started</p>
                <button onClick={() => { setIsOpen(false); navigate('/menu'); }} className="btn-primary text-sm">Browse Menu</button>
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  {items.map(item => (
                    <motion.div key={item.cartKey} layout className="flex gap-3.5 p-3 rounded-xl bg-slate-50 group border border-slate-100 hover:border-slate-200 transition-colors">
                      {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <h4 className="font-semibold text-sm text-slate-800 truncate">{item.name}</h4>
                          <button onClick={() => removeItem(item.cartKey)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={14} className="text-rose-400" /></button>
                        </div>
                        {item.variant && <p className="text-xs text-slate-400 mt-0.5">{item.variant}</p>}
                        {item.addons?.length > 0 && <p className="text-xs text-slate-400">+{item.addons.map(a => a.name).join(', ')}</p>}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => updateQuantity(item.cartKey, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"><Minus size={12} className="text-slate-500" /></button>
                            <span className="text-sm font-bold w-6 text-center text-slate-800">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.cartKey, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 active:scale-95 transition-all"><Plus size={12} className="text-slate-500" /></button>
                          </div>
                          <span className="font-bold text-indigo-600">৳{((item.price || item.unitPrice) * item.quantity).toLocaleString()}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="px-6 py-5 border-t border-slate-100 space-y-4 bg-slate-50/50">
                  <div className="flex justify-between"><span className="text-sm text-slate-500">Subtotal</span><span className="text-lg font-extrabold text-slate-800">৳{subtotal.toLocaleString()}</span></div>
                  <p className="text-xs text-slate-400">Tax & delivery calculated at checkout</p>
                  <button onClick={handleCheckout} className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    Checkout <ArrowRight size={16} />
                  </button>
                  <button onClick={clearCart} className="w-full text-sm text-slate-400 hover:text-rose-500 transition-colors py-1 font-medium">Clear Cart</button>
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
