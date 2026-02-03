import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import WhatsAppButton from './components/WhatsAppButton';
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
        toastOptions={{
          style: {
            background: 'white',
            color: '#0F172A',
            border: '2px solid #3B82F6',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '14px',
            maxWidth: '350px',
          },
          success: {
            style: {
              border: '2px solid #10B981',
            },
            iconTheme: {
              primary: '#10B981',
              secondary: '#FFFFFF',
            },
          },
          error: {
            style: {
              border: '2px solid #EF4444',
            },
            iconTheme: {
              primary: '#EF4444',
              secondary: '#FFFFFF',
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
