import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, HelpCircle, Scale, Building2, Handshake, Store } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-purple-50 border-t border-purple-100 text-gray-600 mt-0" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 sm:gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/ahkqpypd_Capture6.PNG" 
                alt="Alaxico Logo" 
                className="h-10 w-auto rounded-lg"
              />
              <span className="text-xl font-semibold text-purple-700 tracking-wide">ALAXICO</span>
            </div>
            <p className="text-sm leading-relaxed text-gray-500">
              Your Trusted Healthcare Partner. Quality medical equipment for hospitals, clinics, and home care.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-purple-700 font-semibold mb-4 text-sm sm:text-base">Quick Links</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/products" className="hover:text-purple-600 transition-colors">Products</Link></li>
              <li><Link to="/bulk-order" className="hover:text-purple-600 transition-colors">Bulk Orders</Link></li>
              <li><Link to="/quiz" className="hover:text-purple-600 transition-colors">Find Equipment</Link></li>
              <li><Link to="/compare" className="hover:text-purple-600 transition-colors">Compare Products</Link></li>
            </ul>
          </div>

          {/* Business */}
          <div>
            <h3 className="text-purple-700 font-semibold mb-4 text-sm sm:text-base">For Business</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/b2b" className="hover:text-purple-600 transition-colors">B2B Solutions</Link></li>
              <li><Link to="/partner" className="hover:text-purple-600 transition-colors">Partner Program</Link></li>
              <li><Link to="/stores" className="hover:text-purple-600 transition-colors">Store Locator</Link></li>
              <li><Link to="/bulk-order" className="hover:text-purple-600 transition-colors">Distributor</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-purple-700 font-semibold mb-4 text-sm sm:text-base">Categories</h3>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li><Link to="/products?category=Diagnostic%20Equipment" className="hover:text-purple-600 transition-colors">Diagnostic</Link></li>
              <li><Link to="/products?category=Hospital%20Furniture" className="hover:text-purple-600 transition-colors">Hospital Furniture</Link></li>
              <li><Link to="/products?category=Surgical%20Instruments" className="hover:text-purple-600 transition-colors">Surgical</Link></li>
              <li><Link to="/products?category=Patient%20Monitoring" className="hover:text-purple-600 transition-colors">Monitoring</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-purple-700 font-semibold mb-4 text-sm sm:text-base">Contact Us</h3>
            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-purple-600 flex-shrink-0" />
                <span className="break-all">alaxicohealthcare@gmail.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-purple-600 flex-shrink-0" />
                <span>+91 7617617178</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mt-0.5 text-purple-600 flex-shrink-0" />
                <span className="text-xs">UG-6, Rajnandini Plaza, Shastripuram Road</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-purple-200 mt-8 pt-8 text-center text-xs sm:text-sm text-gray-500">
          <p>&copy; 2026 Alaxico Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;