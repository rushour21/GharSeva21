// ServiceProviderDashboard.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Home,
  User,
  Settings,
  Briefcase,
  DollarSign,
  Star,
  Zap,
  Menu,
  X,
  ShieldCheck,
  LogOut,
  CheckCircle2,
} from "lucide-react";

import ProfileForm from "../components/provider/ProfileForm";
import StatCard from "../components/provider/StatCard";
import ProfileDetails from "../components/provider/ProfileDetails";
import Modal from "../components/common/Modal";

export default function ServiceProviderDashboard() {
  const [activeView, setActiveView] = useState("profile");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [providerProfile, setProviderProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // --- New States for Subscriptions ---
  const [mySubscription, setMySubscription] = useState(null);
  const [loadingSub, setLoadingSub] = useState(true);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);

  /* ---------------- Razorpay Loader ---------------- */
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) resolve(true);
      else resolve(false);
    });
  };

  /* ---------------- FETCH PROFILE ---------------- */
  const fetchProfile = async () => {
    try {
      setLoadingProfile(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/profile`,
        { withCredentials: true }
      );
      setProviderProfile(res.data.provider || null);
    } catch (err) {
      if (err.response?.status === 404) {
        setProviderProfile(null);
      } else {
        console.error("Profile fetch failed", err);
      }
    } finally {
      setLoadingProfile(false);
    }
  };

  /* ---------------- FETCH MY SUBSCRIPTION ---------------- */
  const fetchMySubscription = async () => {
    try {
      setLoadingSub(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/subscriptions/my`, // Updated path to match your route
        { withCredentials: true }
      );
      console.log(res.data.subscription);
      // Assuming the API returns an array of subscriptions, get the first active one
      const activeSub = res.data.subscription?.status === "active";
      setMySubscription(res.data.subscription);

      // LOGIC: If NO active subscription, fetch available plans
      if (!activeSub) {
        fetchPlans();
      }
    } catch (err) {
      console.error("Failed to fetch my subscriptions", err);
      // If error (like 404), allow fetching plans as fallback
      fetchPlans();
    } finally {
      setLoadingSub(false);
    }
  };

  /* ---------------- FETCH PLANS ---------------- */
  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/subscriptions/plans`
      );
      setPlans(res.data.plans || []);
    } catch (err) {
      console.error("Failed to fetch plans", err);
    } finally {
      setLoadingPlans(false);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchMySubscription();
  }, []);

  /* ---------------- DERIVED DATA ---------------- */
  const providerData = providerProfile && {
    name: providerProfile.name,
    service: providerProfile.serviceCategory,
    location: providerProfile.location,
    rating: providerProfile.rating || "—",
    jobsCompleted: providerProfile.jobsCompleted || 0,
    monthlyEarnings: providerProfile.monthlyEarnings
      ? `₹${providerProfile.monthlyEarnings}`
      : "—",
    isVerified: providerProfile.isVerified,
    hasSubscription: !!mySubscription, // Now derived from our actual sub check
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/logout`,
        { withCredentials: true }
      );
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  /* ---------------- BUY PLAN ---------------- */
  const handleBuyPlan = async (plan) => {
    try {
      const loaded = await loadRazorpay();
      if (!loaded) {
        alert("Razorpay SDK failed to load");
        return;
      }

      const orderRes = await axios.post(
        `${import.meta.env.VITE_API_URL}/subscriptions/create-order`,
        { planKey: plan.key },
        { withCredentials: true }
      );

      const { orderId, amount, currency } = orderRes.data;

      const options = {
        key: orderRes.data.key,
        amount,
        currency,
        order_id: orderId,
        name: "GharSeva",
        description: `${plan.name} Subscription`,
        prefill: {
          name: providerProfile?.name || "",
          email: providerProfile?.email || "",
        },
        theme: { color: "#ea580c" },
        handler: async function (response) {
          try {
            await axios.post(
              `${import.meta.env.VITE_API_URL}/subscriptions/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              },
              { withCredentials: true }
            );

            alert("Subscription activated 🎉");
            fetchProfile();
            fetchMySubscription(); // Refresh sub status
          } catch (err) {
            console.error("Verify failed", err);
            alert("Payment successful but verification failed");
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed. Try again.");
    }
  };

  /* ---------------- RENDER CONTENT ---------------- */
  const renderContent = () => {
    if (loadingProfile || loadingSub) {
      return <div className="p-10 text-center">Loading Dashboard...</div>;
    }

    // --- RESTRICT ACCESS IF PROFILE NOT CREATED ---
    if (!providerProfile && ["dashboard", "jobs", "earnings"].includes(activeView)) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-fade-in-up">
          <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShieldCheck size={48} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-3">Complete Your Profile</h2>
          <p className="text-gray-500 max-w-md mb-8 text-lg">
            Access to the Dashboard, Leads, and Earnings is restricted. Please complete your profile verification to unlock these features.
          </p>
          <button
            onClick={() => setIsProfileModalOpen(true)}
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-lg font-bold rounded-full shadow-xl hover:shadow-orange-200 hover:scale-105 transition-all flex items-center"
          >
            <User size={20} className="mr-2" />
            Complete Profile Now
          </button>
        </div>
      );
    }

    switch (activeView) {
      case "profile":
        return (
          <>
            <h2 className="text-3xl font-extrabold mb-6">Profile & Verification</h2>
            {providerProfile ? (
              <ProfileDetails
                provider={providerProfile}
                onEdit={() => setIsProfileModalOpen(true)}
              />
            ) : (
              <div className="bg-white p-10 rounded-xl border border-dashed text-center">
                <User size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold">Profile Not Created Yet</h3>
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="px-6 py-3 bg-orange-600 text-white rounded-full font-bold mt-4"
                >
                  Create Profile
                </button>
              </div>
            )}
          </>
        );

      case "dashboard":
        return (
          <>
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-800">Dashboard Overview</h2>
                <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
              </div>
              <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 mt-4 md:mt-0">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
            </div>

            {/* Subscription Status Banner */}
            {mySubscription ? (
              <div className="bg-gradient-to-r from-teal-50 to-white border border-teal-200 p-6 mb-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between">
                <div className="flex items-start mb-4 md:mb-0">
                  <div className="bg-teal-100 p-3 rounded-full mr-4 text-teal-600">
                    <CheckCircle2 size={24} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-teal-900">Active Subscription: <span className="text-teal-600">{mySubscription.planName || "Basic"}</span></h3>
                    <p className="text-teal-700 text-sm mt-1">
                      Your plan is active and valid until <span className="font-semibold">{new Date(mySubscription.endDate).toLocaleDateString()}</span>.
                    </p>
                  </div>
                </div>
                <div className="bg-teal-600 text-white px-5 py-2 rounded-full text-sm font-bold shadow-teal-200 shadow-lg uppercase tracking-wide">
                  {mySubscription.status}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-orange-50 to-white border border-orange-200 p-6 mb-8 rounded-2xl shadow-sm flex flex-col md:flex-row items-center justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-2 -mr-2 w-24 h-24 bg-orange-100 rounded-full opacity-50 blur-xl"></div>
                <div className="flex items-start z-10 mb-4 md:mb-0">
                  <div className="bg-orange-100 p-3 rounded-full mr-4 text-orange-600">
                    <Zap size={24} fill="currentColor" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Unlock Your Business Potential</h3>
                    <p className="text-gray-600 text-sm mt-1 max-w-lg">
                      Activate a subscription plan to start receiving verified leads and boost your monthly earnings.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => document.getElementById('plans-section')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-orange-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-orange-200 hover:bg-orange-700 transition transform hover:-translate-y-0.5 z-10"
                >
                  View Plans
                </button>
              </div>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Briefcase size={24} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">All Time</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900">{providerData.jobsCompleted}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">Jobs Completed</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-xl group-hover:bg-green-600 group-hover:text-white transition-colors">
                    <DollarSign size={24} />
                  </div>
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-lg">+12%</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900">{providerData.monthlyEarnings}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">Monthly Earnings</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl group-hover:bg-yellow-500 group-hover:text-white transition-colors">
                    <Star size={24} fill="currentColor" />
                  </div>
                  <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-lg">Average</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900">{providerData.rating}</div>
                <div className="text-sm text-gray-500 font-medium mt-1">Customer Rating</div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                    <Zap size={24} />
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-lg">New</span>
                </div>
                <div className="text-3xl font-extrabold text-gray-900">—</div>
                <div className="text-sm text-gray-500 font-medium mt-1">New Leads Today</div>
              </div>
            </div>

            {/* Plans Section */}
            {!mySubscription && (
              <div id="plans-section" className="animate-fade-in-up">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Create Your Success Story</h3>
                  <a href="#" className="text-teal-600 font-semibold text-sm hover:underline">Compare all features</a>
                </div>

                {loadingPlans ? (
                  <div className="bg-white p-12 rounded-2xl border border-dashed text-center text-gray-500">
                    Loading available plans...
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-8">
                    {plans.map((plan) => (
                      <div
                        key={plan._id}
                        className={`relative bg-white p-8 rounded-2xl transition-all duration-300 ${plan.sortOrder === 1
                          ? "ring-2 ring-orange-500 shadow-xl scale-105 z-10"
                          : "border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1"
                          }`}
                      >
                        {plan.sortOrder === 1 && (
                          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-600 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-md">
                            Most Popular
                          </div>
                        )}

                        <div className="mb-4">
                          <h4 className={`text-lg font-bold ${plan.sortOrder === 1 ? "text-orange-600" : "text-gray-800"}`}>{plan.name}</h4>
                          <div className="mt-2 flex items-baseline">
                            <span className="text-4xl font-extrabold text-gray-900">₹{plan.amount / 100}</span>
                            <span className="ml-2 text-gray-500 font-medium">/{plan.duration.value} {plan.duration.unit}</span>
                          </div>
                        </div>

                        <hr className="border-gray-100 my-6" />

                        <ul className="space-y-4 mb-8">
                          {plan.features.map((f, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-600">
                              <CheckCircle2 size={18} className={`mr-3 flex-shrink-0 mt-0.5 ${plan.sortOrder === 1 ? "text-orange-500" : "text-teal-500"}`} />
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>

                        <button
                          onClick={() => handleBuyPlan(plan)}
                          className={`w-full py-3.5 rounded-xl font-bold transition-all shadow-lg ${plan.sortOrder === 1
                            ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-200 hover:to-orange-700"
                            : "bg-gray-900 text-white hover:bg-gray-800 hover:shadow-gray-200"
                            }`}
                        >
                          Choose {plan.name}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        );

      case "jobs":
        return (
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6">My Leads</h2>

            {/* Empty State for Leads */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
              <div className="w-24 h-24 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <Briefcase size={40} className="text-teal-500" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">No New Leads Currently</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-8">
                We're looking for customers in your area. Ensure your profile is 100% complete and verified to receive more job requests.
              </p>
              <button
                onClick={() => setActiveView("profile")}
                className="px-6 py-3 bg-teal-600 text-white rounded-full font-bold hover:bg-teal-700 transition shadow-lg"
              >
                Review Profile
              </button>
            </div>
          </div>
        );

      case "earnings":
        return (
          <div className="space-y-8">
            <h2 className="text-3xl font-extrabold text-gray-800 mb-6">Earnings & Payouts</h2>

            {/* Zero State Summary */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 font-medium mb-1">Total Earnings</div>
                <div className="text-3xl font-extrabold text-gray-900">₹0</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 font-medium mb-1">Pending Payout</div>
                <div className="text-3xl font-extrabold text-gray-900">₹0</div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <div className="text-gray-500 font-medium mb-1">Jobs Completed</div>
                <div className="text-3xl font-extrabold text-gray-900">0</div>
              </div>
            </div>

            {/* Empty State for Transactions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-bold text-lg text-gray-800">Transaction History</h3>
              </div>
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <DollarSign size={32} className="text-gray-400" />
                </div>
                <h4 className="text-lg font-bold text-gray-700 mb-1">No Earnings Yet</h4>
                <p className="text-gray-500 text-sm">When you complete jobs, your transaction details will appear here.</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-50 flex font-sans">
      {/* Sidebar - Desktop */}
      <div className={`fixed inset-y-0 left-0 bg-gradient-to-b from-gray-900 to-gray-800 text-white w-72 transform transition-transform duration-300 ease-in-out z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static flex flex-col shadow-2xl`}>
        <div className="h-20 flex items-center justify-center border-b border-gray-700/50">
          <div className="text-2xl font-extrabold tracking-wide">
            Ghar<span className="text-orange-500">Seva</span> <span className="text-teal-400 text-lg font-bold bg-gray-800 px-2 py-0.5 rounded-md ml-1">PRO</span>
          </div>
        </div>

        {providerData && (
          <div className="p-6 text-center border-b border-gray-700/50 bg-gray-800/30">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full mx-auto flex items-center justify-center text-3xl font-bold text-white shadow-lg ring-4 ring-gray-700 mb-3">
              {providerData.name[0]}
            </div>
            <p className="font-bold text-lg tracking-wide">{providerData.name}</p>
            <p className="text-sm text-teal-300 font-medium mb-2">{providerData.service}</p>

            <div className={`text-xs font-bold px-3 py-1 rounded-full inline-flex items-center space-x-1 ${providerData.isVerified ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
              <ShieldCheck size={12} strokeWidth={3} />
              <span>{providerData.isVerified ? "Verified Partner" : "Verification Pending"}</span>
            </div>
          </div>
        )}

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {[
            { id: "profile", icon: User, label: "Profile Overview" },
            { id: "dashboard", icon: Home, label: "Dashboard" },
            { id: "jobs", icon: Briefcase, label: "My Leads" },
            { id: "earnings", icon: DollarSign, label: "Earnings & Payouts" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => { setActiveView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center px-5 py-3.5 rounded-xl transition-all duration-200 group ${activeView === item.id
                ? "bg-teal-600 text-white shadow-lg shadow-teal-900/20 font-semibold"
                : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                }`}
            >
              <item.icon size={20} className={`mr-3 transition-colors ${activeView === item.id ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
              {item.label}
              {activeView === item.id && <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="m-4 p-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl flex items-center justify-center transition-colors font-medium border border-transparent hover:border-red-500/20"
        >
          <LogOut size={20} className="mr-2" />
          Sign Out
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
        {/* Mobile Header */}
        <div className="md:hidden bg-white shadow-md p-4 flex items-center justify-between sticky top-0 z-20">
          <div className="font-bold text-xl text-gray-800">
            Ghar<span className="text-orange-500">Seva</span> Pro
          </div>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-md hover:bg-gray-100 text-gray-600">
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </div>

      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Manage Profile"
      >
        <ProfileForm
          onProfileComplete={() => {
            setIsProfileModalOpen(false);
            fetchProfile();
          }}
        />
      </Modal>
    </div>
  );
}