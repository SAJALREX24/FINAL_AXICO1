import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, User, Menu, Search, Package, X, Home, Grid, FileText, 
  LogOut, Settings, ChevronDown, Phone, Mail, Stethoscope, BedDouble, 
  Scissors, Heart, Microscope, Truck, ShieldCheck, HeadphonesIcon, MapPin
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { getMedicalAvatar } from '../utils/avatars';

const CATEGORIES = [
  { 
    name: 'Diagnostic Equipment', 
    icon: Stethoscope, 
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'ECG, BP Monitors, Thermometers',
    link: '/products?category=Diagnostic%20Equipment'
  },
  { 
    name: 'Hospital Furniture', 
    icon: BedDouble, 
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Beds, Tables, Wheelchairs',
    link: '/products?category=Hospital%20Furniture'
  },
  { 
    name: 'Surgical Instruments', 
    icon: Scissors, 
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Scalpels, Forceps, Scissors',
    link: '/products?category=Surgical%20Instruments'
  },
  { 
    name: 'Patient Monitoring', 
    icon: Heart, 
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    description: 'Pulse Oximeters, Monitors',
    link: '/products?category=Patient%20Monitoring'
  },
  { 
    name: 'Lab Equipment', 
    icon: Microscope, 
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    description: 'Microscopes, Centrifuges',
    link: '/products?category=Lab%20Equipment'
  },
];

const Navbar = ({ cartCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    logout();
    await new Promise(resolve => setTimeout(resolve, 50));
    navigate('/');
    setIsLoggingOut(false);
    setMobileMenuOpen(false);
  };

  const userAvatar = user ? getMedicalAvatar(user.id, user.email) : null;
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Main Navbar */}
      <nav className="bg-white border-b border-purple-100 sticky top-0 z-50 shadow-sm" data-testid="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0" data-testid="logo-link">
              <img 
                src="https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/ahkqpypd_Capture6.PNG" 
                alt="Alaxico Logo" 
                className="h-10 lg:h-12 w-auto rounded-lg"
              />
              <div className="hidden sm:block">
                <span className="text-xl lg:text-2xl font-semibold text-purple-700 tracking-wide">ALAXICO</span>
                <p className="text-[10px] text-gray-500 -mt-1">Trusted Healthcare Partner</p>
              </div>
            </Link>

            {/* Desktop Search Bar */}
            <form onSubmit={handleSearch} className="hidden lg:flex flex-1 max-w-xl mx-8">
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for medical equipment..."
                  className="w-full h-11 px-5 pr-12 text-sm border-2 border-purple-100 rounded-full focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none transition-all bg-purple-50/50 text-gray-700 placeholder:text-gray-400"
                  data-testid="search-input"
                />
                <button 
                  type="submit" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </form>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {/* Categories Dropdown */}
              <div 
                className="relative"
                onMouseEnter={() => setShowCategoryDropdown(true)}
                onMouseLeave={() => setShowCategoryDropdown(false)}
              >
                <button 
                  className="flex items-center px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                  data-testid="categories-dropdown-trigger"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Categories
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-purple-100 py-2 z-50 animate-fade-in">
                    {CATEGORIES.map((category) => (
                      <Link
                        key={category.name}
                        to={category.link}
                        onClick={() => setShowCategoryDropdown(false)}
                        className="flex items-center px-4 py-3 hover:bg-purple-50 transition-colors group"
                        data-testid={`category-dropdown-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                          <category.icon className={`w-5 h-5 ${category.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-purple-700 transition-colors">
                            {category.name}
                          </p>
                          <p className="text-xs text-gray-500">{category.description}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-purple-100 mt-2 pt-2 px-4">
                      <Link 
                        to="/products" 
                        onClick={() => setShowCategoryDropdown(false)}
                        className="flex items-center justify-center py-2 text-purple-600 font-medium hover:text-purple-700 transition-colors"
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                to="/products" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                data-testid="products-nav-link"
              >
                All Products
              </Link>
              
              <Link 
                to="/bulk-order" 
                className="px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
                data-testid="bulk-order-nav-link"
              >
                Bulk Orders
              </Link>

              {/* Contact */}
              <a 
                href="tel:+917617617178"
                className="flex items-center px-4 py-2 text-gray-700 hover:text-purple-600 font-medium transition-colors"
              >
                <HeadphonesIcon className="w-4 h-4 mr-2" />
                Support
              </a>
            </div>

            {/* Right Side Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Mobile Search Button */}
              <Link 
                to="/products" 
                className="lg:hidden p-2 text-gray-600 hover:text-purple-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2" data-testid="cart-link">
                <ShoppingCart className="h-6 w-6 text-gray-600 hover:text-purple-600 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              <div className="hidden sm:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 focus:outline-none group" data-testid="user-menu-trigger">
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-purple-200 shadow-md group-hover:border-purple-400 transition-all group-hover:shadow-lg">
                          <img src={userAvatar} alt={user.name || 'User'} className="h-full w-full object-cover" />
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-purple-600 transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-72 p-0 rounded-2xl shadow-2xl border border-purple-100 overflow-hidden">
                      {/* User Header */}
                      <div className="px-4 py-4 bg-gradient-to-br from-purple-600 to-purple-700 text-white">
                        <div className="flex items-center gap-3">
                          <div className="h-14 w-14 rounded-full overflow-hidden border-3 border-white/30 shadow-lg">
                            <img src={userAvatar} alt={user.name || 'User'} className="h-full w-full object-cover" />
                          </div>
                          <div>
                            <p className="font-semibold text-lg">{user.name}</p>
                            <p className="text-sm text-purple-200 truncate max-w-[160px]">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Quick Stats */}
                      <div className="flex border-b border-purple-100 bg-purple-50/50">
                        <div className="flex-1 text-center py-3 border-r border-purple-100">
                          <p className="text-lg font-bold text-purple-600">{cartCount || 0}</p>
                          <p className="text-xs text-gray-500">Cart Items</p>
                        </div>
                        <div className="flex-1 text-center py-3">
                          <p className="text-lg font-bold text-purple-600">●</p>
                          <p className="text-xs text-gray-500">{user.role === 'admin' ? 'Admin' : 'Member'}</p>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-2">
                        <DropdownMenuItem 
                          onClick={() => navigate('/dashboard')} 
                          className="px-4 py-3 cursor-pointer hover:bg-purple-50 focus:bg-purple-50 mx-2 rounded-lg"
                          data-testid="dashboard-menu-item"
                        >
                          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <User className="w-4 h-4 text-purple-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">My Dashboard</span>
                            <p className="text-xs text-gray-500">View profile & settings</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/dashboard?tab=orders')}
                          className="px-4 py-3 cursor-pointer hover:bg-purple-50 focus:bg-purple-50 mx-2 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <Package className="w-4 h-4 text-green-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">My Orders</span>
                            <p className="text-xs text-gray-500">Track your orders</p>
                          </div>
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => navigate('/cart')}
                          className="px-4 py-3 cursor-pointer hover:bg-purple-50 focus:bg-purple-50 mx-2 rounded-lg"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <ShoppingCart className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Shopping Cart</span>
                            <p className="text-xs text-gray-500">{cartCount || 0} items in cart</p>
                          </div>
                        </DropdownMenuItem>
                        {user.role === 'admin' && (
                          <DropdownMenuItem 
                            onClick={() => navigate('/admin')} 
                            className="px-4 py-3 cursor-pointer hover:bg-purple-50 focus:bg-purple-50 mx-2 rounded-lg"
                            data-testid="admin-menu-item"
                          >
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                              <Settings className="w-4 h-4 text-orange-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Admin Panel</span>
                              <p className="text-xs text-gray-500">Manage store</p>
                            </div>
                          </DropdownMenuItem>
                        )}
                      </div>
                      
                      {/* Logout */}
                      <div className="border-t border-purple-100 p-2">
                        <DropdownMenuItem 
                          onClick={handleLogout} 
                          className="px-4 py-3 cursor-pointer hover:bg-red-50 focus:bg-red-50 rounded-lg mx-0 text-red-600" 
                          data-testid="logout-menu-item"
                        >
                          <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                            <LogOut className="w-4 h-4 text-red-600" />
                          </div>
                          <span className="font-medium">Sign Out</span>
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/login">
                    <Button className="bg-purple-600 text-white hover:bg-purple-700 font-medium">
                      Login
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-2 text-gray-600 hover:text-purple-600"
                data-testid="mobile-menu-button"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Category Bar */}
        <div className="lg:hidden border-t border-purple-100 overflow-x-auto bg-purple-50/50">
          <div className="flex px-4 py-2 space-x-1" style={{ minWidth: 'max-content' }}>
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="flex items-center px-3 py-1.5 bg-white hover:bg-purple-100 rounded-full text-xs font-medium text-gray-700 transition-colors whitespace-nowrap border border-purple-100"
              >
                <category.icon className="w-3 h-3 mr-1 text-purple-600" />
                {category.name.split(' ')[0]}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu - Full Screen Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden bg-white" data-testid="mobile-menu-overlay">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-purple-100 bg-purple-50">
            <Link to="/" onClick={closeMobileMenu} className="flex items-center space-x-2">
              <img 
                src="https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/ahkqpypd_Capture6.PNG" 
                alt="Alaxico Logo" 
                className="h-10 w-auto rounded-lg"
              />
              <span className="text-xl font-semibold text-purple-700">ALAXICO</span>
            </Link>
            <button 
              onClick={closeMobileMenu} 
              className="p-2 text-gray-600 hover:text-gray-800 rounded-full hover:bg-purple-100 transition-colors"
              data-testid="close-mobile-menu"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="overflow-y-auto h-[calc(100vh-72px)]">
            {/* User Info */}
            {user && (
              <div className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                <div className="flex items-center space-x-3">
                  <div className="h-14 w-14 rounded-full overflow-hidden border-2 border-white/50 shadow-lg">
                    <img src={userAvatar} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">{user.name}</p>
                    <p className="text-sm text-purple-100 truncate max-w-[200px]">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-purple-100">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-12 px-4 pr-12 text-base bg-purple-50 border border-purple-200 rounded-xl focus:border-purple-400 outline-none text-gray-700 placeholder:text-gray-400"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-purple-600">
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="py-4 border-b border-purple-100">
              <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Categories</p>
              <div className="grid grid-cols-2 gap-2 px-4">
                {CATEGORIES.map((category) => (
                  <Link
                    key={category.name}
                    to={category.link}
                    onClick={closeMobileMenu}
                    className="flex items-center p-3 bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors"
                  >
                    <div className={`w-8 h-8 ${category.bgColor} rounded-lg flex items-center justify-center mr-2`}>
                      <category.icon className={`w-4 h-4 ${category.color}`} />
                    </div>
                    <span className="text-sm font-medium text-gray-800 truncate">{category.name.split(' ')[0]}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-4">
              <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Menu</p>
              <MobileMenuItemFull icon={Home} label="Home" onClick={() => { navigate('/'); closeMobileMenu(); }} />
              <MobileMenuItemFull icon={Grid} label="All Products" onClick={() => { navigate('/products'); closeMobileMenu(); }} />
              <MobileMenuItemFull icon={FileText} label="Bulk Orders" onClick={() => { navigate('/bulk-order'); closeMobileMenu(); }} />
              <MobileMenuItemFull icon={ShoppingCart} label="Shopping Cart" badge={cartCount} onClick={() => { navigate('/cart'); closeMobileMenu(); }} />
              
              {user ? (
                <>
                  <div className="my-3 mx-4 border-t border-purple-100"></div>
                  <p className="px-4 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</p>
                  <MobileMenuItemFull icon={User} label="My Dashboard" onClick={() => { navigate('/dashboard'); closeMobileMenu(); }} />
                  {user.role === 'admin' && (
                    <MobileMenuItemFull icon={Settings} label="Admin Panel" onClick={() => { navigate('/admin'); closeMobileMenu(); }} />
                  )}
                  <MobileMenuItemFull icon={LogOut} label="Sign Out" onClick={handleLogout} className="text-red-600" />
                </>
              ) : (
                <>
                  <div className="my-3 mx-4 border-t border-purple-100"></div>
                  <div className="px-4 py-2">
                    <Link to="/login" onClick={closeMobileMenu}>
                      <Button className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-base">
                        Login / Sign Up
                      </Button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div className="p-4 mt-auto border-t border-purple-100 bg-purple-50">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wider mb-3">Contact Us</p>
              <a href="tel:+917617617178" className="flex items-center text-sm text-gray-700 mb-3 p-2 bg-white rounded-lg">
                <Phone className="w-4 h-4 mr-3 text-purple-600" />
                +91 7617617178
              </a>
              <a href="mailto:alaxicohealthcare@gmail.com" className="flex items-center text-sm text-gray-700 p-2 bg-white rounded-lg">
                <Mail className="w-4 h-4 mr-3 text-purple-600" />
                alaxicohealthcare@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MobileMenuItemFull = ({ icon: Icon, label, badge, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-4 hover:bg-purple-50 transition-colors ${className}`}
  >
    <div className="flex items-center space-x-4">
      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
        <Icon className="h-5 w-5 text-purple-600" />
      </div>
      <span className="font-medium text-gray-900 text-base">{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-purple-600 text-white text-xs rounded-full h-6 w-6 flex items-center justify-center font-medium">
        {badge}
      </span>
    )}
  </button>
);

export default Navbar;
