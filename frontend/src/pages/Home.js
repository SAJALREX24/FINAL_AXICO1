import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Activity, ShieldCheck, Truck, UserCheck, ArrowRight, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import VerificationBadge from '../components/VerificationBadge';

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
      toast.success('Added to cart!');
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
      <section className="hero-gradient py-16 md:py-24" data-testid="hero-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-slate-900 mb-6" data-testid="hero-title">
                Premium Medical Equipment for Healthcare Excellence
              </h1>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed" data-testid="hero-description">
                Trusted by hospitals, clinics, and healthcare professionals across India. 
                Quality equipment with certified standards.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/products" data-testid="browse-products-button">
                  <Button size="lg" className="shadow-md">
                    Browse Products
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/bulk-enquiry" data-testid="hero-bulk-enquiry-button">
                  <Button size="lg" variant="outline">
                    Bulk Orders
                  </Button>
                </Link>
              </div>
              
              {/* Trust Badges */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="text-center" data-testid="trust-badge-1">
                  <ShieldCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Certified</p>
                </div>
                <div className="text-center" data-testid="trust-badge-2">
                  <Truck className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Fast Delivery</p>
                </div>
                <div className="text-center" data-testid="trust-badge-3">
                  <UserCheck className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">Verified Sellers</p>
                </div>
                <div className="text-center" data-testid="trust-badge-4">
                  <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="text-sm font-medium text-slate-700">24/7 Support</p>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1565594090530-d1ebc05b54b1?crop=entropy&cs=srgb&fm=jpg&q=85"
                alt="Medical Equipment"
                className="rounded-xl shadow-2xl"
                data-testid="hero-image"
              />
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
          
          <div className="category-bento">
            {categories.map((category) => (
              <Link
                key={category}
                to={`/products?category=${category}`}
                className="group bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-200 rounded-xl p-6 transition-all duration-300 hover:shadow-lg"
                data-testid={`category-card-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-primary transition-colors">
                  {category}
                </h3>
                <p className="text-sm text-slate-600 mt-2">Explore products</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16" data-testid="featured-products-section">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4" data-testid="featured-products-title">
                Featured Products
              </h2>
              <p className="text-slate-600">Top-quality medical equipment for professionals</p>
            </div>
            <Link to="/products" data-testid="view-all-products-link">
              <Button variant="outline">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews */}
      {featuredReviews.length > 0 && (
        <section className="py-16 bg-white" data-testid="reviews-section">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 mb-4" data-testid="reviews-title">
                What Our Customers Say
              </h2>
              <p className="text-slate-600">Trusted by healthcare professionals across India</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-6"
                  data-testid={`review-card-${review.id}`}
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
      <section className="py-16 bg-gradient-to-r from-primary to-secondary" data-testid="cta-section">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4" data-testid="cta-title">
            Need Bulk Orders?
          </h2>
          <p className="text-lg text-white/90 mb-8">
            Get special pricing for hospitals, clinics, and distributors. Contact us for custom quotes.
          </p>
          <Link to="/bulk-enquiry" data-testid="cta-bulk-enquiry-button">
            <Button size="lg" variant="secondary" className="shadow-lg">
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