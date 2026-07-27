import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';
import { BellIcon, CartIcon } from './icons';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="sticky top-0 z-20 bg-primary-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        {/* Logo: "Campus" in white, "Market" in yellow - yellow is used
            nowhere else in the UI, only here in the logo, per the brief. */}
        <Link to="/" className="text-xl font-bold whitespace-nowrap">
          <span className="text-white">Campus</span>
          <span className="text-yellow-400">Market</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-yellow-300">Home</Link>
          <Link to="/search" className="hover:text-yellow-300">Browse</Link>
          {user && <Link to="/sell" className="hover:text-yellow-300">Sell Item</Link>}
          {user && <Link to="/dashboard" className="hover:text-yellow-300">Dashboard</Link>}
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={toggleDarkMode}
            aria-label="Toggle dark mode"
            className="text-lg"
            title="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

          {/* Notification bell - visual placeholder for now. Real unread
              counts need a notification system, which isn't built yet;
              showing a fake badge number here would be misleading, so this
              stays a plain icon until that feature exists. */}
          <button
            aria-label="Notifications"
            title="Notifications"
            className="relative text-white/90 hover:text-white"
          >
            <BellIcon className="h-5 w-5" />
          </button>

          <Link to="/cart" className="relative text-white/90 hover:text-white" title="Cart">
            <CartIcon className="h-5 w-5" />
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-yellow-400 text-primary-800 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" title={user.firstName}>
                <img
                  src={user.avatar}
                  alt={user.firstName}
                  className="h-8 w-8 rounded-full object-cover border-2 border-white/40"
                />
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-md bg-white/10 hover:bg-white/20"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm px-3 py-1.5 rounded-md hover:bg-white/10"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded-md bg-white text-primary-700 font-semibold hover:bg-primary-50"
              >
                Sign Up
              </Link>
            </div>
          )}

          {/* Hamburger toggle - only visible below the md breakpoint */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="md:hidden text-2xl leading-none"
          >
            {mobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu - only rendered below the md breakpoint */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-white/10 overflow-hidden bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          >
            <div className="px-4 py-2 flex flex-col divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium">
              <Link to="/" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Home</Link>
              <Link to="/search" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Browse</Link>
              {user && <Link to="/sell" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Sell Item</Link>}
              {user && <Link to="/dashboard" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Dashboard</Link>}

              {user ? (
                <>
                  <Link to="/profile" onClick={closeMobileMenu} className="py-3 flex items-center gap-2 hover:text-primary-600">
                    <img
                      src={user.avatar}
                      alt={user.firstName}
                      className="h-6 w-6 rounded-full object-cover"
                    />
                    {user.firstName} (Profile)
                  </Link>
                  <div className="py-3">
                    <button
                      onClick={handleLogout}
                      className="text-left px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 w-fit"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : (
                <div className="py-3 flex items-center gap-2">
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    onClick={closeMobileMenu}
                    className="px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700"
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
