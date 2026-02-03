import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Menu, Search, Package } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { getMedicalAvatar } from '../utils/avatars';

const Navbar = ({ cartCount = 0 }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    
    // Clear auth state first
    logout();
    
    // Small delay to allow React to process state change
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Navigate to home
    navigate('/');
    setIsLoggingOut(false);
  };

  // Get medical avatar for logged-in user
  const userAvatar = user ? getMedicalAvatar(user.id, user.email) : null;

  return (
    <nav className="glass-nav sticky top-0 z-50" data-testid="main-navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" data-testid="logo-link">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-slate-900">MedEquipMart</span>
          </Link>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search medical equipment..."
                className="w-full h-10 px-4 pr-10 text-sm border border-slate-200 rounded-md focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none"
                data-testid="search-input"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                data-testid="search-button"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              to="/products"
              className="hidden md:block text-slate-600 hover:text-slate-900 font-medium transition-colors"
              data-testid="products-nav-link"
            >
              Products
            </Link>
            
            <Link to="/bulk-order" data-testid="bulk-enquiry-button">
              <Button variant="default" size="sm" className="hidden md:flex bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                Bulk Enquiry
              </Button>
            </Link>

            <Link to="/cart" className="relative" data-testid="cart-link">
              <ShoppingCart className="h-6 w-6 text-slate-600 hover:text-slate-900 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center" data-testid="cart-count">
                  {cartCount}
                </span>
              )}
            </Link>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none" data-testid="user-menu-trigger">
                    <div className="h-9 w-9 rounded-full overflow-hidden border-2 border-blue-400 shadow-md hover:border-blue-500 transition-colors">
                      <img 
                        src={userAvatar} 
                        alt={user.name || 'User'} 
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = `<div class="h-full w-full bg-primary text-white flex items-center justify-center font-bold">${user.name?.charAt(0)?.toUpperCase() || 'U'}</div>`;
                        }}
                      />
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => navigate('/dashboard')} data-testid="dashboard-menu-item">
                    Dashboard
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} data-testid="admin-menu-item">
                      Admin Panel
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleLogout} data-testid="logout-menu-item">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login" data-testid="login-link">
                <Button variant="ghost" size="sm">
                  <User className="h-5 w-5 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;