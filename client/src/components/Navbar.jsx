import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useTheme } from '../contexts/ThemeContext';

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
    <nav className="sticky top-0 z-20 bg-white dark:bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="text-xl font-bold text-primary-700 dark:text-primary-100">
          CampusMarket
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link to="/" className="hover:text-primary-600">Home</Link>
          <Link to="/search" className="hover:text-primary-600">Browse</Link>
          {user && <Link to="/sell" className="hover:text-primary-600">Sell Item</Link>}
          {user && <Link to="/dashboard" className="hover:text-primary-600">Dashboard</Link>}
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

          <Link to="/cart" className="relative text-lg" title="Cart">
            🛒
            {items.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-primary-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {items.length}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden md:flex items-center gap-3">
              <Link to="/profile" className="text-sm font-medium hover:text-primary-600">
                {user.firstName}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 rounded-md bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-2">
              <Link
                to="/login"
                className="text-sm px-3 py-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm px-3 py-1.5 rounded-md bg-primary-600 text-white hover:bg-primary-700"
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
      {mobileMenuOpen && (
        <div className="md:hidden border-t dark:border-gray-700 px-4 py-2 flex flex-col divide-y divide-gray-200 dark:divide-gray-700 text-sm font-medium bg-white dark:bg-gray-800">
          <Link to="/" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Home</Link>
          <Link to="/search" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Browse</Link>
          {user && <Link to="/sell" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Sell Item</Link>}
          {user && <Link to="/dashboard" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">Dashboard</Link>}

          {user ? (
            <>
              <Link to="/profile" onClick={closeMobileMenu} className="py-3 hover:text-primary-600">
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
      )}


    </nav>
  );
}
