import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Stethoscope, Heart, Shield, Activity } from 'lucide-react';
import { toast } from 'sonner';

const Auth = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await login(email, password);
        toast.success('Login successful!');
      } else {
        await register(name, email, password, phone);
        toast.success('Registration successful!');
      }
      
      const redirect = searchParams.get('redirect') || '/';
      navigate(redirect);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const handleGoogleLogin = () => {
    const redirectUrl = window.location.origin + '/auth/callback';
    window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" data-testid="auth-page">
      {/* Purple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        {/* Organic Blob Shapes */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-2xl"></div>
        <div className="absolute bottom-1/4 right-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl"></div>
      </div>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-12">
        <div className="max-w-lg text-center">
          {/* Floating Medical Icons */}
          <div className="relative mb-8">
            <div className="absolute -top-4 -left-8 w-16 h-16 bg-teal-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce" style={{animationDuration: '3s'}}>
              <Stethoscope className="w-8 h-8 text-teal-400" />
            </div>
            <div className="absolute -top-8 right-0 w-14 h-14 bg-pink-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce" style={{animationDuration: '2.5s', animationDelay: '0.5s'}}>
              <Heart className="w-7 h-7 text-pink-400" />
            </div>
            <div className="absolute -bottom-4 left-1/4 w-12 h-12 bg-cyan-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center animate-bounce" style={{animationDuration: '2.8s', animationDelay: '1s'}}>
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="absolute bottom-0 right-1/4 w-14 h-14 bg-green-500/20 backdrop-blur-sm rounded-2xl flex items-center justify-center animate-bounce" style={{animationDuration: '3.2s', animationDelay: '0.3s'}}>
              <Activity className="w-7 h-7 text-green-400" />
            </div>
            
            {/* Main Logo */}
            <div className="w-32 h-32 mx-auto bg-white/10 backdrop-blur-md rounded-3xl flex items-center justify-center border border-white/20 shadow-2xl">
              <img 
                src="https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/ahkqpypd_Capture6.PNG" 
                alt="Alaxico Logo" 
                className="h-20 w-auto"
              />
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-white mb-4">
            Your Trusted <span className="text-teal-400">Healthcare</span> Partner
          </h1>
          <p className="text-lg text-purple-200 mb-8">
            Quality medical equipment for hospitals, clinics, and healthcare professionals across India.
          </p>
          
          {/* Trust Indicators */}
          <div className="flex justify-center space-x-8 text-white/80">
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">1000+</div>
              <div className="text-sm">Happy Clients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">5000+</div>
              <div className="text-sm">Products</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-400">24/7</div>
              <div className="text-sm">Support</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/ahkqpypd_Capture6.PNG" 
                alt="Alaxico Logo" 
                className="h-12 w-auto"
              />
              <span className="text-2xl font-semibold text-white">ALAXICO</span>
            </Link>
          </div>

          {/* Form Card */}
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/20">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2" data-testid="auth-title">
                {isLogin ? 'Welcome Back' : 'Create Account'}
              </h2>
              <p className="text-purple-200">
                {isLogin ? 'Sign in to your account' : 'Sign up to get started'}
              </p>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              className="w-full mb-6 h-12 bg-white text-gray-700 hover:bg-gray-100 font-medium"
              onClick={handleGoogleLogin}
              data-testid="google-login-button"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-purple-200">or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-white font-medium">Full Name *</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-teal-400 focus:ring-teal-400/20"
                    placeholder="Enter your name"
                    data-testid="name-input"
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="email" className="text-white font-medium">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-teal-400 focus:ring-teal-400/20"
                  placeholder="Enter your email"
                  data-testid="email-input"
                />
              </div>
              
              <div>
                <Label htmlFor="password" className="text-white font-medium">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-teal-400 focus:ring-teal-400/20"
                  placeholder="Enter your password"
                  data-testid="password-input"
                />
              </div>
              
              {!isLogin && (
                <div>
                  <Label htmlFor="phone" className="text-white font-medium">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder:text-purple-300 focus:border-teal-400 focus:ring-teal-400/20"
                    placeholder="+91 XXXXX XXXXX"
                    data-testid="phone-input"
                  />
                </div>
              )}
              
              <Button
                type="submit"
                className="w-full h-12 bg-teal-500 hover:bg-teal-600 text-white font-semibold text-lg shadow-lg shadow-teal-500/30"
                disabled={loading}
                data-testid="auth-submit-button"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
              </Button>
            </form>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
                data-testid="toggle-auth-mode-button"
              >
                {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
              </button>
            </div>
          </div>

          {/* Back to Home */}
          <div className="mt-6 text-center">
            <Link to="/" className="text-purple-200 hover:text-white transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
