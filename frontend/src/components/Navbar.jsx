import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { ShoppingCart, Heart, User as UserIcon, LogOut, Menu, X, Globe, Search } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { getCartCount } = useCart();
  const { toggleLanguage, t } = useLanguage();
  const navigate = useNavigate();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/marketplace?search=${searchQuery}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-md border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-extrabold text-saffron-500 tracking-wider font-outfit flex items-center">
                🕉️ <span className="text-saffron-600 ml-1">Puja</span><span className="text-gold-600">Setu</span>
              </span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search')}
                className="w-full pl-10 pr-4 py-2 rounded-full border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm bg-orange-50/30"
              />
              <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-saffron-500" />
            </form>
          </div>

          {/* Desktop Nav Actions */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors text-sm">
              {t('home')}
            </Link>
            <Link to="/pujas" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors text-sm">
              {t('pujas')}
            </Link>
            <Link to="/marketplace" className="text-gray-700 hover:text-saffron-600 font-medium transition-colors text-sm">
              {t('marketplace')}
            </Link>

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-gray-700 hover:text-saffron-600 text-sm font-medium focus:outline-none border border-orange-200 px-3 py-1 rounded-full bg-orange-50/20"
            >
              <Globe className="h-4 w-4 text-saffron-500" />
              <span>{t('language_toggle')}</span>
            </button>

            {/* Wishlist Link */}
            <Link to="/wishlist" className="relative p-2 text-gray-600 hover:text-crimson-600 transition-colors">
              <Heart className="h-6 w-6" />
            </Link>

            {/* Cart Link */}
            <Link to="/cart" className="relative p-2 text-gray-600 hover:text-saffron-600 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {getCartCount() > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-saffron-600 rounded-full">
                  {getCartCount()}
                </span>
              )}
            </Link>

            {/* User Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 text-gray-700 hover:text-saffron-600 font-medium text-sm focus:outline-none"
                >
                  <div className="h-8 w-8 rounded-full bg-saffron-100 flex items-center justify-center text-saffron-700 font-bold border border-saffron-200 uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'pandit' ? '/pandit-dashboard' : '/user-dashboard'}
                        onClick={() => setUserDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-saffron-700"
                      >
                        {t('dashboard')}
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full text-left flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-crimson-700"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>{t('logout')}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="bg-saffron-500 hover:bg-saffron-600 text-white font-semibold text-sm px-5 py-2 rounded-full transition-colors duration-200 shadow-sm"
              >
                {t('login')}
              </Link>
            )}

          </div>

          {/* Mobile Menu Icon */}
          <div className="flex items-center lg:hidden space-x-4">
            {/* Language Toggle (Mobile) */}
            <button
              onClick={toggleLanguage}
              className="flex items-center text-gray-700 hover:text-saffron-600 text-xs focus:outline-none border border-orange-200 px-2 py-1 rounded-full"
            >
              <Globe className="h-3.5 w-3.5 text-saffron-500 mr-1" />
              <span>{t('language_toggle')}</span>
            </button>

            {/* Cart (Mobile) */}
            <Link to="/cart" className="relative p-2 text-gray-600">
              <ShoppingCart className="h-5 w-5" />
              {getCartCount() > 0 && (
                <span className="absolute top-1.5 right-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white bg-saffron-600 rounded-full">
                  {getCartCount()}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-saffron-600 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-orange-100 px-4 pt-2 pb-4 space-y-3 shadow-inner">
          <form onSubmit={handleSearch} className="relative w-full mb-3">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-10 pr-4 py-2 rounded-full border border-orange-200 focus:outline-none text-sm bg-orange-50/30"
            />
            <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-saffron-500" />
          </form>

          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-saffron-600 font-medium py-2"
          >
            {t('home')}
          </Link>
          <Link
            to="/pujas"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-saffron-600 font-medium py-2"
          >
            {t('pujas')}
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-saffron-600 font-medium py-2"
          >
            {t('marketplace')}
          </Link>
          <Link
            to="/wishlist"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-gray-700 hover:text-crimson-600 font-medium py-2"
          >
            {t('wishlist')}
          </Link>

          {user ? (
            <div className="pt-2 border-t border-orange-100">
              <div className="font-bold text-gray-800 py-2">
                👤 {user.name} ({user.role})
              </div>
              <Link
                to={user.role === 'admin' ? '/admin-dashboard' : user.role === 'pandit' ? '/pandit-dashboard' : '/user-dashboard'}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-gray-600 hover:text-saffron-600 py-1.5 pl-4 text-sm"
              >
                {t('dashboard')}
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center space-x-2 text-crimson-600 hover:text-crimson-700 py-1.5 pl-4 text-sm mt-1"
              >
                <LogOut className="h-4 w-4" />
                <span>{t('logout')}</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-orange-100">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-center bg-saffron-500 hover:bg-saffron-600 text-white font-bold py-2 rounded-full mt-2"
              >
                {t('login')}
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
