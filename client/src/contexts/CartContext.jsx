import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// The "cart" here is not a checkout cart - there's no payment flow.
// It's a shortlist of items the buyer wants to message sellers about,
// stored locally in the browser.
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = localStorage.getItem('cart');
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // useCallback here gives these functions a stable reference across
  // re-renders. Without it, every ProductCard in a grid would receive a
  // "new" onAddToCart prop whenever ANY cart change happened anywhere,
  // defeating the React.memo on ProductCard and re-rendering the entire
  // grid every time. The functional setState form below means these never
  // need `items` in their dependency array, so they're stable for the
  // lifetime of the app.
  const addToCart = useCallback((product) => {
    setItems((prev) => {
      if (prev.some((item) => item._id === product._id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeFromCart = useCallback((productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const isInCart = useCallback((productId) => items.some((item) => item._id === productId), [items]);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
