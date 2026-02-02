import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Activity, ShieldCheck, Truck, UserCheck, ArrowRight, Star, Stethoscope, BedDouble, Scissors, Heart, Microscope } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import VerificationBadge from '../components/VerificationBadge';

const categoryIcons = {
  'Diagnostic Equipment': Stethoscope,
  'Hospital Furniture': BedDouble,
  'Surgical Instruments': Scissors,
  'Patient Monitoring': Heart,
  'Lab Equipment': Microscope,
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [featuredReviews, setFeaturedReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes, reviewsRes] = await Promise.all([
        api.get('/products'),
        api.get('/categories'),
        api.get('/reviews/featured'),
      ]);
      
      setFeaturedProducts(productsRes.data.slice(0, 8));
      setCategories(categoriesRes.data);
      setFeaturedReviews(reviewsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    try {
      await api.post('/cart/add', {
        product_id: product.id,
        quantity: 1,
      });
      toast.success('Added to cart!', {
        description: product.name,
      });
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Please login to add items to cart');
      } else {
        toast.error('Failed to add to cart');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="home-page">
      {/* Hero Section */}
      <section className="hero-gradient py-16 md:py-24 relative overflow-hidden" data-testid="hero-section">
        {/* 3D Floating Medical Icons - Multiple layers for depth */}
        <div className="absolute inset-0 pointer-events-none">
          <Stethoscope className="medical-icon-float text-blue-400 opacity-20" style={{top: '10%', right: '15%', width: '80px', height: '80px', animationDelay: '0s', transform: 'rotate(15deg)'}} />
          <Heart className="medical-icon-float text-green-400 opacity-15" style={{bottom: '25%', left: '8%', width: '70px', height: '70px', animationDelay: '2s', transform: 'rotate(-20deg)'}} />
          <Activity className="medical-icon-float text-teal-400 opacity-20" style={{top: '35%', right: '5%', width: '65px', height: '65px', animationDelay: '4s', transform: 'rotate(10deg)'}} />
          <Scissors className="medical-icon-float text-blue-500 opacity-15" style={{top: '60%', left: '12%', width: '60px', height: '60px', animationDelay: '6s', transform: 'rotate(-15deg)'}} />
          <Microscope className="medical-icon-float text-green-500 opacity-20" style={{bottom: '15%', right: '20%', width: '75px', height: '75px', animationDelay: '8s', transform: 'rotate(25deg)'}} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 mb-6 animate-fade-in" data-testid="hero-title">
                Premium Medical Equipment for Healthcare Excellence
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed" data-testid="hero-description">
                Trusted by hospitals, clinics, and healthcare professionals across India. 
                Quality equipment with certified standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" data-testid="browse-products-button">
                  <Button size="lg" className="shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/bulk-order" data-testid="hero-bulk-enquiry-button">
                  <Button size="lg" variant="outline" className="hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 border-2">
                    Bulk Orders
                  </Button>
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="text-center trust-badge" data-testid="trust-badge-1">
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Certified</p>
                </div>
                <div className="text-center trust-badge" data-testid="trust-badge-2" style={{animationDelay: '0.1s'}}>
                  <div className="w-12 h-12 mx-auto mb-2 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Fast Delivery</p>
                </div>
                <div className="text-center trust-badge" data-testid="trust-badge-3" style={{animationDelay: '0.2s'}}>
                  <div className="w-12 h-12 mx-auto mb-2 bg-teal-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-6 w-6 text-teal-600" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">Verified Sellers</p>
                </div>
                <div className="text-center trust-badge" data-testid="trust-badge-4" style={{animationDelay: '0.3s'}}>
                  <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 rounded-full flex items-center justify-center">
                    <Activity className="h-6 w-6 text-blue-700" />
                  </div>
                  <p className="text-sm font-medium text-slate-700">24/7 Support</p>
                </div>
              </div>
            </div>
            
            <div className="hero-image-wrapper relative perspective-1000">
              {/* Multiple pulse rings for 3D effect */}
              <div className="pulse-ring" style={{width: '100%', height: '100%', top: '0', left: '0', animationDelay: '0s'}}></div>
              <div className="pulse-ring" style={{width: '100%', height: '100%', top: '0', left: '0', animationDelay: '1s'}}></div>
              
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                <img
                  src="https://images.unsplash.com/photo-1565594090530-d1ebc05b54b1?crop=entropy&cs=srgb&fm=jpg&q=85"
                  alt="Medical Equipment"
                  className="rounded-2xl shadow-2xl relative z-10"
                  data-testid="hero-image"
                  style={{
                    boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.25)',
                  }}
                />
                
                {/* 3D Floating badges */}
                <div className="absolute -top-4 -left-4 bg-white rounded-lg shadow-xl p-3 animate-bounce z-20" style={{animationDuration: '3s'}}>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">ISO Certified</p>
                      <p className="text-xs text-slate-600">Quality Assured</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg shadow-xl p-3 animate-bounce z-20" style={{animationDuration: '4s', animationDelay: '1s'}}>
                  <div className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <Truck className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">Free Shipping</p>
                      <p className="text-xs text-slate-600">On Bulk Orders</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4" data-testid="categories-title">
              Browse by Category
            </h2>
            <p className="text-slate-600">Find the right equipment for your healthcare facility</p>
          </div>
          
          <div className="category-scroll">
            <div className="flex gap-4 pb-4" style={{minWidth: 'max-content'}}>
              {categories.map((category, index) => {
                const IconComponent = categoryIcons[category] || Activity;
                return (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    className="category-card group bg-gradient-to-br from-blue-50 to-green-50 hover:from-blue-100 hover:to-green-100 border-2 border-blue-200 hover:border-blue-400 rounded-xl p-6 transition-all duration-300 hover:shadow-xl min-w-[220px] flex-shrink-0"
                    data-testid={`category-card-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <IconComponent className="h-10 w-10 text-blue-600 mx-auto mb-3 group-hover:scale-105 transition-transform duration-300" />
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors text-center">
                      {category}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 text-center">Explore products</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16" data-testid="featured-products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4" data-testid="featured-products-title">
              Featured Products
            </h2>
            <p className="text-slate-600">Top-quality medical equipment for professionals</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="featured-product" style={{animationDelay: `${index * 0.1}s`}}>
                <ProductCard
                  product={product}
                  onAddToCart={handleAddToCart}
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      {featuredReviews.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50" data-testid="reviews-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4" data-testid="reviews-title">
                What Our Customers Say
              </h2>
              <p className="text-slate-600">Trusted by healthcare professionals across India</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredReviews.map((review, index) => (
                <div
                  key={review.id}
                  className="bg-white border-2 border-blue-100 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 animate-fade-in"
                  data-testid={`review-card-${review.id}`}
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4 leading-relaxed">{review.comment}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{review.user?.name}</p>
                      {review.product && (
                        <p className="text-sm text-slate-500">{review.product.name}</p>
                      )}
                    </div>
                    {review.user && (
                      <VerificationBadge
                        verification_status={review.user.verification_status}
                        buyer_type={review.user.buyer_type}
                      />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 cta-section" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="cta-title">
            Need Bulk Orders?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Get special pricing for hospitals, clinics, and distributors. Contact us for custom quotes.
          </p>
          <Link to="/bulk-enquiry" data-testid="cta-bulk-enquiry-button">
            <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300">
              Request Bulk Quote
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;