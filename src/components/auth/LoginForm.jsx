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
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input
                type="email"
                placeholder="Email Address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
            />

            <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-teal-600 text-white font-semibold rounded-lg
                   hover:bg-teal-700 transition duration-300 shadow-md hover:shadow-lg
                   disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Logging in...' : 'Log In'}
            </button>

            <p className="text-sm text-center text-gray-600">
                Don't have an account?{' '}
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        onClose();
                        openSignup();
                    }}
                    className="text-orange-600 hover:underline font-semibold"
                >
                    Sign Up
                </button>
            </p>
        </form>
    );
};

export default LoginForm;
