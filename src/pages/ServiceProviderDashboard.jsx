// ServiceProviderDashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  Home, User, Settings, Briefcase, DollarSign, Star, Zap, Upload, CheckCircle, 
  MapPin, Phone, Mail, ChevronRight, Menu, X, Edit2, ShieldCheck 
} from 'lucide-react';

// Component for displaying a single profile stat
const StatCard = ({ icon: Icon, number, label, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border-l-4" style={{ borderColor: color }}>
    <div className="flex items-center justify-between">
      <div className="text-3xl font-bold text-gray-900">{number}</div>
      <Icon className={`text-4xl`} style={{ color }} size={36} />
    </div>
    <div className="text-gray-500 mt-1 text-sm font-medium">{label}</div>
  </div>
);

// ProfileForm Component (now writes profileCompleted to localStorage)
const ProfileForm = ({ onProfileComplete }) => {
  const [isVerified, setIsVerified] = useState(localStorage.getItem('providerProfileVerified') === 'true');
  const [profileImage, setProfileImage] = useState(localStorage.getItem('providerProfileImage') || null);

  const handleAadhaarUpload = (e) => {
    // Simulate upload
    const filename = e.target.files?.[0]?.name;
    if (filename) {
      console.log('Aadhaar file uploaded:', filename);
      // in real app upload file to server, run verification, set verified flag after backend confirms
      localStorage.setItem('providerProfileVerified', 'true');
      setIsVerified(true);
    }
  };

  const handleProfileImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      const url = URL.createObjectURL(e.target.files[0]);
      setProfileImage(url);
      localStorage.setItem('providerProfileImage', url);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Collect form values and send to your backend. On success:
    localStorage.setItem('providerProfileCompleted', 'true');
    // Optionally set name/email in localStorage as providerUser
    const user = JSON.parse(localStorage.getItem('providerUser') || '{}');
    const nameInput = e.target.querySelector('input[placeholder="Full Name (as per ID)"]')?.value;
    if (nameInput) {
      const updated = { ...user, name: nameInput };
      localStorage.setItem('providerUser', JSON.stringify(updated));
    }
    onProfileComplete?.();
  };

  return (
    <form className="space-y-8 p-6 bg-white rounded-xl shadow-xl" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-bold text-teal-700 border-b pb-2">Complete Your Service Profile</h3>
      
      {/* 1. Basic Details */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><User size={20} className="mr-2 text-teal-600"/> Personal & Service Info</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="Full Name (as per ID)" className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required defaultValue={JSON.parse(localStorage.getItem('providerUser') || '{}').name || ''} />
          <input type="tel" placeholder="Mobile Number" className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required defaultValue={JSON.parse(localStorage.getItem('providerUser') || '{}').phone || ''} />
          <input type="email" placeholder="Email Address" className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" disabled defaultValue={JSON.parse(localStorage.getItem('providerUser') || '{}').email || ''} />
          <select className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required>
            <option value="">Select Primary Service</option>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>Carpentry</option>
            <option>AC Repair</option>
          </select>
        </div>
      </div>

      {/* 2. Address & Location Details */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><MapPin size={20} className="mr-2 text-teal-600"/> Service Location</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <input type="text" placeholder="House/Flat No." className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" />
          <input type="text" placeholder="Street/Area" className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" />
          <select className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required>
            <option value="">Select Service Area (Pune)</option>
            <option>Wakad</option>
            <option>Hinjewadi</option>
            <option>Baner / Pashan</option>
            <option>Hadapsar</option>
          </select>
          <input type="number" placeholder="Pincode" className="p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500" required />
        </div>
      </div>

      {/* 3. Verification & Documents */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><ShieldCheck size={20} className="mr-2 text-teal-600"/> ID & Verification ({isVerified ? 'Complete' : 'Pending'})</h4>
        <div className="grid md:grid-cols-2 gap-4 items-center">
          
          <div className="p-4 border border-dashed rounded-lg flex items-center justify-between bg-gray-50">
            <div className='flex items-center'>
              <Upload size={20} className="text-teal-600 mr-3"/>
              <span className="text-gray-700">Aadhaar Card Photo</span>
            </div>
            <label className="cursor-pointer bg-teal-600 text-white text-sm px-3 py-2 rounded-full hover:bg-teal-700 transition">
              {isVerified ? 'Re-upload' : 'Upload'}
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf" onChange={handleAadhaarUpload} />
            </label>
          </div>
          
          <div className={`p-3 rounded-lg flex items-center ${isVerified ? 'bg-green-100 text-green-700 border-green-400' : 'bg-yellow-100 text-yellow-700 border-yellow-400'}`}>
            <CheckCircle size={20} className="mr-2"/>
            {isVerified ? 'Aadhaar Verified' : 'Pending Verification'}
          </div>
        </div>
      </div>

      {/* 4. Profile Photo & Description */}
      <div>
        <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center"><Edit2 size={20} className="mr-2 text-teal-600"/> Profile & Description</h4>
        <div className="flex items-start gap-6">
          
          <div className="flex flex-col items-center">
            <img 
              src={profileImage || 'https://via.placeholder.com/100/F97316/FFFFFF?text=P'} 
              alt="Profile" 
              className="w-24 h-24 rounded-full object-cover shadow-md mb-2 border-2 border-orange-500"
            />
            <label className="cursor-pointer text-sm text-teal-600 font-semibold hover:text-teal-800 transition">
              Upload Photo
              <input type="file" className="hidden" accept="image/*" onChange={handleProfileImageUpload} />
            </label>
          </div>

          <textarea
            placeholder="Write a compelling description of your service experience (Min 100 characters). This helps customers choose you!"
            rows="5"
            className="w-full p-3 border rounded-lg focus:ring-orange-500 focus:border-orange-500"
            maxLength={500}
            required
          ></textarea>
        </div>
      </div>
      
      {/* Submit Button */}
      <div className="pt-4 border-t">
        <button 
          type="submit" 
          className="w-full py-3 bg-orange-600 text-white font-bold rounded-full text-lg hover:bg-orange-700 transition duration-300 shadow-xl"
        >
          Save & Update Profile
        </button>
      </div>
    </form>
  );
};

// Main Provider Dashboard component
export default function ServiceProviderDashboard() {
  const [activeView, setActiveView] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileCompleted, setProfileCompleted] = useState(localStorage.getItem('providerProfileCompleted') === 'true');
  const [hasSubscription, setHasSubscription] = useState(localStorage.getItem('hasActiveSubscription') === 'true');
  const [selectedPlan, setSelectedPlan] = useState(() => {
    try { return JSON.parse(localStorage.getItem('selectedPlan')); } catch { return null; }
  });

  useEffect(() => {
    // If user arrives and profile isn't complete, set view to 'profile'
    if (!profileCompleted) setActiveView('profile');
    else if (!hasSubscription && selectedPlan) {
      // If profile completed and a plan was selected previously, prompt subscription
      setActiveView('dashboard');
      // you can show a toast or a visible subscription CTA; we keep it simple by showing a banner in Dashboard view
    } else {
      setActiveView(profileCompleted ? 'dashboard' : 'profile');
    }
  }, [profileCompleted, hasSubscription, selectedPlan]);

  const providerData = {
    name: JSON.parse(localStorage.getItem('providerUser') || '{}').name || 'Ganesh Shinde',
    service: 'Plumbing & Repairs',
    location: 'Wakad, Pune',
    rating: 4.8,
    jobsCompleted: 154,
    monthlyEarnings: '₹45,200',
    profileStatus: profileCompleted ? '100%' : '85%',
    isVerified: localStorage.getItem('providerProfileVerified') === 'true',
  };

  const menuItems = [
    { id: 'profile', name: 'Profile & Verification', icon: User },
    { id: 'dashboard', name: 'Dashboard Overview', icon: Home },
    { id: 'jobs', name: 'My Jobs (Leads)', icon: Briefcase },
    { id: 'earnings', name: 'Payments & Earnings', icon: DollarSign },
    { id: 'settings', name: 'Account Settings', icon: Settings },
  ];

  const clearSelectedPlan = () => {
    localStorage.removeItem('selectedPlan');
    setSelectedPlan(null);
  };

  // Payment flow used in dashboard as well
  const createOrderOnServer = async (plan) => {
    // Replace with actual API call similar to landing
    const provider = JSON.parse(localStorage.getItem('providerUser') || '{}');
    if (!provider?.id) throw new Error('Not authenticated');

    // Simulate server result
    return { orderId: 'order_test_123', amount: parseInt(plan.price.replace(/[^\d]/g, '')) * 100, currency: 'INR', keyId: 'rzp_test_yourKeyIdHere' };
  };

  const openRazorpayCheckout = (order, plan) => {
    const provider = JSON.parse(localStorage.getItem('providerUser') || '{}');
    const options = {
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      order_id: order.orderId,
      name: 'GharSeva',
      description: `${plan.name} Subscription`,
      prefill: { name: provider?.name || '', email: provider?.email || '' },
      handler: function(response) {
        console.log('Razorpay success callback:', response);
        alert('Payment success! (Simulated)');
        localStorage.setItem('hasActiveSubscription', 'true');
        setHasSubscription(true);
        clearSelectedPlan();
      },
      modal: { ondismiss: function() { console.log('checkout closed'); } }
    };

    if (window.Razorpay) {
      const rzp = new window.Razorpay(options);
      rzp.open();
    } else {
      alert('Razorpay not initialized (development). Add SDK to test payments.');
    }
  };

  const handleSubscribe = async (plan) => {
    try {
      // Prevent double subscribe if already active
      if (hasSubscription) {
        alert('You already have an active subscription.');
        return;
      }
      const order = await createOrderOnServer(plan);
      openRazorpayCheckout(order, plan);
    } catch (err) {
      console.error(err);
      alert('Could not create order. Check console.');
    }
  };

  const handleProfileComplete = () => {
    setProfileCompleted(true);
    // After completing profile, if a plan was pre-selected, show prompt to subscribe
    const planFromStorage = JSON.parse(localStorage.getItem('selectedPlan') || 'null');
    if (planFromStorage) {
      // either auto-start payment or show CTA — we'll show a small confirm modal (simple alert here)
      const goToPay = window.confirm(`You selected the ${planFromStorage.name} plan earlier. Do you want to purchase it now?`);
      if (goToPay) handleSubscribe(planFromStorage);
      else {
        // clear selected plan or keep as reminder
      }
      clearSelectedPlan();
    } else {
      // no preselected plan -> normal dashboard
      setActiveView('dashboard');
    }
  };

  const renderContent = () => {
    switch (activeView) {
      case 'profile':
        return (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6">Profile & Verification</h2>
            <ProfileForm onProfileComplete={handleProfileComplete} />
          </>
        );
      case 'dashboard':
        return (
          <>
            <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Dashboard Overview</h2>
            
            {/* Banner if profile complete but subscription missing */}
            {!hasSubscription && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4 rounded-lg mb-6">
                <strong>Note:</strong> You don't have an active subscription. Go to the Plans section to activate and start receiving leads.
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid md:grid-cols-4 gap-6 mb-10">
              <StatCard icon={Briefcase} number={providerData.jobsCompleted} label="Jobs Completed" color="#10b981" />
              <StatCard icon={DollarSign} number={providerData.monthlyEarnings} label="Monthly Earnings" color="#f97316" />
              <StatCard icon={Star} number={providerData.rating} label="Average Rating" color="#f59e0b" />
              <StatCard icon={Zap} number="45" label="New Leads This Month" color="#06b6d4" />
            </div>

            {/* Quick Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between hover:shadow-xl transition cursor-pointer border-l-4 border-teal-600">
                    <div>
                        <h4 className='text-xl font-bold text-gray-900'>Complete Profile</h4>
                        <p className='text-gray-500'>Profile Strength: {providerData.profileStatus}</p>
                    </div>
                    <button onClick={() => setActiveView('profile')} className='text-teal-600 font-semibold flex items-center'>
                        {profileCompleted ? 'View Profile' : 'Finish Now'} <ChevronRight size={18} />
                    </button>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-lg flex items-center justify-between hover:shadow-xl transition cursor-pointer border-l-4 border-orange-600">
                    <div>
                        <h4 className='text-xl font-bold text-gray-900'>View New Leads</h4>
                        <p className='text-gray-500'>4 urgent requests waiting.</p>
                    </div>
                    <button onClick={() => setActiveView('jobs')} className='text-orange-600 font-semibold flex items-center'>
                        Go to Leads <ChevronRight size={18} />
                    </button>
                </div>
            </div>

            {/* Plans quick view in dashboard */}
            <div className="mb-10">
              <h3 className="text-xl font-bold mb-4">Subscription Plans</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { name: 'Basic', price: '₹499', period: 'month' },
                  { name: 'Professional', price: '₹999', period: 'month', popular: true },
                  { name: 'Enterprise', price: '₹1,999', period: 'month' }
                ].map((plan) => (
                  <div key={plan.name} className={`bg-white p-6 rounded-xl shadow-lg ${plan.popular ? 'ring-4 ring-orange-500 transform scale-100' : ''}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="text-lg font-bold text-teal-700">{plan.name}</div>
                        <div className="text-2xl font-extrabold">{plan.price} <span className="text-gray-500">/{plan.period}</span></div>
                      </div>
                      <div>
                        <button onClick={() => {
                          // If profile incomplete, force complete first
                          if (!profileCompleted) {
                            alert('Please complete your profile first.');
                            setActiveView('profile');
                            return;
                          }
                          // proceed to subscribe
                          handleSubscribe(plan);
                        }} className={`py-2 px-4 rounded-full font-semibold ${plan.popular ? 'bg-orange-600 text-white' : 'bg-teal-600 text-white'}`}>
                          {plan.popular ? 'Start Professional' : `Start ${plan.name}`}
                        </button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">Key benefits for {plan.name} plan...</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        );
      case 'jobs':
        return <h2 className="text-3xl font-extrabold text-gray-900">My Job Leads (Under Construction)</h2>;
      case 'earnings':
        return <h2 className="text-3xl font-extrabold text-gray-900">Payments & Earnings (Under Construction)</h2>;
      case 'settings':
        return <h2 className="text-3xl font-extrabold text-gray-900">Account Settings (Under Construction)</h2>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Mobile Sidebar Toggle */}
      <button 
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-teal-600 text-white rounded-lg shadow-lg"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-gray-900 text-white z-30 flex-shrink-0`}>
        
        {/* Logo/Header */}
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <span className="text-2xl font-extrabold text-teal-400">
            Ghar<span className='text-orange-400'>Seva</span> Pro
          </span>
        </div>

        {/* Profile Summary */}
        <div className="p-4 border-b border-gray-800 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-xl font-bold mb-2">
                {providerData.name.charAt(0)}
            </div>
            <p className="font-semibold text-lg">{providerData.name}</p>
            <p className="text-sm text-teal-300">{providerData.service}</p>
            <div className={`mt-1 text-xs font-medium px-2 py-1 rounded-full inline-flex items-center ${providerData.isVerified ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                <ShieldCheck size={14} className='mr-1'/> {providerData.isVerified ? 'Verified Partner' : 'Verification Pending'}
            </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveView(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition duration-200 ${
                activeView === item.id 
                  ? 'bg-teal-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className="mr-3" />
              <span className="font-medium">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Bar */}
        <header className="h-16 bg-white shadow-md flex items-center justify-end px-6 z-20">
            <div className="text-gray-600 font-medium">
                {providerData.location} | <span className='text-orange-600'>Subscription: {hasSubscription ? 'Pro' : 'None'}</span>
            </div>
        </header>

        {/* Content View */}
        <main className="p-8">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
