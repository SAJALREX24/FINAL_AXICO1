import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-16" data-testid="footer">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Package className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-white">MedEquipMart</span>
            </div>
            <p className="text-sm">
              Your trusted partner for quality medical equipment. Serving hospitals, clinics, and healthcare professionals.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link to="/bulk-enquiry" className="hover:text-white transition-colors">Bulk Orders</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-white font-semibold mb-4">Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=Diagnostic Equipment" className="hover:text-white transition-colors">Diagnostic Equipment</Link></li>
              <li><Link to="/products?category=Hospital Furniture" className="hover:text-white transition-colors">Hospital Furniture</Link></li>
              <li><Link to="/products?category=Surgical Instruments" className="hover:text-white transition-colors">Surgical Instruments</Link></li>
              <li><Link to="/products?category=Patient Monitoring" className="hover:text-white transition-colors">Patient Monitoring</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start space-x-2">
                <Mail className="h-5 w-5 mt-0.5" />
                <span>support@medequipmart.com</span>
              </li>
              <li className="flex items-start space-x-2">
                <Phone className="h-5 w-5 mt-0.5" />
                <span>+91 90456 60485</span>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 mt-0.5" />
                <span>Mumbai, Maharashtra, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2026 MedEquipMart. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;