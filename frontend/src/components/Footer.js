import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 text-purple-200 mt-0 relative overflow-hidden" data-testid="footer">
      {/* Background blur effects */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <img 
                src="https://customer-assets.emergentagent.com/job_alaxico-store/artifacts/ahkqpypd_Capture6.PNG" 
                alt="Alaxico Logo" 
                className="h-10 w-auto rounded-lg"
              />
              <span className="text-xl font-semibold text-white tracking-wide">ALAXICO</span>
            </div>
            <p className="text-sm leading-relaxed">
              Your Trusted Healthcare Partner. Quality medical equipment for hospitals, clinics, and healthcare professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-teal-400 transition-colors">Products</Link></li>
              <li><Link to="/bulk-order" className="hover:text-teal-400 transition-colors">Bulk Orders</Link></li>
              <li><Link to="/about" className="hover:text-teal-400 transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-teal-400 transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=Diagnostic Equipment" className="hover:text-teal-400 transition-colors">Diagnostic Equipment</Link></li>
              <li><Link to="/products?category=Hospital Furniture" className="hover:text-teal-400 transition-colors">Hospital Furniture</Link></li>
              <li><Link to="/products?category=Surgical Instruments" className="hover:text-teal-400 transition-colors">Surgical Instruments</Link></li>
              <li><Link to="/products?category=Patient Monitoring" className="hover:text-teal-400 transition-colors">Patient Monitoring</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 mt-0.5 text-teal-400" />
                <div>
                  <p>alaxicohealthcare@gmail.com</p>
                  <p className="text-xs text-purple-300">alaxicocustomer.care@gmail.com</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 mt-0.5 text-teal-400" />
                <span>+91 7617617178</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 text-teal-400" />
                <span>UG-6, Upperground, Rajnandini Plaza, Shastripuram Road, 282007</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-purple-700 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Alaxico Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;