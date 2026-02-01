import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const SignupForm = ({ onClose, openLogin, onSignupSuccess, presetPlan }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/signup`,
                { name, email, password }
            );

            if (response.status === 201) {
                // Corrected based on previous fix
                const user = {
                    id: response.data.user._id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                };

                onSignupSuccess?.(response.data.user);
                onClose();
            }
        } catch (error) {
            console.error('Signup failed:', error);

            const message =
                error.response?.data?.message ||
                'Signup failed. Please try again.';

            alert(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 hover:bg-white"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        placeholder="rahul@example.com"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 hover:bg-white"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={loading}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <input
                        type="password"
                        placeholder="Create a strong password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 hover:bg-white"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                    <p className="text-xs text-gray-400 mt-1">Must be at least 8 characters long</p>
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white font-bold rounded-xl
                       hover:from-orange-700 hover:to-orange-800 transition-all duration-300 shadow-lg hover:shadow-orange-200
                       disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {loading ? 'Creating Account...' : 'Sign Up & Get Started'}
                </button>
            </div>

            <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        onClose();
                        openLogin();
                    }}
                    className="text-teal-600 hover:text-teal-700 hover:underline font-bold transition-colors"
                >
                    Log In
                </button>
            </p>
        </form>
    );
};

export default SignupForm;
