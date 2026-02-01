// GharSevaLanding.jsx
import React, { useState, useEffect } from 'react';
import { Star, MapPin, Users, Shield, Clock, CheckCircle, Menu, X, ChevronRight, Phone, Mail, Zap, Home, DollarSign, Briefcase } from 'lucide-react';
import logo from './assets/logo.png';
import heroImg from './assets/hero_illustration.png';
import axios from 'axios';
import Modal from './components/common/Modal';
import LoginForm from './components/auth/LoginForm';
import SignupForm from './components/auth/SignupForm';

// Ensure cookie is sent with requests
axios.defaults.withCredentials = true;
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'; // Fallback for dev




// --- Main Component ---
export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [provider, setProvider] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check persistent auth
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/auth/me`);
        setUser(data.user);
        setProvider(data.provider);
        // Also sync to localStorage for legacy parts if needed, but state is better
        localStorage.setItem('providerUser', JSON.stringify(data.user));
        if (data.provider?.profileCompleted) {
          localStorage.setItem('providerProfileCompleted', 'true');
        } else {
          localStorage.removeItem('providerProfileCompleted');
        }
      } catch (err) {
        console.log("Not authenticated", err.message);
        localStorage.removeItem('providerUser');
      } finally {
        setAuthLoading(false);
      }
    };
    checkAuth();
  }, []);

  const openLoginModal = () => setIsLoginModalOpen(true);
  const closeLoginModal = () => setIsLoginModalOpen(false);
  const openSignupModal = () => setIsSignupModalOpen(true);
  const closeSignupModal = () => setIsSignupModalOpen(false);

  // effect for scroll control
  useEffect(() => {
    const isOverlayOpen = isLoginModalOpen || isSignupModalOpen || mobileMenuOpen;
    if (isOverlayOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isLoginModalOpen, isSignupModalOpen, mobileMenuOpen]);

  // helpers for auth/profile state
  // const getCurrentUser = () => user; // Use state 'user'
  const isLoggedIn = () => !!user;
  // This check relies on a flag we might not have yet from /me, 
  // but let's assume if they have a user obj they might be a provider
  // Ideally /me returns { user, providerProfile } or we fetch profile separate.
  // For now, we'll keep using localStorage for 'providerProfileCompleted' 
  // until we fetch the provider profile explicitly.
  const isProfileCompleted = () => localStorage.getItem('providerProfileCompleted') === 'true';

  const setSelectedPlan = (plan) => localStorage.setItem('selectedPlan', JSON.stringify(plan));
  const getSelectedPlan = () => {
    try { return JSON.parse(localStorage.getItem('selectedPlan')); } catch { return null; }
  };
  const clearSelectedPlan = () => localStorage.removeItem('selectedPlan');

  // Data (kept same as original)
  const services = [
    { name: 'Plumbing', icon: <Zap className="text-teal-600" size={36} />, providers: 234 },
    { name: 'Electrical', icon: <Zap className="text-orange-600" size={36} />, providers: 189 },
    { name: 'Cleaning', icon: <Home className="text-teal-600" size={36} />, providers: 456 },
    { name: 'Carpentry', icon: <Zap className="text-orange-600" size={36} />, providers: 167 },
    { name: 'Painting', icon: <img src="https://api.iconify.design/emojione/paintbrush.svg?color=%2314b8a6" alt="Paint" className='w-9 h-9' />, providers: 203 },
    { name: 'AC Repair', icon: <img src="https://api.iconify.design/emojione/snowflake.svg?color=%2314b8a6" alt="AC" className='w-9 h-9' />, providers: 145 },
    { name: 'Pest Control', icon: <img src="https://api.iconify.design/emojione/bug.svg?color=%23f97316" alt="Pest" className='w-9 h-9' />, providers: 98 },
    { name: 'Appliance Repair', icon: <img src="https://api.iconify.design/emojione/electric-plug.svg?color=%2314b8a6" alt="Plug" className='w-9 h-9' />, providers: 176 }
  ];

  const locations = ['Wakad', 'Hinjewadi', 'Baner / Pashan', 'Bavdhan', 'Hadapsar', 'Kalewadi', 'Pimple Nilakh'];

  const reviews = [
    { name: 'Priya Sharma', location: 'Wakad', rating: 5, service: 'Plumbing', text: 'Found an excellent plumber within minutes. Professional service and reasonable pricing. GharSeva made it so easy!', date: '2 days ago' },
    { name: 'Rajesh Kumar', location: 'Hinjewadi', rating: 5, service: 'Electrical Work', text: 'The electrician was prompt, skilled, and fixed all issues quickly. Great platform for finding reliable service providers.', date: '1 week ago' },
    { name: 'Anjali Patel', location: 'Baner', rating: 4, service: 'House Cleaning', text: 'Very satisfied with the cleaning service. The team was thorough and professional. Will definitely use again.', date: '3 days ago' }
  ];

  const subscriptionPlans = [
    { name: 'Basic', price: '₹499', period: 'month', features: ['Profile listing on platform', 'Up to 20 leads per month', 'Basic customer support', 'Mobile app access'], popular: false },
    { name: 'Professional', price: '₹999', period: 'month', features: ['Featured profile listing', 'Unlimited leads', 'Priority customer support', 'Advanced analytics dashboard', 'Payment gateway integration', 'Marketing tools & promotions'], popular: true },
    { name: 'Enterprise', price: '₹1,999', period: 'month', features: ['Premium placement', 'Unlimited leads', '24/7 dedicated support', 'Advanced analytics & insights', 'Full marketing suite', 'Verified & Premium badge', 'Team management (up to 5 members)'], popular: false }
  ];

  const stats = [{ number: '5,000+', label: 'Local Providers' }, { number: '50K+', label: 'Happy Customers' }, { number: '7', label: 'Areas in Pune Covered' }, { number: '4.9★', label: 'Average Rating' }];

  // Payment initialization removed from here - delegated to Dashboard


  // --- Button handler for plan purchase ---
  // --- Button handler for plan purchase ---
  const handleStartWithPlan = (plan) => {
    // Save selected plan (so flow continues after login/profile)
    setSelectedPlan(plan);

    if (!isLoggedIn()) {
      // Open signup/login flow; signup modal will pick selectedPlan from localStorage
      openSignupModal();
      return;
    }

    // If logged in, redirect to dashboard. 
    // The dashboard will handle profile completion check and payment prompting.
    window.location.href = '/dashboard';
  };

  // If user just signed up/logged in from modal, handle success
  const handleAuthSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('providerUser', JSON.stringify(userData));
    // Always redirect to dashboard, it handles the rest
    window.location.href = '/dashboard';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Modals */}
      <Modal isOpen={isLoginModalOpen} onClose={closeLoginModal} title="Welcome Back">
        <LoginForm onClose={closeLoginModal} openSignup={openSignupModal} onLoginSuccess={handleAuthSuccess} />
      </Modal>

      <Modal isOpen={isSignupModalOpen} onClose={closeSignupModal} title="Create Account">
        <SignupForm onClose={closeSignupModal} openLogin={openLoginModal} onSignupSuccess={handleAuthSuccess} presetPlan={getSelectedPlan()} />
      </Modal>

      {/* Navigation */}
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-3xl font-extrabold text-teal-700">
                Ghar<span className='text-orange-500'>Seva</span>
              </span>
              <img className="h-10 w-auto" src={logo} alt="GharSeva Logo" />
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-gray-700 hover:text-teal-600 font-medium transition">Services</a>
              <a href="#locations" className="text-gray-700 hover:text-teal-600 font-medium transition">Locations</a>
              <a href="#reviews" className="text-gray-700 hover:text-teal-600 font-medium transition">Reviews</a>
              <a href="#providers" className="text-gray-700 hover:text-teal-600 font-medium transition">For Providers</a>
              <button onClick={() => { if (isLoggedIn()) window.location.href = '/dashboard'; else openLoginModal(); }} className="px-5 py-2 text-teal-600 border-2 border-teal-600 rounded-full font-semibold hover:bg-teal-50 transition duration-300">
                {isLoggedIn() ? 'Dashboard' : 'Login'}
              </button>
              <button onClick={() => { if (isLoggedIn() && !isProfileCompleted()) window.location.href = '/dashboard'; else openSignupModal(); }} className="px-5 py-2 bg-orange-600 text-white rounded-full font-semibold hover:bg-orange-700 transition duration-300 shadow-md">
                Sign Up
              </button>
            </div>

            <button className="md:hidden text-teal-600" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-4 py-3 space-y-3">
              <a href="#services" className="block text-gray-700 hover:text-teal-600" onClick={() => setMobileMenuOpen(false)}>Services</a>
              <a href="#locations" className="block text-gray-700 hover:text-teal-600" onClick={() => setMobileMenuOpen(false)}>Locations</a>
              <a href="#reviews" className="block text-gray-700 hover:text-teal-600" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
              <a href="#providers" className="block text-gray-700 hover:text-teal-600" onClick={() => setMobileMenuOpen(false)}>For Providers</a>
              <button onClick={() => { setMobileMenuOpen(false); openLoginModal(); }} className="w-full px-4 py-2 text-teal-600 border-2 border-teal-600 rounded-full font-semibold">Login</button>
              <button onClick={() => { setMobileMenuOpen(false); openSignupModal(); }} className="w-full px-4 py-2 bg-orange-600 text-white rounded-full font-semibold">Sign Up</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section - More Attractive UI */}
      <section className="bg-teal-50 pt-16 pb-20 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between">

          {/* Text Content */}
          <div className="md:w-1/2 text-center md:text-left z-10">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
              <span className="text-teal-700 block"> Home Service Platform</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-lg md:max-w-none">
              Connect with <strong>Verified, Local Professionals</strong> in Wakad, Hinjewadi, and all major Pune areas. Quality service is just a click away.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <button className="px-8 py-4 bg-orange-600 text-white text-lg rounded-full font-bold hover:bg-orange-700 transition duration-300 shadow-xl transform hover:scale-105">
                Book Service Now!
              </button>
              <button onClick={() => { if (isLoggedIn()) window.location.href = '/dashboard'; else openSignupModal(); }} className="px-8 py-4 bg-white text-teal-600 text-lg border-2 border-teal-600 rounded-full font-bold hover:bg-teal-50 transition duration-300">
                Join Our Team <ChevronRight className='inline ml-1' size={20} />
              </button>
            </div>
          </div>

          {/* Image/Visual Element */}
          <div className="md:w-1/2 mt-12 md:mt-0 relative flex justify-center items-center">
            <img
              src={heroImg}
              alt="GharSeva Professional Services"
              className="w-full max-w-lg object-contain drop-shadow-2xl animate-fade-in-up hover:scale-105 transition-transform duration-500 ease-in-out"
            />
          </div>
        </div>

        {/* Stats Section Integrated with Hero */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-2xl shadow-2xl border-t-4 border-teal-600">
            {stats.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-extrabold text-teal-700">
                  {stat.number}
                </div>
                <div className="text-gray-500 mt-1 font-medium text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">Our Specialties</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900">Services That Make Your Home Better</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg hover:shadow-2xl transition duration-300 transform hover:-translate-y-1 cursor-pointer group">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-100 transition duration-300">
                  {React.isValidElement(service.icon) ? service.icon : service.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-teal-700">{service.name}</h3>
                <p className="text-gray-500 text-sm">{service.providers} providers available</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">Trust & Reliability</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900">The GharSeva Advantage</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-teal-600">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="text-teal-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Background Checked</h3>
              <p className="text-gray-600">All professionals undergo strict background checks and skill verification for your safety.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-orange-600">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="text-orange-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">On-Time & Quick</h3>
              <p className="text-gray-600">We prioritize punctuality and efficient service. Book a slot that works for you.</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-xl border-t-4 border-teal-600">
              <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-4">
                <Star className="text-teal-600" size={32} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Rated & Reviewed</h3>
              <p className="text-gray-600">Transparency is key. Choose providers based on real customer reviews and high ratings.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Locations Section - Pune Specific */}
      <section id="locations" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">Local Focus</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900">Serving Key Areas in Pune</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {locations.map((location, idx) => (
              <div key={idx} className="bg-gray-50 p-4 rounded-lg text-center hover:bg-teal-50 transition duration-300 shadow-md border border-gray-100">
                <MapPin className="mx-auto mb-2 text-teal-600" size={24} />
                <span className="font-bold text-gray-800">{location}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id="reviews" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-orange-600 tracking-wide uppercase">Word of Mouth</h2>
            <p className="mt-2 text-4xl font-extrabold text-gray-900">What Our Customers Say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl shadow-xl border-t-4 border-orange-500 hover:shadow-2xl transition duration-300">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {review.name.charAt(0)}
                  </div>
                  <div className="ml-3">
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-sm text-gray-500 flex items-center">
                      <MapPin size={14} className="mr-1 text-teal-500" />
                      {review.location}
                    </p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} size={18} className="text-yellow-500 fill-current" />
                  ))}
                </div>
                <p className="text-md font-semibold text-orange-600 mb-2">{review.service}</p>
                <p className="text-gray-700 mb-3 italic">"{review.text}"</p>
                <p className="text-xs text-gray-400">{review.date}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Provider Section */}
      <section id="providers" className="bg-teal-700 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-base font-semibold text-orange-400 tracking-wide uppercase">Grow Your Business</h2>
            <p className="mt-2 text-4xl font-extrabold text-white">Join GharSeva and Get More Leads</p>
          </div>

          {/* Subscription Plans */}
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {subscriptionPlans.map((plan, idx) => (
              <div key={idx} className={`bg-white rounded-3xl p-8 ${plan.popular ? 'ring-4 ring-orange-500 transform scale-105 shadow-2xl' : 'shadow-lg'} relative transition duration-300`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}
                <h3 className="text-2xl font-bold text-teal-700 mb-2">{plan.name}</h3>
                <div className="mb-6">
                  <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500">/{plan.period}</span>
                </div>
                <ul className="space-y-4 mb-10">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start">
                      <CheckCircle className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={20} />
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleStartWithPlan(plan)}
                  className={`w-full py-3 rounded-full font-bold text-lg transition duration-300 ${plan.popular
                    ? 'bg-orange-600 text-white hover:bg-orange-700 shadow-xl'
                    : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                >
                  Start with {plan.name}
                </button>
              </div>
            ))}
          </div>

          {/* Provider Benefits */}
          <div className="bg-teal-800 rounded-xl p-8 mt-16 shadow-inner">
            <h3 className="text-2xl font-bold text-white mb-6 text-center border-b border-teal-600 pb-4">Key Provider Benefits</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <DollarSign className="text-teal-600" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Guaranteed Income</h4>
                  <p className="text-teal-200 text-sm">Consistent lead flow helps you maintain a steady and growing income stream.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4 flex-shrink-0">
                  <Briefcase className="text-teal-600" size={24} />
                </div>
                <div>
                  <h4 className="text-white font-bold mb-1">Business Management</h4>
                  <p className="text-teal-200 text-sm">Use our dashboard for scheduling, payments, and managing customer feedback efficiently.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white shadow-inner">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-extrabold text-gray-900 mb-6">Ready to Experience Hassle-Free Service?</h2>
          <p className="text-xl text-gray-600 mb-8">Book your first service in less than two minutes!</p>
          <button className="px-10 py-4 bg-orange-600 text-white text-xl rounded-full font-bold hover:bg-orange-700 transition duration-300 shadow-2xl transform hover:scale-105">
            Book a Service Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-3xl font-extrabold text-teal-400 mb-4">
                Ghar<span className='text-orange-400'>Seva</span>
              </h3>
              <p className="text-gray-400">Your trusted partner for home service needs in Pune.</p>
            </div>
            <div>
              <h4 className="font-bold mb-4 border-b border-gray-700 pb-2">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#services" className="hover:text-teal-400 transition">Services</a></li>
                <li><a href="#locations" className="hover:text-teal-400 transition">Locations</a></li>
                <li><a href="#reviews" className="hover:text-teal-400 transition">Reviews</a></li>
                <li><a href="#providers" className="hover:text-teal-400 transition">For Providers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 border-b border-gray-700 pb-2">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-teal-400 transition">Help Center</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Terms of Service</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-teal-400 transition">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4 border-b border-gray-700 pb-2">Contact</h4>
              <div className="space-y-3 text-gray-400">
                <div className="flex items-center">
                  <Phone size={18} className="mr-2 text-teal-400" />
                  <span>1800-123-4567</span>
                </div>
                <div className="flex items-center">
                  <Mail size={18} className="mr-2 text-teal-400" />
                  <span>support@gharseva.com</span>
                </div>
                <div className="flex items-center">
                  <MapPin size={18} className="mr-2 text-teal-400" />
                  <span>Pune, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500">
            <p>&copy; 2024 GharSeva. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
