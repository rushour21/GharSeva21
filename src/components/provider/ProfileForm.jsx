import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  User,
  Upload,
  ShieldCheck,
  Edit2,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  CheckCircle2
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const SERVICE_SUGGESTIONS = {
  Plumbing: [
    "Hi, I am {name}, a skilled plumber with experience in leak repairs and fittings.",
    "{name} here! I specialize in bathroom, kitchen, and pipeline plumbing services.",
    "Reliable and quick plumbing service by {name} for homes and offices.",
  ],
  Electrical: [
    "Hello, I’m {name}, an experienced electrician for home wiring and repairs.",
    "{name} provides safe and efficient electrical services at affordable prices.",
    "Expert in electrical installation, maintenance, and fault fixing – {name}.",
  ],
  Carpentry: [
    "I’m {name}, a professional carpenter specializing in furniture and fittings.",
    "{name} offers quality woodwork, repairs, and custom carpentry solutions.",
    "Trusted carpentry services for homes and offices by {name}.",
  ],
  "AC Repair": [
    "Hi, I’m {name}, providing AC repair, servicing, and installation.",
    "{name} ensures fast and reliable AC maintenance and cooling solutions.",
    "Expert AC technician {name} for all cooling needs.",
  ],
};

/* --- SUB-COMPONENTS --- */

const FormField = ({ label, children }) => (
  <div className="flex flex-col space-y-1.5 w-full">
    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center">
      {label}
    </label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-all placeholder:text-slate-400 text-slate-700"
  />
);

const Select = ({ options, ...props }) => (
  <div className="relative">
    <select
      {...props}
      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-teal-500 outline-none transition-all appearance-none cursor-pointer text-slate-700"
    >
      <option value="">Choose an option</option>
      {options.map((o) => (
        <option key={o} value={o}>{o}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
    </div>
  </div>
);

/* --- MAIN COMPONENT --- */

const ProfileForm = ({ onProfileComplete }) => {
  const storedUser = JSON.parse(localStorage.getItem("providerUser") || "{}");

  const [loading, setLoading] = useState(false);
  const [aadhaarFile, setAadhaarFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profilePhoto, setProfilePhoto] = useState(null);

  const [form, setForm] = useState({
    name: storedUser.name || "",
    whatsapp: storedUser.phone || "",
    email: storedUser.email || "",
    service: "",
    area: "",
    description: "",
  });

  // Dynamic Suggestions logic
  const currentSuggestions =
    SERVICE_SUGGESTIONS[form.service]?.map((s) =>
      s.replace("{name}", form.name || "I")
    ) || [];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleChipClick = (text) => {
    if (!form.description.includes(text)) {
      setForm((prev) => ({
        ...prev,
        description: prev.description ? `${prev.description.trim()} ${text}` : text,
      }));
    }
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfilePhoto(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic Validation
    if (!aadhaarFile) {
      alert("Please upload your Aadhaar card for verification.");
      return;
    }

    setLoading(true);

    try {
      // 1. Initialize FormData
      const payload = new FormData();

      // 2. Append Text Data
      payload.append("name", form.name);
      payload.append("phone", form.whatsapp);
      payload.append("primaryService", form.service);
      payload.append("serviceArea", form.area); // Sent as a string or adjust based on backend needs
      payload.append("description", form.description);
      payload.append("email", form.email);

      // 3. Append Files 
      // The keys ('profilePhoto' and 'aadhaar') must match what your backend expects
      if (profilePhoto) {
        payload.append("profilePhoto", profilePhoto);
      }
      if (aadhaarFile) {
        payload.append("aadhaar", aadhaarFile);
      }

      // 4. Send Request
      const response = await axios.post(`${API_URL}/api/profile`, payload, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200 || response.status === 201) {
        localStorage.setItem("providerProfileCompleted", "true");
        onProfileComplete?.();
        alert("Profile updated successfully!");
      }
    } catch (err) {
      console.error("Submission Error:", err);
      const errorMsg = err.response?.data?.message || "Failed to save profile. Please check file sizes.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-teal-600 p-6 text-white rounded-t-xl">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold">Complete Your Profile</h2>
            <p className="text-teal-50 opacity-90 text-sm">This information helps customers trust and hire you.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">

        {/* SECTION 1: IDENTITY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 group transition-all hover:border-teal-400">
            <div className="relative">
              <img
                src={profilePreview || "https://api.dicebear.com/7.x/avataaars/svg?seed=service"}
                className="w-40 h-40 rounded-full object-cover border-8 border-white shadow-xl"
                alt="Profile"
              />
              <label className="absolute bottom-2 right-2 p-3 bg-teal-600 text-white rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                <Upload size={20} />
                <input type="file" hidden accept="image/*" onChange={handleProfileUpload} />
              </label>
            </div>
            <h5 className="mt-4 font-bold text-slate-800">Profile Photo</h5>
            <p className="text-xs text-slate-500 text-center mt-2">Professional photos get 3x more bookings</p>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Full Name">
              <Input name="name" value={form.name} onChange={handleChange} placeholder="John Doe" required />
            </FormField>
            <FormField label="WhatsApp Number">
              <Input name="whatsapp" value={form.whatsapp} onChange={handleChange} placeholder="+91 9876543210" required />
            </FormField>
            <div className="md:col-span-2">
              <FormField label="Email Address">
                <Input value={form.email} disabled className="bg-slate-100 text-slate-400 cursor-not-allowed border-transparent" />
              </FormField>
            </div>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* SECTION 2: SERVICE & AREA */}
        <div className="space-y-8">
          <div className="flex items-center space-x-2 text-teal-700">
            <Briefcase size={20} />
            <h4 className="text-xl font-bold">Service Details</h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField label="Primary Profession">
              <Select
                name="service"
                value={form.service}
                onChange={handleChange}
                options={["Plumbing", "Electrical", "Carpentry", "AC Repair"]}
                required
              />
            </FormField>
            <FormField label="Primary Service Area">
              <Select
                name="area"
                value={form.area}
                onChange={handleChange}
                options={["Wakad", "Hinjewadi", "Baner", "Hadapsar"]}
                required
              />
            </FormField>
          </div>

          {/* DYNAMIC SUGGESTIONS CHIPS */}
          {form.service && currentSuggestions.length > 0 && (
            <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 animate-in fade-in slide-in-from-top-4 duration-500">
              <p className="text-xs font-black text-orange-700 uppercase tracking-widest mb-4 flex items-center">
                <span className="w-2 h-2 bg-orange-400 rounded-full mr-2"></span>
                Quick Suggestions for {form.service}
              </p>
              <div className="flex flex-wrap gap-3">
                {currentSuggestions.map((text, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleChipClick(text)}
                    className="text-sm bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl hover:bg-orange-600 hover:text-white hover:border-orange-600 transition-all text-left shadow-sm font-medium"
                  >
                    + {text}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: BIO & DOCUMENTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <FormField label="Detailed Bio / Experience">
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={6}
              required
              placeholder="Describe your work history, specializations, and why customers should hire you..."
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-[1.5rem] focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none text-slate-700"
            />
          </FormField>

          <div className="flex flex-col space-y-4">
            <label className="text-sm font-bold text-slate-700 ml-1">Identity Verification</label>
            <div className="relative group flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-200 rounded-[1.5rem] bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
              <Upload className="text-slate-400 group-hover:text-teal-600 mb-2 transition-colors" size={32} />
              <span className="text-sm font-semibold text-slate-600">
                {aadhaarFile ? aadhaarFile.name : "Upload Aadhaar Card (Front)"}
              </span>
              <span className="text-xs text-slate-400 mt-1">PDF, JPG or PNG (Max 5MB)</span>
              <input
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => setAadhaarFile(e.target.files[0])}
              />
            </div>
            {aadhaarFile && (
              <div className="flex items-center text-teal-600 text-sm font-bold bg-teal-50 p-3 rounded-xl border border-teal-100">
                <CheckCircle2 size={16} className="mr-2" /> File attached successfully!
              </div>
            )}
          </div>
        </div>

        {/* FINAL ACTION */}
        <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm max-w-sm">
            By saving this profile, you agree to our Service Provider Terms and Conditions.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="w-full md:w-auto px-16 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-orange-200 transition-all hover:-translate-y-1 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving your details..." : "Complete My Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileForm;