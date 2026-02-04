import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#374151] text-gray-300 mt-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <li><Link to="/products" className="hover:text-[#2563EB] transition-colors">Products</Link></li>
              <li><Link to="/bulk-order" className="hover:text-[#2563EB] transition-colors">Bulk Orders</Link></li>
              <li><Link to="/about" className="hover:text-[#2563EB] transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-[#2563EB] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=Diagnostic Equipment" className="hover:text-[#2563EB] transition-colors">Diagnostic Equipment</Link></li>
              <li><Link to="/products?category=Hospital Furniture" className="hover:text-[#2563EB] transition-colors">Hospital Furniture</Link></li>
              <li><Link to="/products?category=Surgical Instruments" className="hover:text-[#2563EB] transition-colors">Surgical Instruments</Link></li>
              <li><Link to="/products?category=Patient Monitoring" className="hover:text-[#2563EB] transition-colors">Patient Monitoring</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 mt-0.5 text-[#2563EB]" />
                <div>
                  <p>alaxicohealthcare@gmail.com</p>
                  <p className="text-xs text-gray-400">alaxicocustomer.care@gmail.com</p>
                </div>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 mt-0.5 text-[#2563EB]" />
                <span>+91 7617617178</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5 text-[#2563EB]" />
                <span>UG-6, Upperground, Rajnandini Plaza, Shastripuram Road, 282007</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 Alaxico Healthcare. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;