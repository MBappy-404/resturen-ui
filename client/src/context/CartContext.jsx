import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addItem = useCallback((item) => {
    setItems(prev => {
      const key = `${item._id}-${item.variant || ''}-${JSON.stringify(item.addons || [])}`;
      const existing = prev.find(i => `${i._id}-${i.variant || ''}-${JSON.stringify(i.addons || [])}` === key);
      if (existing) {
        return prev.map(i => `${i._id}-${i.variant || ''}-${JSON.stringify(i.addons || [])}` === key ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1, cartKey: key }];
    });
  }, []);

  const removeItem = useCallback((cartKey) => {
    setItems(prev => prev.filter(i => i.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.cartKey !== cartKey));
      return;
    }
    setItems(prev => prev.map(i => i.cartKey === cartKey ? { ...i, quantity } : i));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const { totalItems, subtotal } = useMemo(() => ({
    totalItems: items.reduce((s, i) => s + i.quantity, 0),
    subtotal: items.reduce((s, i) => {
      const addonsTotal = (i.addons || []).reduce((a, addon) => a + (addon.price || 0), 0);
      return s + ((i.price || i.unitPrice) + addonsTotal) * i.quantity;
    }, 0)
  }), [items]);

  return (
    <CartContext.Provider value={{ items, totalItems, subtotal, addItem, removeItem, updateQuantity, clearCart, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be within CartProvider');
  return context;
};
