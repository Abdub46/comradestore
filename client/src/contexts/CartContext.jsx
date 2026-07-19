import React, { createContext, useContext, useState, useEffect } from 'react';

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

  const addToCart = (product) => {
    setItems((prev) => {
      if (prev.some((item) => item._id === product._id)) return prev;
      return [...prev, product];
    });
  };

  const removeFromCart = (productId) => {
    setItems((prev) => prev.filter((item) => item._id !== productId));
  };

  const clearCart = () => setItems([]);

  const isInCart = (productId) => items.some((item) => item._id === productId);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, clearCart, isInCart }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
