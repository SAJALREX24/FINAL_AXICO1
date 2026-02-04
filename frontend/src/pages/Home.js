import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import RecentlyViewed from '../components/RecentlyViewed';
import HeroSlider from '../components/HeroSlider';
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div>
          <p className="mt-4 text-purple-200">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in" data-testid="home-page">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Trust Badges Section */}
      <section className="py-8 sm:py-12 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-indigo-600/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[
              { icon: ShieldCheck, title: 'ISO Certified', desc: 'Quality Assured', color: 'text-teal-400' },
              { icon: Truck, title: 'Fast Delivery', desc: 'Pan India', color: 'text-pink-400' },
              { icon: Award, title: 'Warranty', desc: 'On All Products', color: 'text-cyan-400' },
              { icon: UserCheck, title: '24/7 Support', desc: 'Expert Help', color: 'text-green-400' },
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-3 p-3 sm:p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${feature.color}`} />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-white">{feature.title}</h3>
                  <p className="text-xs sm:text-sm text-purple-200">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden" data-testid="categories-section">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-teal-500/10 rounded-full blur-2xl"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-white mb-2 sm:mb-4" data-testid="categories-title">
              Browse by <span className="text-teal-400">Category</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-purple-200">Find the right equipment for your healthcare facility</p>
          </div>
          
          <div className="category-scroll overflow-x-auto -mx-4 px-4">
            <div className="flex gap-3 sm:gap-4 lg:gap-6 pb-4" style={{minWidth: 'max-content'}}>
              {categories.map((category, index) => {
                const IconComponent = categoryIcons[category] || Activity;
                const categoryColors = {
                  'Diagnostic Equipment': 'bg-teal-500',
                  'Hospital Furniture': 'bg-pink-500',
                  'Surgical Instruments': 'bg-cyan-500',
                  'Patient Monitoring': 'bg-green-500',
                  'Lab Equipment': 'bg-orange-500',
                };
                const bgColor = categoryColors[category] || 'bg-teal-500';
                
                return (
                  <Link
                    key={category}
                    to={`/products?category=${category}`}
                    className="category-card group bg-white/10 backdrop-blur-sm hover:bg-white/20 border-2 border-white/20 hover:border-teal-400 rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-2xl hover:shadow-teal-500/10 min-w-[160px] sm:min-w-[200px] lg:min-w-[240px] flex-shrink-0"
                    data-testid={`category-card-${category.toLowerCase().replace(/\s+/g, '-')}`}
                    style={{animationDelay: `${index * 0.1}s`}}
                  >
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 mx-auto mb-3 sm:mb-4 ${bgColor} rounded-xl sm:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 lg:h-10 lg:w-10 text-white" />
                    </div>
                    <h3 className="text-sm sm:text-base lg:text-xl font-semibold text-white group-hover:text-teal-400 transition-colors text-center mb-1 sm:mb-2">
                      {category}
                    </h3>
                    <p className="text-xs sm:text-sm text-purple-200 text-center hidden sm:block">Explore products →</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-12 sm:py-16 lg:py-20 bg-white" data-testid="featured-products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#374151] mb-4" data-testid="featured-products-title">
              Featured <span className="text-purple-600">Products</span>
            </h2>
            <p className="text-xl text-[#6B7280]">Top-quality medical equipment for professionals</p>
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
              <Button size="lg" className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl">
                View All Products
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed Products */}
      <RecentlyViewed />

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/20 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-semibold text-white mb-4">
              Why Healthcare Professionals <span className="text-teal-400">Choose Us</span>
            </h2>
            <p className="text-xl text-purple-200">Join 1000+ satisfied healthcare facilities</p>
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
                <h3 className="text-2xl font-semibold mb-3">{item.title}</h3>
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
              <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-[#374151] mb-4" data-testid="reviews-title">
                What Our Customers Say
              </h2>
              <p className="text-xl text-[#6B7280]">Trusted by healthcare professionals across India</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredReviews.map((review, index) => (
                <div
                  key={review.id}
                  className="bg-[#F5F3FF] border-2 border-[#E9D5FF] rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                  data-testid={`review-card-${review.id}`}
                  style={{animationDelay: `${index * 0.15}s`}}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${i < review.rating ? 'text-[#FACC15] fill-[#FACC15]' : 'text-[#E5E7EB]'}`}
                      />
                    ))}
                  </div>
                  <p className="text-[#374151] mb-6 leading-relaxed text-lg">&ldquo;{review.comment}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#374151]">{review.user?.name}</p>
                      {review.product && (
                        <p className="text-sm text-[#6B7280]">{review.product.name}</p>
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
      <section className="py-20 bg-[#374151]" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-semibold text-white mb-6" data-testid="cta-title">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Get special pricing for bulk orders. Our team will contact you within 24 hours.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/bulk-order" data-testid="cta-bulk-enquiry-button">
              <Button size="lg" className="bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-2xl hover:shadow-white/20 transform hover:scale-105 transition-all duration-300 text-lg px-8 py-6">
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