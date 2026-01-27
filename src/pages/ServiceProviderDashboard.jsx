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
            <h2 className="text-3xl font-extrabold mb-8">Dashboard Overview</h2>

            {/* Subscription Summary Card */}
            {mySubscription ? (
              <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8 rounded-r-xl shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center text-green-700 font-bold text-lg mb-1">
                      <CheckCircle2 className="mr-2" size={20} />
                      Active Subscription: {mySubscription.planName || "Basic"}
                    </div>
                    <p className="text-green-600 text-sm">
                      Valid until: {new Date(mySubscription.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-green-100 text-green-700 px-4 py-1 rounded-full text-xs font-bold uppercase">
                    Status: {mySubscription.status}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                Activate a subscription to receive leads and grow your business.
              </div>
            )}

            <div className="grid md:grid-cols-4 gap-6 mb-10">
              <StatCard icon={Briefcase} number={providerData.jobsCompleted} label="Jobs Completed" />
              <StatCard icon={DollarSign} number={providerData.monthlyEarnings} label="Monthly Earnings" />
              <StatCard icon={Star} number={providerData.rating} label="Rating" />
              <StatCard icon={Zap} number="—" label="New Leads" />
            </div>

            {/* Only show Plans if there is no active subscription */}
            {!mySubscription && (
              <>
                <h3 className="text-xl font-bold mb-4">Subscription Plans</h3>
                {loadingPlans ? (
                  <div>Loading plans...</div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                      <div
                        key={plan._id}
                        className={`bg-white p-6 rounded-xl shadow ${
                          plan.sortOrder === 1 ? "ring-4 ring-orange-500" : ""
                        }`}
                      >
                        <div className="text-lg font-bold">{plan.name}</div>
                        <div className="text-2xl font-extrabold mb-2">₹{plan.amount / 100}</div>
                        <div className="text-sm text-gray-500 mb-3">
                          {plan.duration.value} {plan.duration.unit}
                        </div>
                        <ul className="text-sm text-gray-600 mb-4 space-y-1">
                          {plan.features.map((f, i) => (
                            <li key={i}>• {f}</li>
                          ))}
                        </ul>
                        <button
                          onClick={() => handleBuyPlan(plan)}
                          className="w-full py-2 rounded-full bg-orange-600 text-white font-semibold hover:bg-orange-700 transition"
                        >
                          Buy Now
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        );

      case "jobs":
        return <h2 className="text-2xl font-bold">My Leads</h2>;
      case "earnings":
        return <h2 className="text-2xl font-bold">Payments</h2>;
      case "settings":
        return <h2 className="text-2xl font-bold">Settings</h2>;
      default:
        return null;
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="min-h-screen bg-gray-100 flex">
      <div className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center font-bold text-xl">
          Ghar<span className="text-orange-400">Seva</span> Pro
        </div>

        {providerData && (
          <div className="p-4 border-b border-gray-800 text-center">
            <div className="w-16 h-16 bg-orange-500 rounded-full mx-auto flex items-center justify-center text-xl font-bold">
              {providerData.name[0]}
            </div>
            <p className="mt-2 font-semibold">{providerData.name}</p>
            <p className="text-sm text-teal-300">{providerData.service}</p>
            <div className="mt-2 text-xs bg-green-600 rounded-full px-2 py-1 inline-flex items-center">
              <ShieldCheck size={14} className="mr-1" />
              {providerData.isVerified ? "Verified" : "Pending"}
            </div>
          </div>
        )}

        <nav className="flex-1 p-2 space-y-2">
          {[
            { id: "profile", icon: User, label: "Profile" },
            { id: "dashboard", icon: Home, label: "Dashboard" },
            { id: "jobs", icon: Briefcase, label: "Leads" },
            { id: "earnings", icon: DollarSign, label: "Earnings" },
            { id: "settings", icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center px-4 py-3 rounded ${
                activeView === item.id ? "bg-teal-600" : "hover:bg-gray-800"
              }`}
            >
              <item.icon size={18} className="mr-3" />
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="p-4 text-red-400 hover:bg-gray-800 flex items-center mt-auto"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>

      <div className="flex-1 p-8 overflow-y-auto">{renderContent()}</div>

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