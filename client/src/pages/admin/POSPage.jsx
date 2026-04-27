import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, Trash2, ShoppingCart, CreditCard, Banknote, Smartphone, X, ChefHat, ArrowLeft, Printer, Receipt, Users, UtensilsCrossed, Package, Check, Star } from 'lucide-react';
import { menuAPI, orderAPI, tableAPI, invoiceAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const POSPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const receiptRef = useRef();

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine_in');
  const [selectedTable, setSelectedTable] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '' });
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [itemQuantity, setItemQuantity] = useState(1);
  const [specialNote, setSpecialNote] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [paidAmount, setPaidAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [showCartMobile, setShowCartMobile] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [catRes, menuRes, tableRes] = await Promise.all([
        menuAPI.getCategories(),
        menuAPI.getItems({ limit: 200 }),
        tableAPI.getTables({})
      ]);
      setCategories(catRes.data.data || []);
      setMenuItems(menuRes.data.data || []);
      setTables(tableRes.data.data || []);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredItems = menuItems.filter(item => {
    if (!item.isAvailable) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeCategory !== 'all' && item.category?._id !== activeCategory) return false;
    return true;
  });

  const openItemModal = (item) => {
    setSelectedItem(item);
    setSelectedAddons([]);
    setSelectedVariant(item.variants?.length ? item.variants[0].name : '');
    setItemQuantity(1);
    setSpecialNote('');
    setShowItemModal(true);
  };

  const getItemPrice = () => {
    if (!selectedItem) return 0;
    let price = selectedItem.discountPrice || selectedItem.price;
    if (selectedVariant) {
      const v = selectedItem.variants?.find(v => v.name === selectedVariant);
      if (v) price = v.price;
    }
    return price;
  };

  const getAddonsTotal = () => selectedAddons.reduce((sum, a) => sum + a.price, 0);

  const addToCart = () => {
    if (!selectedItem) return;
    const unitPrice = getItemPrice();
    const addonsTotal = getAddonsTotal();
    const totalPerItem = unitPrice + addonsTotal;

    const cartItem = {
      id: Date.now().toString(),
      menuItem: selectedItem._id,
      name: selectedItem.name,
      image: selectedItem.image,
      unitPrice,
      variant: selectedVariant,
      addons: [...selectedAddons],
      specialNote,
      quantity: itemQuantity,
      addonsTotal,
      subtotal: totalPerItem * itemQuantity
    };

    setCart(prev => [...prev, cartItem]);
    setShowItemModal(false);
    toast.success(`${selectedItem.name} added`);
  };

  const updateCartQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id !== id) return item;
      const newQty = Math.max(1, item.quantity + delta);
      const totalPerItem = item.unitPrice + item.addonsTotal;
      return { ...item, quantity: newQty, subtotal: totalPerItem * newQty };
    }));
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const tax = Math.round(cartSubtotal * 0.05);
  const serviceCharge = Math.round(cartSubtotal * 0.03);
  const cartTotal = cartSubtotal + tax + serviceCharge;

  const handleCheckout = () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }
    setPaidAmount(cartTotal.toString());
    setShowPaymentModal(true);
  };

  const handlePlaceOrder = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const orderData = {
        orderType,
        orderSource: 'pos',
        table: orderType === 'dine_in' && selectedTable ? selectedTable : undefined,
        customerInfo,
        items: cart.map(item => ({
          menuItem: item.menuItem,
          name: item.name,
          image: item.image,
          unitPrice: item.unitPrice,
          variant: item.variant,
          addons: item.addons,
          specialNote: item.specialNote,
          quantity: item.quantity,
          subtotal: item.subtotal
        })),
        subtotal: cartSubtotal,
        tax,
        serviceCharge,
        total: cartTotal,
        paymentMethod,
        paymentStatus: 'paid',
        paidAmount: Number(paidAmount),
        changeAmount: Math.max(0, Number(paidAmount) - cartTotal)
      };

      const { data } = await orderAPI.createOrder(orderData);
      setLastOrder(data.data);
      setShowPaymentModal(false);
      setCart([]);
      setCustomerInfo({ name: '', phone: '' });
      setSelectedTable('');
      setShowReceipt(true);
      toast.success('Order placed!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrintReceipt = () => {
    const content = receiptRef.current;
    if (!content) return;
    const win = window.open('', '', 'width=320,height=600');
    win.document.write(`<html><head><title>Receipt</title><style>
      @page{size:80mm auto;margin:2mm}
      body{font-family:'Courier New',monospace;font-size:11px;padding:4px;width:72mm;margin:0 auto}
      .center{text-align:center}.bold{font-weight:bold}
      .line{border-top:1px dashed #000;margin:4px 0}
      table{width:100%;border-collapse:collapse}td{padding:1px 0}
      .right{text-align:right}.total{font-size:14px;font-weight:bold}
      .addon{font-size:9px;color:#666;padding-left:12px}
    </style></head><body>`);
    win.document.write(content.innerHTML);
    win.document.write('</body></html>');
    win.document.close();
    win.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500">Loading POS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Bar */}
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/admin')} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
              <ChefHat size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">POS Terminal</h1>
              <p className="text-xs text-slate-500">{user?.organization?.name || 'Restaurant'}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Mobile cart toggle */}
          <button onClick={() => setShowCartMobile(true)} className="lg:hidden relative p-2 rounded-xl bg-indigo-50 text-indigo-600">
            <ShoppingCart size={20} />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{cart.length}</span>
            )}
          </button>
          <div className="hidden sm:flex items-center gap-1 bg-slate-100 rounded-xl p-1">
            {[{ v: 'dine_in', icon: UtensilsCrossed, label: 'Dine In' }, { v: 'takeaway', icon: Package, label: 'Takeaway' }, { v: 'delivery', icon: Users, label: 'Delivery' }].map(t => (
              <button key={t.v} onClick={() => setOrderType(t.v)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${orderType === t.v ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                <t.icon size={14} />{t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Menu Items (75%) */}
        <div className="flex-1 lg:w-3/4 flex flex-col overflow-hidden">
          {/* Search & Category Filter */}
          <div className="p-4 space-y-3">
            {/* Mobile order type */}
            <div className="sm:hidden flex items-center gap-1 bg-white rounded-xl p-1 shadow-sm">
              {[{ v: 'dine_in', label: 'Dine In' }, { v: 'takeaway', label: 'Take' }, { v: 'delivery', label: 'Delivery' }].map(t => (
                <button key={t.v} onClick={() => setOrderType(t.v)}
                  className={`flex-1 px-2 py-2 rounded-lg text-xs font-medium transition-all ${orderType === t.v ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-10 pr-4 py-2.5 bg-white rounded-xl border border-slate-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 text-sm outline-none transition-all" />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <button onClick={() => setActiveCategory('all')}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === 'all' ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                All Items
              </button>
              {categories.map(cat => (
                <button key={cat._id} onClick={() => setActiveCategory(cat._id)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat._id ? 'bg-indigo-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'}`}>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {filteredItems.map(item => (
                <motion.div key={item._id} whileTap={{ scale: 0.97 }}
                  onClick={() => openItemModal(item)}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <UtensilsCrossed size={28} className="text-slate-300" />
                      </div>
                    )}
                    {item.tags?.includes('bestseller') && (
                      <span className="absolute top-1.5 left-1.5 bg-amber-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5">
                        <Star size={8} fill="currentColor" /> Best
                      </span>
                    )}
                    {item.addons?.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-md font-medium">
                        +Add-ons
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-xs font-semibold text-slate-800 truncate">{item.name}</h4>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm font-bold text-indigo-600">৳{(item.discountPrice || item.price)?.toLocaleString()}</span>
                      {item.discountPrice > 0 && item.discountPrice < item.price && (
                        <span className="text-[10px] text-slate-400 line-through">৳{item.price}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            {filteredItems.length === 0 && (
              <div className="text-center py-16">
                <UtensilsCrossed size={40} className="text-slate-300 mx-auto mb-3" />
                <p className="text-slate-400">No items found</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart Panel (25%) — Desktop */}
        <div className="hidden lg:flex w-80 xl:w-96 flex-col bg-white border-l border-slate-200">
          <CartPanel
            cart={cart} orderType={orderType} selectedTable={selectedTable}
            setSelectedTable={setSelectedTable} tables={tables}
            customerInfo={customerInfo} setCustomerInfo={setCustomerInfo}
            updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart}
            cartSubtotal={cartSubtotal} tax={tax} serviceCharge={serviceCharge}
            cartTotal={cartTotal} handleCheckout={handleCheckout}
          />
        </div>
      </div>

      {/* Mobile Cart Drawer */}
      <AnimatePresence>
        {showCartMobile && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCartMobile(false)} className="lg:hidden fixed inset-0 bg-black/50 z-40" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed right-0 top-0 bottom-0 w-full sm:w-96 bg-white z-50 flex flex-col shadow-2xl">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg">Cart ({cart.length})</h3>
                <button onClick={() => setShowCartMobile(false)} className="p-2 rounded-xl hover:bg-slate-100">
                  <X size={20} />
                </button>
              </div>
              <CartPanel
                cart={cart} orderType={orderType} selectedTable={selectedTable}
                setSelectedTable={setSelectedTable} tables={tables}
                customerInfo={customerInfo} setCustomerInfo={setCustomerInfo}
                updateCartQuantity={updateCartQuantity} removeFromCart={removeFromCart}
                cartSubtotal={cartSubtotal} tax={tax} serviceCharge={serviceCharge}
                cartTotal={cartTotal} handleCheckout={() => { setShowCartMobile(false); handleCheckout(); }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Item Detail / Add-on Modal */}
      <AnimatePresence>
        {showItemModal && selectedItem && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowItemModal(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 sm:w-full sm:max-w-md bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
              {/* Modal Header */}
              <div className="relative">
                {selectedItem.image ? (
                  <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-44 object-cover" />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-indigo-100 to-purple-50 flex items-center justify-center">
                    <UtensilsCrossed size={48} className="text-indigo-300" />
                  </div>
                )}
                <button onClick={() => setShowItemModal(false)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white">
                  <X size={16} />
                </button>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <h3 className="text-white font-bold text-lg">{selectedItem.name}</h3>
                  <p className="text-white/80 text-sm">৳{(selectedItem.discountPrice || selectedItem.price)?.toLocaleString()}</p>
                </div>
              </div>

              <div className="overflow-y-auto flex-1 p-4 space-y-4">
                {/* Variants */}
                {selectedItem.variants?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Select Variant</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedItem.variants.map((v, i) => (
                        <button key={i} onClick={() => setSelectedVariant(v.name)}
                          className={`px-3 py-2.5 rounded-xl border text-sm font-medium transition-all ${selectedVariant === v.name
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-200'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                          <span className="block">{v.name}</span>
                          <span className="text-xs text-slate-500">৳{v.price}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add-ons */}
                {selectedItem.addons?.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-slate-800 mb-2">Add Extra Items</h4>
                    <div className="space-y-2">
                      {selectedItem.addons.map((addon, i) => {
                        const isSelected = selectedAddons.some(a => a.name === addon.name);
                        return (
                          <button key={i}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedAddons(prev => prev.filter(a => a.name !== addon.name));
                              } else {
                                setSelectedAddons(prev => [...prev, { name: addon.name, price: addon.price }]);
                              }
                            }}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${isSelected
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                              : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                            <div className="flex items-center gap-2">
                              <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'}`}>
                                {isSelected && <Check size={12} className="text-white" />}
                              </div>
                              <span className="text-sm font-medium">{addon.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-indigo-600">+৳{addon.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Special Note */}
                <div>
                  <h4 className="text-sm font-semibold text-slate-800 mb-2">Special Note</h4>
                  <input value={specialNote} onChange={e => setSpecialNote(e.target.value)}
                    placeholder="e.g. Less spicy, no onion..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none" />
                </div>

                {/* Quantity */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-800">Quantity</span>
                  <div className="flex items-center gap-3 bg-slate-100 rounded-xl p-1">
                    <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50">
                      <Minus size={14} />
                    </button>
                    <span className="text-lg font-bold w-8 text-center">{itemQuantity}</span>
                    <button onClick={() => setItemQuantity(itemQuantity + 1)}
                      className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center hover:bg-slate-50">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 border-t bg-slate-50">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-slate-500">Total</span>
                  <span className="text-xl font-bold text-indigo-600">
                    ৳{((getItemPrice() + getAddonsTotal()) * itemQuantity).toLocaleString()}
                  </span>
                </div>
                <button onClick={addToCart}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-200">
                  <ShoppingCart size={16} /> Add to Cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowPaymentModal(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 sm:w-full sm:max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden">
              <div className="p-5">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-lg font-bold text-slate-800">Payment</h3>
                  <button onClick={() => setShowPaymentModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-4 text-white mb-5">
                  <p className="text-sm text-indigo-100">Total Amount</p>
                  <p className="text-3xl font-bold">৳{cartTotal.toLocaleString()}</p>
                </div>

                <div className="mb-4">
                  <label className="text-sm font-medium text-slate-700 block mb-2">Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { v: 'cash', icon: Banknote, label: 'Cash' },
                      { v: 'card', icon: CreditCard, label: 'Card' },
                      { v: 'bkash', icon: Smartphone, label: 'bKash' }
                    ].map(m => (
                      <button key={m.v} onClick={() => setPaymentMethod(m.v)}
                        className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all ${paymentMethod === m.v
                          ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                          : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                        <m.icon size={20} />
                        <span className="text-xs font-medium">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {paymentMethod === 'cash' && (
                  <div className="mb-4">
                    <label className="text-sm font-medium text-slate-700 block mb-2">Received Amount</label>
                    <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-lg font-bold text-center focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none" />
                    {Number(paidAmount) > cartTotal && (
                      <div className="mt-2 bg-emerald-50 rounded-lg p-2 text-center">
                        <span className="text-sm text-emerald-600">Change: </span>
                        <span className="text-lg font-bold text-emerald-700">৳{(Number(paidAmount) - cartTotal).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-4 gap-1.5 mt-2">
                      {[50, 100, 500, 1000].map(v => (
                        <button key={v} onClick={() => setPaidAmount(v.toString())}
                          className="py-1.5 bg-slate-100 rounded-lg text-xs font-medium text-slate-600 hover:bg-slate-200">
                          ৳{v}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={handlePlaceOrder} disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-2">
                  {submitting ? 'Processing...' : <><Check size={16} /> Place Order</>}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Receipt Modal */}
      <AnimatePresence>
        {showReceipt && lastOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50" />
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 top-1/2 -translate-y-1/2 sm:w-full sm:max-w-sm bg-white rounded-2xl shadow-2xl z-50 overflow-hidden max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <Receipt size={18} className="text-emerald-500" /> Receipt
                </h3>
                <button onClick={() => setShowReceipt(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
                  <X size={18} />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-4">
                <div ref={receiptRef}>
                  <div className="center">
                    <div className="bold" style={{ fontSize: '14px' }}>{user?.organization?.name || 'Restaurant'}</div>
                    <div style={{ fontSize: '9px' }}>{user?.organization?.address || ''}</div>
                    <div style={{ fontSize: '9px' }}>{user?.organization?.phone || ''}</div>
                    <div className="line" />
                    <div className="bold">ORDER RECEIPT</div>
                    <div>#{lastOrder.orderNo}</div>
                    <div style={{ fontSize: '9px' }}>{new Date(lastOrder.createdAt).toLocaleString()}</div>
                    <div style={{ fontSize: '9px', textTransform: 'capitalize' }}>{lastOrder.orderType?.replace('_', ' ')} | {lastOrder.orderSource}</div>
                  </div>
                  {lastOrder.customerInfo?.name && (
                    <div style={{ fontSize: '10px', marginTop: '4px' }}>
                      Customer: {lastOrder.customerInfo.name} {lastOrder.customerInfo.phone ? `| ${lastOrder.customerInfo.phone}` : ''}
                    </div>
                  )}
                  {lastOrder.table && <div style={{ fontSize: '10px' }}>Table: {lastOrder.table.tableNo || lastOrder.table}</div>}
                  <div className="line" />
                  <table>
                    <thead><tr><td className="bold">Item</td><td className="bold center" style={{ width: '30px' }}>Qty</td><td className="bold right">Amt</td></tr></thead>
                    <tbody>
                      {lastOrder.items?.map((item, i) => (
                        <tr key={i}>
                          <td>
                            {item.name}
                            {item.variant && <div className="addon">({item.variant})</div>}
                            {item.addons?.map((a, j) => (
                              <div key={j} className="addon">+ {a.name} ৳{a.price}</div>
                            ))}
                          </td>
                          <td className="center">{item.quantity}</td>
                          <td className="right">৳{item.subtotal}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="line" />
                  <table>
                    <tbody>
                      <tr><td>Subtotal</td><td className="right">৳{lastOrder.subtotal}</td></tr>
                      {lastOrder.tax > 0 && <tr><td>Tax</td><td className="right">৳{lastOrder.tax}</td></tr>}
                      {lastOrder.serviceCharge > 0 && <tr><td>Service</td><td className="right">৳{lastOrder.serviceCharge}</td></tr>}
                      {lastOrder.discount > 0 && <tr><td>Discount</td><td className="right">-৳{lastOrder.discount}</td></tr>}
                    </tbody>
                  </table>
                  <div className="line" />
                  <table>
                    <tbody>
                      <tr className="total"><td>TOTAL</td><td className="right">৳{lastOrder.total?.toLocaleString()}</td></tr>
                      <tr><td style={{ textTransform: 'capitalize' }}>{lastOrder.paymentMethod}</td><td className="right">৳{lastOrder.paidAmount}</td></tr>
                      {lastOrder.changeAmount > 0 && <tr><td>Change</td><td className="right">৳{lastOrder.changeAmount}</td></tr>}
                    </tbody>
                  </table>
                  <div className="line" />
                  <div className="center" style={{ fontSize: '10px', marginTop: '4px' }}>Thank you! Visit again.</div>
                  <div className="center" style={{ fontSize: '8px', color: '#999', marginTop: '2px' }}>Powered by Foodie Paradise POS</div>
                </div>
              </div>

              <div className="p-4 border-t flex gap-2">
                <button onClick={handlePrintReceipt}
                  className="flex-1 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-200">
                  <Printer size={16} /> Print Receipt
                </button>
                <button onClick={() => setShowReceipt(false)}
                  className="px-4 py-2.5 bg-slate-100 text-slate-600 rounded-xl font-semibold text-sm hover:bg-slate-200">
                  Done
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Cart Panel Component (shared between desktop & mobile) */
const CartPanel = ({ cart, orderType, selectedTable, setSelectedTable, tables, customerInfo, setCustomerInfo, updateCartQuantity, removeFromCart, cartSubtotal, tax, serviceCharge, cartTotal, handleCheckout }) => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b bg-slate-50">
        <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
          <ShoppingCart size={16} className="text-indigo-600" /> Current Order
        </h3>
      </div>

      {/* Table Selection (Dine In) */}
      {orderType === 'dine_in' && (
        <div className="px-4 pt-3">
          <select value={selectedTable} onChange={e => setSelectedTable(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 outline-none bg-white">
            <option value="">Select Table</option>
            {tables.filter(t => t.status === 'available' || t._id === selectedTable).map(t => (
              <option key={t._id} value={t._id}>{t.tableNo} (Cap: {t.capacity})</option>
            ))}
          </select>
        </div>
      )}

      {/* Customer Info */}
      <div className="px-4 pt-3 space-y-2">
        <input value={customerInfo.name} onChange={e => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
          placeholder="Customer name" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 outline-none" />
        <input value={customerInfo.phone} onChange={e => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
          placeholder="Phone number" className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-indigo-400 outline-none" />
      </div>

      {/* Cart Items */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <AnimatePresence>
          {cart.map(item => (
            <motion.div key={item.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              className="bg-slate-50 rounded-xl p-3">
              <div className="flex items-start justify-between mb-1">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                  {item.variant && <p className="text-[10px] text-slate-500">{item.variant}</p>}
                  {item.addons?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {item.addons.map((a, j) => (
                        <span key={j} className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded-md">+{a.name}</span>
                      ))}
                    </div>
                  )}
                  {item.specialNote && <p className="text-[10px] text-amber-600 mt-0.5">{item.specialNote}</p>}
                </div>
                <button onClick={() => removeFromCart(item.id)} className="p-1 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 ml-1">
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 p-0.5">
                  <button onClick={() => updateCartQuantity(item.id, -1)} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-slate-100">
                    <Minus size={12} />
                  </button>
                  <span className="text-sm font-bold w-5 text-center">{item.quantity}</span>
                  <button onClick={() => updateCartQuantity(item.id, 1)} className="w-6 h-6 rounded-md flex items-center justify-center hover:bg-slate-100">
                    <Plus size={12} />
                  </button>
                </div>
                <span className="text-sm font-bold text-indigo-600">৳{item.subtotal.toLocaleString()}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {cart.length === 0 && (
          <div className="text-center py-12">
            <ShoppingCart size={32} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No items in cart</p>
            <p className="text-xs text-slate-300 mt-1">Tap a menu item to add</p>
          </div>
        )}
      </div>

      {/* Summary & Checkout */}
      <div className="border-t bg-white p-4 space-y-2">
        <div className="space-y-1 text-sm">
          <div className="flex justify-between text-slate-500"><span>Subtotal</span><span>৳{cartSubtotal.toLocaleString()}</span></div>
          <div className="flex justify-between text-slate-500"><span>Tax (5%)</span><span>৳{tax.toLocaleString()}</span></div>
          <div className="flex justify-between text-slate-500"><span>Service (3%)</span><span>৳{serviceCharge.toLocaleString()}</span></div>
          <div className="flex justify-between font-bold text-lg text-slate-800 pt-2 border-t border-dashed">
            <span>Total</span>
            <span className="text-indigo-600">৳{cartTotal.toLocaleString()}</span>
          </div>
        </div>
        <button onClick={handleCheckout} disabled={cart.length === 0}
          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold text-sm hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-200 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
          <CreditCard size={16} /> Checkout
        </button>
      </div>
    </div>
  );
};

export default POSPage;
