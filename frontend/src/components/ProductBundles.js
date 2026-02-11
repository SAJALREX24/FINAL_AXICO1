import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Percent, Star, ArrowRight, ShoppingCart, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

const PRODUCT_BUNDLES = [
  {
    id: 'home-healthcare',
    name: 'Home Healthcare Bundle',
    description: 'Complete home care essentials',
    originalPrice: 4999,
    bundlePrice: 2999,
    discount: 40,
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400',
    products: [
      'Piston Compressor Nebulizer',
      'Digital BP Monitor',
      'Digital Thermometer',
    ],
    tag: 'Best Seller',
    tagColor: 'bg-green-500'
  },
  {
    id: 'clinic-starter',
    name: 'Clinic Starter Kit',
    description: 'Essential equipment for new clinics',
    originalPrice: 8999,
    bundlePrice: 5499,
    discount: 39,
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400',
    products: [
      'Stethoscope Premium',
      'BP Monitor Professional',
      'Pulse Oximeter',
      'Digital Thermometer',
    ],
    tag: 'Popular',
    tagColor: 'bg-purple-500'
  },
  {
    id: 'respiratory-care',
    name: 'Respiratory Care Combo',
    description: 'Complete respiratory solution',
    originalPrice: 3999,
    bundlePrice: 2499,
    discount: 38,
    image: 'https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400',
    products: [
      'Piston Compressor Nebulizer',
      'Steam Vaporizer',
      'Extra Masks & Tubes',
    ],
    tag: 'Limited Offer',
    tagColor: 'bg-red-500'
  },
  {
    id: 'pain-relief',
    name: 'Pain Relief Bundle',
    description: 'Natural pain management kit',
    originalPrice: 1999,
    bundlePrice: 1299,
    discount: 35,
    image: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=400',
    products: [
      'Electric Hot Water Bag',
      'Natural Rubber Hot Water Bag',
      'Heating Pad',
    ],
    tag: 'New',
    tagColor: 'bg-blue-500'
  },
];

const ProductBundles = () => {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-purple-50 via-white to-purple-50" data-testid="product-bundles-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center px-4 py-2 bg-purple-100 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-700">Save Big with Combos</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-gray-900 mb-2 sm:mb-4">
            Product <span className="text-purple-600">Bundles</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-500">
            Get more value with our specially curated combo deals
          </p>
        </div>

        {/* Bundle Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {PRODUCT_BUNDLES.map((bundle, index) => (
            <div
              key={bundle.id}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-purple-100 overflow-hidden transition-all duration-300 hover:-translate-y-1"
              data-testid={`bundle-card-${bundle.id}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image with tag */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={bundle.image}
                  alt={bundle.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                
                {/* Tag */}
                <span className={`absolute top-3 left-3 ${bundle.tagColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                  {bundle.tag}
                </span>
                
                {/* Discount Badge */}
                <div className="absolute top-3 right-3 bg-white rounded-full px-3 py-1 shadow-lg">
                  <span className="text-sm font-bold text-green-600">{bundle.discount}% OFF</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-5">
                <h3 className="text-lg font-semibold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">
                  {bundle.name}
                </h3>
                <p className="text-sm text-gray-500 mb-3">{bundle.description}</p>

                {/* Products List */}
                <div className="space-y-1 mb-4">
                  {bundle.products.slice(0, 3).map((product, idx) => (
                    <div key={idx} className="flex items-center text-xs text-gray-600">
                      <span className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2" />
                      {product}
                    </div>
                  ))}
                  {bundle.products.length > 3 && (
                    <p className="text-xs text-purple-600 font-medium">
                      +{bundle.products.length - 3} more items
                    </p>
                  )}
                </div>

                {/* Pricing */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-gray-400 line-through">₹{bundle.originalPrice.toLocaleString()}</p>
                    <p className="text-xl font-bold text-purple-600">₹{bundle.bundlePrice.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">
                    Save ₹{(bundle.originalPrice - bundle.bundlePrice).toLocaleString()}
                  </div>
                </div>

                {/* CTA Button */}
                <Link to={`/products?bundle=${bundle.id}`}>
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add Bundle
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* View All Bundles */}
        <div className="text-center mt-8 sm:mt-12">
          <Link to="/products?view=bundles">
            <Button variant="outline" size="lg" className="border-purple-300 text-purple-600 hover:bg-purple-50">
              View All Bundles
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductBundles;
