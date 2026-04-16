import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Header() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
      setSearch('');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <header className="bg-primary-700 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <span className="text-2xl">🛒</span>
            <span className="font-bold text-xl tracking-tight">eGROCERY</span>
          </Link>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-xl hidden sm:flex">
            <div className="flex w-full rounded-lg overflow-hidden shadow-sm">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search for products, brands..."
                className="flex-1 px-4 py-2 text-gray-800 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-primary-500 hover:bg-primary-400 px-4 py-2 transition-colors font-medium"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex items-center gap-3 ml-auto">
            {/* Cart icon */}
            <Link
              to="/cart"
              className="relative flex items-center gap-1 hover:text-primary-200 transition-colors"
              aria-label="Shopping cart"
            >
              <span className="text-2xl">🛍️</span>
              {cart.itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.itemCount > 99 ? '99+' : cart.itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 hover:text-primary-200 transition-colors"
                >
                  <span className="text-lg">👤</span>
                  <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                  <span className="text-xs">▼</span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 text-gray-800 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/orders"
                      className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    {user.role === 'ADMINISTRATOR' && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-primary-600 font-medium"
                        onClick={() => setMenuOpen(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="text-sm hover:text-primary-200 transition-colors hidden sm:block"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-primary-700 text-sm px-3 py-1.5 rounded-lg font-medium hover:bg-primary-50 transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <form onSubmit={handleSearch} className="flex sm:hidden mt-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="flex-1 px-3 py-2 text-gray-800 rounded-l-lg focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="bg-primary-500 hover:bg-primary-400 px-4 py-2 rounded-r-lg transition-colors text-sm font-medium"
          >
            Go
          </button>
        </form>
      </div>

      {/* Click outside to close menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
      )}
    </header>
  );
}
