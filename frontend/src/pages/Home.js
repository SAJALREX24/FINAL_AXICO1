import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Activity, ShieldCheck, Truck, UserCheck, ArrowRight, Star, Stethoscope, BedDouble, Scissors, Heart, Microscope, Building2, Users, Award, TrendingUp, CheckCircle2, Sparkles } from 'lucide-react';
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    fetchData();
    
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
      {/* Hero Section with 3D Animations */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-green-50 py-20 md:py-32 overflow-hidden" data-testid="hero-section">
        {/* Animated Background Shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-20 -right-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
            style={{ animationDelay: '0s' }}
          ></div>
          <div 
            className="absolute top-40 -left-20 w-96 h-96 bg-green-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
            style={{ animationDelay: '2s' }}
          ></div>
          <div 
            className="absolute -bottom-20 left-1/2 w-96 h-96 bg-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"
            style={{ animationDelay: '4s' }}
          ></div>
        </div>

        {/* Floating 3D Medical Icons */}
        <div className="absolute inset-0 pointer-events-none">
          {[Stethoscope, Heart, Activity, Microscope, Scissors, BedDouble].map((Icon, i) => {
            const positions = [
              { top: '10%', left: '5%' },
              { top: '20%', right: '8%' },
              { bottom: '30%', left: '3%' },
              { bottom: '20%', right: '10%' },
              { top: '50%', left: '2%' },
              { top: '60%', right: '5%' },
            ];
            return (
              <div
                key={i}
                className="absolute animate-float-slow"
                style={{
                  ...positions[i],
                  animationDelay: `${i * 0.7}s`,
                  transform: `translate(${mousePosition.x * (i % 2 ? 0.1 : -0.1)}px, ${mousePosition.y * (i % 2 ? 0.1 : -0.1)}px)`,
                  transition: 'transform 0.3s ease-out',
                }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center shadow-xl backdrop-blur-sm border border-white/50 hover:scale-110 transition-transform duration-300">
                  <Icon className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center px-4 py-2 bg-blue-100 rounded-full mb-6 animate-bounce-slow">
                <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-semibold text-blue-700">Trusted by 1000+ Healthcare Facilities</span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-slate-900 mb-6 leading-tight" data-testid="hero-title">
                Premium <span className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Medical Equipment</span> for Healthcare Excellence
              </h1>
              
              <p className="text-xl text-slate-600 mb-8 leading-relaxed" data-testid="hero-description">
                Quality equipment with certified standards. Fast delivery, verified sellers, and 24/7 support for hospitals, clinics, and healthcare professionals.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/products" data-testid="browse-products-button">
                  <Button size="lg" className="shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6">
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/bulk-order" data-testid="hero-bulk-enquiry-button">
                  <Button size="lg" variant="outline" className="border-2 border-blue-600 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105 text-lg px-8 py-6">
                    Get Bulk Quote
                  </Button>
                </Link>
              </div>
              
              {/* Trust Stats */}
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-1">1000+</div>
                  <div className="text-sm text-slate-600">Happy Clients</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">5000+</div>
                  <div className="text-sm text-slate-600">Products Sold</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600 mb-1">100%</div>
                  <div className="text-sm text-slate-600">ISO Certified</div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              {/* Hero Image without rotation */}
              <div className="relative">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1565594090530-d1ebc05b54b1?crop=entropy&cs=srgb&fm=jpg&q=85"
                    alt="Medical Equipment"
                    className="w-full h-full object-cover"
                    data-testid="hero-image"
                  />
                  {/* Overlay badges */}
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-slide-in-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-600">Certified</div>
                        <div className="text-sm font-bold text-slate-900">ISO 9001:2015</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl animate-slide-in-right">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                        <Truck className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-xs text-slate-600">Delivery</div>
                        <div className="text-sm font-bold text-slate-900">2-3 Days</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { icon: ShieldCheck, title: 'ISO Certified', desc: 'All products meet international standards', bgColor: 'from-blue-100 to-blue-200', iconColor: 'text-blue-600' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Express shipping on all orders', bgColor: 'from-green-100 to-green-200', iconColor: 'text-green-600' },
              { icon: UserCheck, title: 'Verified Sellers', desc: 'Trusted and verified suppliers', bgColor: 'from-teal-100 to-teal-200', iconColor: 'text-teal-600' },
              { icon: Activity, title: '24/7 Support', desc: 'Round-the-clock customer service', bgColor: 'from-blue-100 to-blue-200', iconColor: 'text-blue-600' },
            ].map((feature, i) => (
              <div 
                key={i} 
                className="group text-center p-6 rounded-2xl hover:bg-gradient-to-br hover:from-blue-50 hover:to-green-50 transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br ${feature.bgColor} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="categories-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4" data-testid="categories-title">
              Browse by Category
            </h2>
            <p className="text-xl text-slate-600">Find the right equipment for your healthcare facility</p>
          </div>
          
          <div className="category-scroll">
            <div className="flex gap-6 pb-4" style={{minWidth: 'max-content'}}>
              {categories.map((category, index) => {
                const IconComponent = categoryIcons[category] || Activity;
                return (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    className="category-card group bg-white hover:bg-gradient-to-br hover:from-blue-100 hover:to-green-100 border-2 border-slate-200 hover:border-blue-400 rounded-2xl p-8 transition-all duration-300 hover:shadow-2xl min-w-[240px] flex-shrink-0"
                    data-testid={`category-card-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-green-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <IconComponent className="h-8 w-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors text-center mb-2">
                      {category}
                    </h3>
                    <p className="text-sm text-slate-600 text-center">Explore products →</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white" data-testid="featured-products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4" data-testid="featured-products-title">
              Featured Products
            </h2>
            <p className="text-xl text-slate-600">Top-quality medical equipment for professionals</p>
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
          
          <div className="text-center mt-12">
            <Link to="/products">
              <Button size="lg" variant="outline" className="shadow-lg hover:shadow-xl">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-green-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why Healthcare Professionals Choose Us
            </h2>
            <p className="text-xl text-white/90">Join 1000+ satisfied healthcare facilities</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Award, title: 'Quality Assured', desc: 'All products are quality checked and certified' },
              { icon: TrendingUp, title: 'Best Prices', desc: 'Competitive pricing with bulk order discounts' },
              { icon: Users, title: 'Expert Support', desc: 'Dedicated support team for all your needs' },
            ].map((item, i) => (
              <div key={i} className="text-center text-white p-8 bg-white/10 backdrop-blur-sm rounded-2xl hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-2xl flex items-center justify-center">
                  <item.icon className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                <p className="text-white/90">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      {featuredReviews.length > 0 && (
        <section className="py-20 bg-white" data-testid="reviews-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-900 mb-4" data-testid="reviews-title">
                What Our Customers Say
              </h2>
              <p className="text-xl text-slate-600">Trusted by healthcare professionals across India</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredReviews.map((review, index) => (
                <div
                  key={review.id}
                  className="bg-gradient-to-br from-blue-50 to-green-50 border-2 border-blue-100 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  data-testid={`review-card-${review.id}`}
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-6 leading-relaxed text-lg">"{review.comment}"</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{review.user?.name}</p>
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
      <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6" data-testid="cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get special pricing for bulk orders. Our team will contact you within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/bulk-order" data-testid="cta-bulk-enquiry-button">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6">
                Request Bulk Quote
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/products">
              <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 shadow-xl transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6">
                Browse Products
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;