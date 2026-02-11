import React, { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Search, Store, Wrench, Building2, ChevronDown, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';

const STORES = [
  {
    id: 1,
    name: 'Alaxico Delhi - Head Office',
    type: 'head_office',
    address: 'Plot No. 15, Sector 44, Gurugram, Haryana 122003',
    phone: '+91 7617617178',
    email: 'delhi@alaxico.com',
    hours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    services: ['Sales', 'Service Center', 'Demo Room'],
    coordinates: { lat: 28.4595, lng: 77.0266 },
    city: 'Delhi NCR'
  },
  {
    id: 2,
    name: 'Alaxico Mumbai',
    type: 'showroom',
    address: '203, Trade Center, BKC, Mumbai, Maharashtra 400051',
    phone: '+91 9876543210',
    email: 'mumbai@alaxico.com',
    hours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    services: ['Sales', 'Demo Room'],
    coordinates: { lat: 19.0596, lng: 72.8556 },
    city: 'Mumbai'
  },
  {
    id: 3,
    name: 'Alaxico Bangalore',
    type: 'service_center',
    address: '45, MG Road, Near Trinity Circle, Bangalore, Karnataka 560001',
    phone: '+91 9988776655',
    email: 'bangalore@alaxico.com',
    hours: 'Mon-Sat: 9:30 AM - 6:30 PM',
    services: ['Sales', 'Service Center', 'Repairs'],
    coordinates: { lat: 12.9716, lng: 77.5946 },
    city: 'Bangalore'
  },
  {
    id: 4,
    name: 'Alaxico Chennai',
    type: 'dealer',
    address: '78, Anna Salai, Triplicane, Chennai, Tamil Nadu 600002',
    phone: '+91 9112233445',
    email: 'chennai@alaxico.com',
    hours: 'Mon-Sat: 10:00 AM - 6:00 PM',
    services: ['Sales', 'Authorized Dealer'],
    coordinates: { lat: 13.0827, lng: 80.2707 },
    city: 'Chennai'
  },
  {
    id: 5,
    name: 'Alaxico Hyderabad',
    type: 'dealer',
    address: '23, Jubilee Hills, Road No. 36, Hyderabad, Telangana 500033',
    phone: '+91 9223344556',
    email: 'hyderabad@alaxico.com',
    hours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    services: ['Sales', 'Demo Room'],
    coordinates: { lat: 17.4326, lng: 78.4071 },
    city: 'Hyderabad'
  },
  {
    id: 6,
    name: 'Alaxico Kolkata',
    type: 'service_center',
    address: '156, Park Street, Kolkata, West Bengal 700016',
    phone: '+91 9334455667',
    email: 'kolkata@alaxico.com',
    hours: 'Mon-Sat: 9:00 AM - 6:00 PM',
    services: ['Service Center', 'Repairs', 'Spare Parts'],
    coordinates: { lat: 22.5726, lng: 88.3639 },
    city: 'Kolkata'
  },
  {
    id: 7,
    name: 'Alaxico Pune',
    type: 'dealer',
    address: '89, FC Road, Shivajinagar, Pune, Maharashtra 411005',
    phone: '+91 9445566778',
    email: 'pune@alaxico.com',
    hours: 'Mon-Sat: 10:00 AM - 7:00 PM',
    services: ['Sales', 'Authorized Dealer'],
    coordinates: { lat: 18.5204, lng: 73.8567 },
    city: 'Pune'
  },
  {
    id: 8,
    name: 'Alaxico Ahmedabad',
    type: 'dealer',
    address: '34, CG Road, Navrangpura, Ahmedabad, Gujarat 380009',
    phone: '+91 9556677889',
    email: 'ahmedabad@alaxico.com',
    hours: 'Mon-Sat: 10:00 AM - 6:30 PM',
    services: ['Sales', 'Demo Room'],
    coordinates: { lat: 23.0225, lng: 72.5714 },
    city: 'Ahmedabad'
  }
];

const CITIES = ['All Cities', 'Delhi NCR', 'Mumbai', 'Bangalore', 'Chennai', 'Hyderabad', 'Kolkata', 'Pune', 'Ahmedabad'];
const STORE_TYPES = [
  { id: 'all', label: 'All Locations', icon: MapPin },
  { id: 'head_office', label: 'Head Office', icon: Building2 },
  { id: 'showroom', label: 'Showrooms', icon: Store },
  { id: 'service_center', label: 'Service Centers', icon: Wrench },
  { id: 'dealer', label: 'Authorized Dealers', icon: MapPin },
];

const StoreLocator = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStore, setSelectedStore] = useState(null);

  const filteredStores = STORES.filter(store => {
    const matchesSearch = store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         store.city.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = selectedCity === 'All Cities' || store.city === selectedCity;
    const matchesType = selectedType === 'all' || store.type === selectedType;
    return matchesSearch && matchesCity && matchesType;
  });

  const getStoreTypeIcon = (type) => {
    switch (type) {
      case 'head_office': return Building2;
      case 'showroom': return Store;
      case 'service_center': return Wrench;
      default: return MapPin;
    }
  };

  const getStoreTypeLabel = (type) => {
    switch (type) {
      case 'head_office': return 'Head Office';
      case 'showroom': return 'Showroom';
      case 'service_center': return 'Service Center';
      case 'dealer': return 'Authorized Dealer';
      default: return 'Store';
    }
  };

  const openInMaps = (store) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.address)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="store-locator-page">
      {/* Header */}
      <section className="bg-gradient-to-br from-purple-700 via-purple-600 to-purple-800 py-12 sm:py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Find Alaxico Near You
          </h1>
          <p className="text-lg text-purple-100 max-w-2xl mx-auto mb-8">
            Visit our showrooms, service centers, or authorized dealers across India
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by city, area, or store name..."
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-purple-400 outline-none"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Filters & Results */}
      <section className="py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            {/* City Filter */}
            <div className="relative">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 pr-10 text-gray-700 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none cursor-pointer"
              >
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>

            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {STORE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedType === type.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Results Count */}
          <p className="text-gray-500 mb-6">
            Showing {filteredStores.length} location{filteredStores.length !== 1 ? 's' : ''}
          </p>

          {/* Store Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredStores.map((store) => {
              const StoreIcon = getStoreTypeIcon(store.type);
              const isSelected = selectedStore?.id === store.id;
              
              return (
                <div
                  key={store.id}
                  onClick={() => setSelectedStore(isSelected ? null : store)}
                  className={`bg-white rounded-2xl border-2 p-5 sm:p-6 cursor-pointer transition-all duration-300 ${
                    isSelected 
                      ? 'border-purple-500 shadow-lg' 
                      : 'border-gray-100 hover:border-purple-200 hover:shadow-md'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        store.type === 'head_office' ? 'bg-purple-100' :
                        store.type === 'service_center' ? 'bg-orange-100' :
                        store.type === 'showroom' ? 'bg-blue-100' : 'bg-green-100'
                      }`}>
                        <StoreIcon className={`w-6 h-6 ${
                          store.type === 'head_office' ? 'text-purple-600' :
                          store.type === 'service_center' ? 'text-orange-600' :
                          store.type === 'showroom' ? 'text-blue-600' : 'text-green-600'
                        }`} />
                      </div>
                      <div>
                        <span className="text-xs font-medium text-purple-600 uppercase">
                          {getStoreTypeLabel(store.type)}
                        </span>
                        <h3 className="font-semibold text-gray-900">{store.name}</h3>
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-2 text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <p>{store.address}</p>
                  </div>

                  {/* Phone */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    <a href={`tel:${store.phone}`} className="hover:text-purple-600">{store.phone}</a>
                  </div>

                  {/* Hours */}
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                    <Clock className="w-4 h-4 flex-shrink-0" />
                    <p>{store.hours}</p>
                  </div>

                  {/* Services */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {store.services.map((service, idx) => (
                      <span 
                        key={idx}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                      >
                        {service}
                      </span>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      onClick={(e) => { e.stopPropagation(); openInMaps(store); }}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white text-sm"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                    <a 
                      href={`tel:${store.phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
                    >
                      <Phone className="w-4 h-4 text-gray-600" />
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredStores.length === 0 && (
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No stores found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your search or filters</p>
              <Button
                onClick={() => { setSearchQuery(''); setSelectedCity('All Cities'); setSelectedType('all'); }}
                variant="outline"
                className="border-purple-300 text-purple-600"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 bg-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Want to become an Authorized Dealer?
          </h2>
          <p className="text-gray-500 mb-6">
            Join our growing network of partners across India
          </p>
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
            <a href="/partner">
              Become a Partner
              <ExternalLink className="w-4 h-4 ml-2" />
            </a>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default StoreLocator;
