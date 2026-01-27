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
        <form className="space-y-4" onSubmit={handleSubmit}>
            <input
                type="text"
                placeholder="Full Name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
            />

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
                placeholder="Create Password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 transition"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
            />

            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-600 text-white font-semibold rounded-lg
                   hover:bg-orange-700 transition duration-300 shadow-md hover:shadow-lg
                   disabled:opacity-60 disabled:cursor-not-allowed"
            >
                {loading ? 'Signing up...' : 'Sign Up'}
            </button>

            <p className="text-sm text-center text-gray-600">
                Already have an account?{' '}
                <button
                    type="button"
                    disabled={loading}
                    onClick={() => {
                        onClose();
                        openLogin();
                    }}
                    className="text-teal-600 hover:underline font-semibold"
                >
                    Log In
                </button>
            </p>
        </form>
    );
};

export default SignupForm;
