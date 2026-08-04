import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { HomeIcon, GridIcon, PlusIcon, CartIcon, UserIcon } from './icons';

// Mobile-only floating bottom nav. "Chats" from the original brief was
// dropped per instruction (chat system removed, WhatsApp contact stays as
// the only messaging path) - Cart takes that slot instead, since it's a
// real, existing feature.
export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const { items } = useCart();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrolledUp = currentScrollY < lastScrollY.current;

      // Hidden while scrolling up, shown while scrolling down (as requested).
      setHidden(scrolledUp && currentScrollY > 0);

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;
  const tabClass = (path) =>
    `flex flex-col items-center gap-0.5 text-[11px] ${
      isActive(path) ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500'
    }`;

  return (
    <motion.nav
      animate={{ y: hidden ? '100%' : '0%' }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white dark:bg-gray-800 border-t dark:border-gray-700 shadow-[0_-4px_16px_-4px_rgba(0,0,0,0.1)]"
    >
      <div className="relative flex items-center justify-around h-16 px-2">
        <Link to="/" className={tabClass('/')}>
          <HomeIcon className="h-5 w-5" />
          Home
        </Link>

        <Link to="/search" className={tabClass('/search')}>
          <GridIcon className="h-5 w-5" />
          Categories
        </Link>

        {/* Sell - elevated above the bar, matching the brief */}
        <Link to={user ? '/sell' : '/login'} className="flex flex-col items-center -mt-8" aria-label="Sell an item">
          <span className="h-14 w-14 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg border-4 border-white dark:border-gray-800">
            <PlusIcon className="h-6 w-6" />
          </span>
        </Link>

        <Link to="/cart" className={`relative ${tabClass('/cart')}`}>
          <CartIcon className="h-5 w-5" />
          {items.length > 0 && (
            <span className="absolute -top-1 right-1 bg-yellow-400 text-primary-800 text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {items.length}
            </span>
          )}
          Cart
        </Link>

        <Link to={user ? '/profile' : '/login'} className={tabClass('/profile')}>
          {user ? (
            <img src={user.avatar} alt={user.firstName} className="h-5 w-5 rounded-full object-cover" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
          Profile
        </Link>
      </div>
    </motion.nav>
  );
}