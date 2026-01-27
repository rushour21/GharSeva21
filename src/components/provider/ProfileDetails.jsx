import React from 'react';
import { User, MapPin, Briefcase, Phone, Mail, ShieldCheck, CheckCircle, Edit } from 'lucide-react';

const ProfileDetails = ({ provider, onEdit }) => {
    if (!provider) return null;

    return (
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
            {/* Header / Cover */}
            <div className="bg-slate-800 h-32 relative">
                <div className="absolute -bottom-16 left-8">
                    <img
                        src={provider.profilePhotoUrl || "https://api.dicebear.com/7.x/avataaars/svg?seed=" + provider.name}
                        alt={provider.name}
                        className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover bg-white"
                    />
                </div>
                <div className="absolute top-4 right-4">
                    <button
                        onClick={onEdit}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-full backdrop-blur-sm transition transition-all"
                    >
                        <Edit size={16} /> Edit Profile
                    </button>
                </div>
            </div>

            <div className="pt-20 px-8 pb-8">
                {/* Name and Basic Info */}
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-800">{provider.name}</h2>
                        <div className="flex items-center text-slate-500 mt-1 space-x-4 text-sm">
                            <span className="flex items-center"><MapPin size={16} className="mr-1 text-teal-600" /> {provider.primaryServiceArea || 'Pune'}</span>
                            <span className="flex items-center"><Briefcase size={16} className="mr-1 text-teal-600" /> {provider.primaryService || 'Service Provider'}</span>
                        </div>
                    </div>

                    <div className={`px-4 py-2 rounded-full flex items-center gap-2 font-medium text-sm ${provider.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {provider.isVerified ? <ShieldCheck size={18} /> : <ShieldCheck size={18} />}
                        {provider.isVerified ? 'Verified Partner' : 'Verification Pending'}
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Left Column: Details */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center"><User size={20} className="mr-2 text-teal-600" /> About Me</h3>
                            <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                                {provider.description || "No description provided."}
                            </p>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-xl p-5 shadow-sm">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Contact Information</h3>
                            <div className="space-y-3">
                                <div className="flex items-center text-slate-700">
                                    <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-3 text-teal-600">
                                        <Phone size={16} />
                                    </div>
                                    {provider.phone}
                                </div>
                                {provider.email && (
                                    <div className="flex items-center text-slate-700">
                                        <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center mr-3 text-teal-600">
                                            <Mail size={16} />
                                        </div>
                                        {provider.email}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Status & Docs */}
                    <div className="space-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-700 mb-3 flex items-center"><ShieldCheck size={20} className="mr-2 text-teal-600" /> Documentation</h3>
                            <div className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
                                <div className="flex items-center">
                                    <div className="bg-slate-100 p-2 rounded-lg mr-3">
                                        <span className="font-bold text-slate-500 text-xs">ID</span>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-700">Aadhaar Card</p>
                                        <p className="text-xs text-slate-500">Uploaded for verification</p>
                                    </div>
                                </div>
                                {provider.aadhaarUrl ? (
                                    <span className="text-green-600 flex items-center text-sm font-medium"><CheckCircle size={16} className="mr-1" /> Uploaded</span>
                                ) : (
                                    <span className="text-red-500 text-sm font-medium">Missing</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-5">
                            <h3 className="text-orange-800 font-bold mb-2">Profile Status</h3>
                            <div className="w-full bg-orange-200 rounded-full h-2.5 mb-2">
                                <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: provider.isVerified ? '100%' : '85%' }}></div>
                            </div>
                            <p className="text-xs text-orange-700">
                                {provider.isVerified ? "Your profile is 100% complete and verified!" : "Your profile is almost complete. Verification is pending."}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileDetails;
