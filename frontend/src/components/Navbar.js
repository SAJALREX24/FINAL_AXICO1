import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, User, Menu, Search, Package, X, Home, Grid, FileText, 
  LogOut, Settings, ChevronDown, Phone, Mail, Stethoscope, BedDouble, 
  Scissors, Heart, Microscope, Truck, ShieldCheck, HeadphonesIcon
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
      <nav className="bg-purple-700 sticky top-0 z-50 shadow-lg" data-testid="main-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0" data-testid="logo-link">
              <img 
                src="https://static.prod-images.emergentagent.com/jobs/6cf4d218-daa4-4ddd-a299-e0a623bdb977/images/9d54be2805d41704c5b8ed1f0bd08c1bac66d11cd19481cc94c6248a8a5a753d.png" 
                alt="Alaxico Logo" 
                className="h-10 lg:h-12 w-auto"
              />
              <div className="hidden sm:block">
                <span className="text-xl lg:text-2xl font-bold text-white tracking-wide">ALAXICO</span>
                <p className="text-[10px] text-purple-200 -mt-1">Trusted Healthcare Partner</p>
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
                  className="w-full h-11 px-5 pr-12 text-sm border-2 border-purple-300 rounded-full focus:border-white focus:ring-2 focus:ring-white/20 outline-none transition-all bg-white/95"
                  data-testid="search-input"
                />
                <button 
                  type="submit" 
                  className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-800 transition-colors"
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
                  className="flex items-center px-4 py-2 text-white hover:text-purple-200 font-medium transition-colors"
                  data-testid="categories-dropdown-trigger"
                >
                  <Grid className="w-4 h-4 mr-2" />
                  Categories
                  <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showCategoryDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Dropdown Menu */}
                {showCategoryDropdown && (
                  <div className="absolute top-full left-0 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-fade-in">
                    {CATEGORIES.map((category) => (
                      <Link
                        key={category.name}
                        to={category.link}
                        className="flex items-center px-4 py-3 hover:bg-purple-50 transition-colors group"
                        data-testid={`category-dropdown-${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div className={`w-10 h-10 ${category.bgColor} rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform`}>
                          <category.icon className={`w-5 h-5 ${category.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-purple-700 transition-colors">
                            {category.name}
                          </p>
                          <p className="text-xs text-slate-500">{category.description}</p>
                        </div>
                      </Link>
                    ))}
                    <div className="border-t border-slate-100 mt-2 pt-2 px-4">
                      <Link 
                        to="/products" 
                        className="flex items-center justify-center py-2 text-purple-700 font-medium hover:text-purple-800 transition-colors"
                      >
                        View All Products →
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              <Link 
                to="/products" 
                className="px-4 py-2 text-white hover:text-purple-200 font-medium transition-colors"
                data-testid="products-nav-link"
              >
                All Products
              </Link>
              
              <Link 
                to="/bulk-order" 
                className="px-4 py-2 text-white hover:text-purple-200 font-medium transition-colors"
                data-testid="bulk-order-nav-link"
              >
                Bulk Orders
              </Link>

              {/* Contact */}
              <a 
                href="tel:+917617617178"
                className="flex items-center px-4 py-2 text-white hover:text-purple-200 font-medium transition-colors"
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
                className="lg:hidden p-2 text-white hover:text-purple-200 transition-colors"
              >
                <Search className="h-5 w-5" />
              </Link>

              {/* Cart */}
              <Link to="/cart" className="relative p-2" data-testid="cart-link">
                <ShoppingCart className="h-6 w-6 text-white hover:text-purple-200 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-purple-700 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu - Desktop */}
              <div className="hidden sm:block">
                {user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center space-x-2 focus:outline-none" data-testid="user-menu-trigger">
                        <div className="h-10 w-10 rounded-full overflow-hidden border-2 border-white shadow-md hover:border-purple-200 transition-colors">
                          <img src={userAvatar} alt={user.name || 'User'} className="h-full w-full object-cover" />
                        </div>
                        <ChevronDown className="w-4 h-4 text-white" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <div className="px-3 py-2 border-b border-slate-100">
                        <p className="font-medium text-slate-900">{user.name}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                      <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="dashboard-menu-item">
                        <User className="w-4 h-4 mr-2" />
                        My Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => navigate('/cart')}>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        My Cart
                      </DropdownMenuItem>
                      {user.role === 'admin' && (
                        <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="admin-menu-item">
                          <Settings className="w-4 h-4 mr-2" />
                          Admin Panel
                        </DropdownMenuItem>
                      )}
                      <div className="border-t border-slate-100 mt-1 pt-1">
                        <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="logout-menu-item">
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </DropdownMenuItem>
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link to="/login">
                    <Button className="bg-white text-purple-700 hover:bg-purple-100 font-semibold">
                      Login
                    </Button>
                  </Link>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="lg:hidden p-2 text-white hover:text-purple-200"
                data-testid="mobile-menu-button"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Category Bar */}
        <div className="lg:hidden border-t border-purple-600 overflow-x-auto bg-purple-600">
          <div className="flex px-4 py-2 space-x-1" style={{ minWidth: 'max-content' }}>
            {CATEGORIES.map((category) => (
              <Link
                key={category.name}
                to={category.link}
                className="flex items-center px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-full text-xs font-medium text-white transition-colors whitespace-nowrap"
              >
                <category.icon className="w-3 h-3 mr-1 text-white" />
                {category.name.split(' ')[0]}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={closeMobileMenu}></div>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl overflow-y-auto">
            <div className="p-4 border-b border-purple-600 bg-purple-700">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">Menu</span>
                <button onClick={closeMobileMenu} className="p-2 text-white/80 hover:text-white">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* User Info */}
            {user && (
              <div className="p-4 bg-purple-50 border-b border-slate-200">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-purple-400">
                    <img src={userAvatar} alt={user.name} className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{user.name}</p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Search */}
            <div className="p-4 border-b border-slate-200">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-10 px-4 pr-10 text-sm border border-slate-200 rounded-lg focus:border-purple-500 outline-none"
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="h-5 w-5" />
                </button>
              </form>
            </div>

            {/* Categories */}
            <div className="py-2">
              <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Categories</p>
              {CATEGORIES.map((category) => (
                <Link
                  key={category.name}
                  to={category.link}
                  onClick={closeMobileMenu}
                  className="flex items-center px-4 py-3 hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-8 h-8 ${category.bgColor} rounded-lg flex items-center justify-center mr-3`}>
                    <category.icon className={`w-4 h-4 ${category.color}`} />
                  </div>
                  <span className="font-medium text-slate-900">{category.name}</span>
                </Link>
              ))}
            </div>

            {/* Menu Items */}
            <div className="py-2 border-t border-slate-200">
              <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</p>
              <MobileMenuItem icon={Home} label="Home" onClick={() => { navigate('/'); closeMobileMenu(); }} />
              <MobileMenuItem icon={Grid} label="All Products" onClick={() => { navigate('/products'); closeMobileMenu(); }} />
              <MobileMenuItem icon={FileText} label="Bulk Orders" onClick={() => { navigate('/bulk-order'); closeMobileMenu(); }} />
              <MobileMenuItem icon={ShoppingCart} label="Cart" badge={cartCount} onClick={() => { navigate('/cart'); closeMobileMenu(); }} />
              
              {user ? (
                <>
                  <div className="my-2 border-t border-slate-200"></div>
                  <MobileMenuItem icon={User} label="My Dashboard" onClick={() => { navigate('/dashboard'); closeMobileMenu(); }} />
                  {user.role === 'admin' && (
                    <MobileMenuItem icon={Settings} label="Admin Panel" onClick={() => { navigate('/admin'); closeMobileMenu(); }} />
                  )}
                  <MobileMenuItem icon={LogOut} label="Logout" onClick={handleLogout} className="text-red-600" />
                </>
              ) : (
                <>
                  <div className="my-2 border-t border-slate-200"></div>
                  <div className="p-4">
                    <Link to="/login" onClick={closeMobileMenu}>
                      <Button className="w-full bg-purple-700 hover:bg-purple-800">Login / Sign Up</Button>
                    </Link>
                  </div>
                </>
              )}
            </div>

            {/* Contact Info */}
            <div className="p-4 border-t border-slate-200 bg-purple-50">
              <p className="text-xs font-semibold text-purple-700 uppercase tracking-wider mb-3">Contact Us</p>
              <a href="tel:+917617617178" className="flex items-center text-sm text-slate-700 mb-2">
                <Phone className="w-4 h-4 mr-2 text-purple-600" />
                +91 7617617178
              </a>
              <a href="mailto:alaxicohealthcare@gmail.com" className="flex items-center text-sm text-slate-700">
                <Mail className="w-4 h-4 mr-2 text-purple-600" />
                alaxicohealthcare@gmail.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const MobileMenuItem = ({ icon: Icon, label, badge, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between px-4 py-3 hover:bg-purple-50 transition-colors ${className}`}
  >
    <div className="flex items-center space-x-3">
      <Icon className="h-5 w-5 text-slate-500" />
      <span className="font-medium text-slate-900">{label}</span>
    </div>
    {badge > 0 && (
      <span className="bg-purple-700 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
        {badge}
      </span>
    )}
  </button>
);

export default Navbar;
