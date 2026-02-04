import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Filter, Package, Stethoscope } from 'lucide-react';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

const Products = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategory) params.category = selectedCategory;
      if (searchQuery) params.search = searchQuery;
      
      const response = await api.get('/products', { params });
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
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

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="products-page">
      {/* Purple Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/30 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl mb-4 border border-white/20">
              <Package className="h-8 w-8 text-teal-400" />
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2" data-testid="products-title">
              Medical <span className="text-teal-400">Equipment</span>
            </h1>
            <p className="text-purple-200">Browse our complete range of professional medical equipment</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Filters Sidebar */}
            <aside className="lg:w-64 shrink-0" data-testid="filters-sidebar">
              <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-5">
                <div className="flex items-center mb-4">
                  <Filter className="h-5 w-5 text-teal-400 mr-2" />
                  <h2 className="font-semibold text-white">Filters</h2>
                </div>
                
                {/* Category Filter */}
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-purple-200 mb-3">Category</h3>
                  <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                    <button
                      onClick={() => setSelectedCategory('')}
                      className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0 ${
                        selectedCategory === '' 
                          ? 'bg-teal-500 text-white' 
                          : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                      data-testid="category-all"
                    >
                      All Products
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`whitespace-nowrap px-4 py-2 rounded-xl text-sm transition-colors flex-shrink-0 ${
                          selectedCategory === category 
                            ? 'bg-teal-500 text-white' 
                            : 'bg-white/10 text-white hover:bg-white/20'
                        }`}
                        data-testid={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
                
                {selectedCategory && (
                  <Button
                    variant="outline"
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => setSelectedCategory('')}
                    data-testid="clear-filters-button"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400 mx-auto"></div>
                    <p className="mt-4 text-purple-200">Loading products...</p>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12 bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20" data-testid="no-products-message">
                  <Stethoscope className="h-16 w-16 text-purple-300 mx-auto mb-4" />
                  <p className="text-white text-lg">No products found</p>
                  <p className="text-purple-200 mt-2">Try adjusting your filters</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" data-testid="products-grid">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;
