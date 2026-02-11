import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
import PromoBanner from './components/PromoBanner';
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Auth from './pages/Auth';
import AuthCallback from './pages/AuthCallback';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import BulkOrder from './pages/BulkOrder';
import api from './utils/api';
import '@/App.css';

// Component to handle auth callback detection
function AppRouter({ cartCount }) {
  const location = useLocation();
  
  // Check URL fragment for session_id (Google OAuth callback)
  // This check happens synchronously during render to prevent race conditions
  if (location.hash?.includes('session_id=')) {
    return <AuthCallback />;
  }

  return (
    <div className="App">
      <Navbar cartCount={cartCount} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/register" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/bulk-order" element={<BulkOrder />} />
      </Routes>
      <Footer />
      <WhatsAppButton />
      <Toaster 
        position="bottom-right"
        expand={true}
        richColors={true}
        closeButton={true}
        duration={4000}
        toastOptions={{
          style: {
            background: 'white',
            color: '#1F2937',
            padding: '16px 20px',
            borderRadius: '16px',
            fontSize: '14px',
            fontWeight: '500',
            maxWidth: '420px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            border: '1px solid #E5E7EB',
          },
          className: 'toast-custom',
          success: {
            style: {
              background: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
              border: '1px solid #10B981',
              color: '#065F46',
            },
            icon: '✓',
          },
          error: {
            style: {
              background: 'linear-gradient(135deg, #FEF2F2 0%, #FECACA 100%)',
              border: '1px solid #EF4444',
              color: '#991B1B',
            },
            icon: '✕',
          },
          warning: {
            style: {
              background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
              border: '1px solid #F59E0B',
              color: '#92400E',
            },
          },
          info: {
            style: {
              background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
              border: '1px solid #3B82F6',
              color: '#1E40AF',
            },
          },
        }}
      />
    </div>
  );
}

function AppContent() {
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const fetchCartCount = async () => {
      try {
        const response = await api.get('/cart');
        setCartCount(response.data.items?.length || 0);
      } catch (error) {
        // User not logged in or error fetching cart
      }
    };
    fetchCartCount();

    // Update cart count every 5 seconds
    const interval = setInterval(fetchCartCount, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <BrowserRouter>
      <AppRouter cartCount={cartCount} />
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
