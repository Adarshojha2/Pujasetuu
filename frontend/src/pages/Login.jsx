import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Get redirect path or fallback to home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError('Please fill in all fields');
    }

    try {
      setError('');
      setSubmitting(true);
      const res = await login(email, password);

      if (res.success) {
        // Redirect based on role
        if (res.user.role === 'admin') {
          navigate('/admin-dashboard');
        } else if (res.user.role === 'pandit') {
          navigate('/pandit-dashboard');
        } else {
          navigate(from, { replace: true });
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-orange-50/20">
      <div className="w-full max-w-md bg-white rounded-3xl border border-orange-100 shadow-xl overflow-hidden p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-4xl block">🧘</span>
          <h2 className="text-3xl font-extrabold text-gray-900 font-outfit">Welcome back</h2>
          <p className="text-gray-500 text-sm">Log in to check your bookings and marketplace cart</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm bg-orange-50/10"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-orange-400" />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">Password</label>
            </div>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm bg-orange-50/10"
              />
              <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-orange-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
          >
            <LogIn className="h-5 w-5" />
            <span>{submitting ? 'Authenticating...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center pt-4 text-sm text-gray-500 border-t border-orange-50">
          New to PujaSetu?{' '}
          <Link to="/register" className="font-bold text-saffron-600 hover:text-saffron-700 underline">
            Create an Account
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Login;
