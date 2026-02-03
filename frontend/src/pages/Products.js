import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import { Filter } from 'lucide-react';
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
    <div className="min-h-screen py-8" data-testid="products-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2" data-testid="products-title">
            Medical Equipment
          </h1>
          <p className="text-sm sm:text-base text-slate-600">Browse our complete range of professional medical equipment</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
          {/* Filters Sidebar - Horizontal on mobile */}
          <aside className="lg:w-64 shrink-0" data-testid="filters-sidebar">
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-6">
              <div className="flex items-center mb-3 sm:mb-4">
                <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600 mr-2" />
                <h2 className="font-semibold text-slate-900 text-sm sm:text-base">Filters</h2>
              </div>
              
              {/* Category Filter - Horizontal scroll on mobile */}
              <div className="mb-4 sm:mb-6">
                <h3 className="text-xs sm:text-sm font-medium text-slate-900 mb-2 sm:mb-3">Category</h3>
                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0 -mx-2 px-2 lg:mx-0 lg:px-0">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`whitespace-nowrap px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm transition-colors flex-shrink-0 lg:w-full lg:text-left ${
                      selectedCategory === '' ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200 lg:bg-transparent'
                    }`}
                    data-testid="category-all"
                  >
                    All
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`whitespace-nowrap px-3 py-1.5 sm:py-2 rounded-md text-xs sm:text-sm transition-colors flex-shrink-0 lg:w-full lg:text-left ${
                        selectedCategory === category ? 'bg-primary text-white' : 'bg-slate-100 hover:bg-slate-200 lg:bg-transparent lg:hover:bg-slate-100'
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
                  className="w-full text-xs sm:text-sm h-8 sm:h-10"
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
                  <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-4 text-slate-600 text-sm sm:text-base">Loading products...</p>
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-12" data-testid="no-products-message">
                <p className="text-slate-600 text-base sm:text-lg">No products found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6" data-testid="products-grid">
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
  );
};

export default Products;