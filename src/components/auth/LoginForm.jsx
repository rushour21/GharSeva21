import React, { useState } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const LoginForm = ({ onClose, openSignup, onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post(
                `${API_URL}/api/auth/login`,
                { email, password }
            );

            if (response.status === 200) {
                const user = {
                    id: response.data.user._id,
                    name: response.data.user.name,
                    email: response.data.user.email,
                };

                localStorage.setItem('user', JSON.stringify(user));
                onLoginSuccess?.(response.data.user);
                onClose();
            }
        } catch (error) {
            console.error('Login failed:', error);
            alert('Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                        type="email"
                        placeholder="Your email address"
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
                        placeholder="Your password"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50 hover:bg-white"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                    />
                </div>
            </div>

            <div className="pt-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-xl
                       hover:from-teal-700 hover:to-teal-800 transition-all duration-300 shadow-lg hover:shadow-teal-200
                       disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </div>

            <p className="text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        onClose();
                        openSignup();
                    }}
                    className="text-orange-600 hover:text-orange-700 hover:underline font-bold transition-colors"
                >
                    Sign Up
                </button>
            </p>
        </form>
    );
};

export default LoginForm;
