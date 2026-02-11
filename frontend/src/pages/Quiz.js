import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Building2, Stethoscope, Home, FlaskConical, Siren, Heart, IndianRupee, CheckCircle2, Sparkles, RotateCcw } from 'lucide-react';
import { Button } from '../components/ui/button';

const QUIZ_STEPS = [
  {
    id: 'useCase',
    question: 'Where will you primarily use the equipment?',
    options: [
      { id: 'hospital', label: 'Hospital', icon: Building2, description: 'Large healthcare facility' },
      { id: 'clinic', label: 'Clinic/Nursing Home', icon: Stethoscope, description: 'Small to medium practice' },
      { id: 'home', label: 'Home Care', icon: Home, description: 'Personal/Family use' },
      { id: 'lab', label: 'Laboratory', icon: FlaskConical, description: 'Diagnostic center' },
      { id: 'emergency', label: 'Emergency/Ambulance', icon: Siren, description: 'First responder use' },
      { id: 'elderly', label: 'Elderly Care', icon: Heart, description: 'Senior citizen care' },
    ]
  },
  {
    id: 'category',
    question: 'What type of equipment are you looking for?',
    options: [
      { id: 'diagnostic', label: 'Diagnostic Equipment', description: 'BP Monitors, Thermometers, etc.' },
      { id: 'respiratory', label: 'Respiratory Care', description: 'Nebulizers, Vaporizers, Oxygen' },
      { id: 'monitoring', label: 'Patient Monitoring', description: 'Pulse Oximeters, ECG, etc.' },
      { id: 'mobility', label: 'Mobility Aids', description: 'Wheelchairs, Walking aids' },
      { id: 'furniture', label: 'Hospital Furniture', description: 'Beds, Tables, Chairs' },
      { id: 'painrelief', label: 'Pain Relief', description: 'Hot water bags, Heating pads' },
    ]
  },
  {
    id: 'budget',
    question: 'What is your budget range?',
    options: [
      { id: 'under1000', label: 'Under ₹1,000', description: 'Basic equipment' },
      { id: '1000to3000', label: '₹1,000 - ₹3,000', description: 'Standard quality' },
      { id: '3000to5000', label: '₹3,000 - ₹5,000', description: 'Premium options' },
      { id: '5000to10000', label: '₹5,000 - ₹10,000', description: 'Professional grade' },
      { id: 'above10000', label: 'Above ₹10,000', description: 'Hospital grade' },
      { id: 'flexible', label: 'Flexible Budget', description: 'Show me all options' },
    ]
  },
  {
    id: 'priority',
    question: 'What matters most to you?',
    options: [
      { id: 'warranty', label: 'Long Warranty', description: '3+ years coverage' },
      { id: 'brand', label: 'Trusted Brand', description: 'Established manufacturers' },
      { id: 'price', label: 'Best Price', description: 'Value for money' },
      { id: 'features', label: 'Advanced Features', description: 'Latest technology' },
      { id: 'portable', label: 'Portability', description: 'Easy to carry' },
      { id: 'durability', label: 'Durability', description: 'Long-lasting build' },
    ]
  }
];

const RECOMMENDATIONS = {
  'home-respiratory': [
    { name: 'Piston Compressor Nebulizer', price: 1499, match: 95, link: '/products?search=nebulizer' },
    { name: 'Steam Vaporizer', price: 599, match: 90, link: '/products?search=vaporizer' },
  ],
  'home-diagnostic': [
    { name: 'Digital BP Monitor', price: 1299, match: 98, link: '/products?search=bp%20monitor' },
    { name: 'Digital Thermometer', price: 199, match: 92, link: '/products?search=thermometer' },
  ],
  'home-painrelief': [
    { name: 'Electric Hot Water Bag', price: 499, match: 96, link: '/products?search=hot%20water' },
    { name: 'Natural Rubber Hot Water Bag', price: 299, match: 88, link: '/products?search=rubber%20hot%20water' },
  ],
  'clinic-diagnostic': [
    { name: 'Professional BP Monitor', price: 2499, match: 97, link: '/products?search=bp%20monitor' },
    { name: 'Pulse Oximeter', price: 999, match: 94, link: '/products?search=oximeter' },
  ],
  'default': [
    { name: 'Home Healthcare Bundle', price: 2999, match: 90, link: '/products?bundle=home-healthcare' },
    { name: 'Digital BP Monitor', price: 1299, match: 85, link: '/products?search=bp%20monitor' },
  ]
};

const Quiz = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const handleSelect = (optionId) => {
    const stepId = QUIZ_STEPS[currentStep].id;
    setAnswers(prev => ({ ...prev, [stepId]: optionId }));
    
    if (currentStep < QUIZ_STEPS.length - 1) {
      setTimeout(() => setCurrentStep(prev => prev + 1), 300);
    } else {
      setTimeout(() => setShowResults(true), 300);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setAnswers({});
    setShowResults(false);
  };

  const getRecommendations = () => {
    const key = `${answers.useCase}-${answers.category}`;
    return RECOMMENDATIONS[key] || RECOMMENDATIONS['default'];
  };

  const progress = ((currentStep + 1) / QUIZ_STEPS.length) * 100;

  if (showResults) {
    const recommendations = getRecommendations();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 sm:py-12 lg:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Header */}
          <div className="text-center mb-8 sm:mb-12">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" />
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
              Your Personalized Recommendations
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Based on your answers, we've found the perfect products for you
            </p>
          </div>

          {/* Recommendations */}
          <div className="space-y-4 mb-8">
            {recommendations.map((product, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl border border-purple-100 p-4 sm:p-6 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-4">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-purple-600 font-bold text-lg">₹{product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {product.match}% Match
                    </div>
                    <Link to={product.link}>
                      <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        View Product
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
            <Button 
              variant="outline" 
              onClick={handleRestart}
              className="border-purple-300 text-purple-600"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Take Quiz Again
            </Button>
            <Link to="/products">
              <Button className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white">
                Browse All Products
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = QUIZ_STEPS[currentStep];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-purple-50 py-8 sm:py-12 lg:py-16" data-testid="quiz-page">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Find the Right Equipment
          </h1>
          <p className="text-gray-500 text-sm sm:text-base">
            Answer a few questions and we'll recommend the perfect products for you
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Question {currentStep + 1} of {QUIZ_STEPS.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-purple-600 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-purple-100 p-6 sm:p-8 lg:p-10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8 text-center">
            {currentQuestion.question}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {currentQuestion.options.map((option) => {
              const IconComponent = option.icon;
              const isSelected = answers[currentQuestion.id] === option.id;
              
              return (
                <button
                  key={option.id}
                  onClick={() => handleSelect(option.id)}
                  className={`p-4 sm:p-5 rounded-xl border-2 text-left transition-all duration-300 hover:shadow-md ${
                    isSelected 
                      ? 'border-purple-500 bg-purple-50' 
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  }`}
                  data-testid={`quiz-option-${option.id}`}
                >
                  <div className="flex items-start gap-3">
                    {IconComponent && (
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-purple-200' : 'bg-purple-100'
                      }`}>
                        <IconComponent className={`w-5 h-5 ${isSelected ? 'text-purple-700' : 'text-purple-600'}`} />
                      </div>
                    )}
                    <div>
                      <p className={`font-semibold ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                        {option.label}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 sm:mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`${currentStep === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Link to="/products">
            <Button variant="ghost" className="text-gray-500">
              Skip Quiz
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
