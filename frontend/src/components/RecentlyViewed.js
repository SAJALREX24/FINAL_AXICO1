import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowRight, X } from 'lucide-react';
import { Button } from './ui/button';
import useRecentlyViewed from '../hooks/useRecentlyViewed';

const RecentlyViewed = () => {
  const { recentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50" data-testid="recently-viewed-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900" data-testid="recently-viewed-title">
                Recently Viewed
              </h2>
              <p className="text-slate-600 text-sm">Products you've browsed recently</p>
            </div>
          </div>
          <button
            onClick={clearRecentlyViewed}
            className="text-sm text-slate-500 hover:text-red-500 flex items-center space-x-1 transition-colors"
            data-testid="clear-recently-viewed"
          >
            <X className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>

        <div className="overflow-x-auto pb-4 -mx-4 px-4">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {recentlyViewed.map((product, index) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex-shrink-0 w-[200px]"
                data-testid={`recently-viewed-item-${index}`}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?w=200&q=80';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-slate-900 text-sm line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-primary font-bold mt-1">
                    ₹{product.price?.toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="text-center mt-6">
          <Link to="/products">
            <Button variant="outline" size="sm" className="text-slate-600 hover:text-blue-600">
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default RecentlyViewed;
