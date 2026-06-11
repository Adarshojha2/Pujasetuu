import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus, User, Phone, Mail, Lock, Gift, AlertCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [referredByCode, setReferredByCode] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      return setError('Please fill in all required fields');
    }

    try {
      setError('');
      setSubmitting(true);
      const res = await register({
        name,
        email,
        phone,
        password,
        role,
        referredByCode
      });

      if (res.success) {
        if (res.user.role === 'pandit') {
          navigate('/pandit-dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(res.message);
      }
    } catch (err) {
      setError('Registration failed. Please check your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-orange-50/20">
      <div className="w-full max-w-md bg-white rounded-3xl border border-orange-100 shadow-xl overflow-hidden p-8 space-y-6">
        
        <div className="text-center space-y-2">
          <span className="text-4xl block">🙏</span>
          <h2 className="text-3xl font-extrabold text-gray-900 font-outfit">Join PujaSetu</h2>
          <p className="text-gray-500 text-sm">Register to begin booking Pandits or purchasing puja essentials</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-red-700 font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 p-1 bg-orange-50 rounded-xl border border-orange-100">
            <button
              type="button"
              onClick={() => setRole('user')}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                role === 'user'
                  ? 'bg-saffron-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-saffron-600'
              }`}
            >
              Devotee (Customer)
            </button>
            <button
              type="button"
              onClick={() => setRole('pandit')}
              className={`py-2 text-sm font-bold rounded-lg transition-all ${
                role === 'pandit'
                  ? 'bg-saffron-500 text-white shadow-sm'
                  : 'text-gray-600 hover:text-saffron-600'
              }`}
            >
              Pandit Ji (Priest)
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Full Name</label>
            <div className="relative">
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rahul Sharma"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm bg-orange-50/10"
              />
              <User className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-orange-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="rahul@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm bg-orange-50/10"
              />
              <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-orange-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Phone Number</label>
            <div className="relative">
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="9876543210"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm bg-orange-50/10"
              />
              <Phone className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-orange-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Password</label>
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 mb-1">Referral Code (Optional)</label>
            <div className="relative">
              <input
                type="text"
                value={referredByCode}
                onChange={(e) => setReferredByCode(e.target.value)}
                placeholder="CODE123"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-200 focus:outline-none focus:ring-2 focus:ring-saffron-500 focus:border-transparent text-sm bg-orange-50/10"
              />
              <Gift className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-orange-400" />
            </div>
            {referredByCode && (
              <p className="text-[10px] text-saffron-600 mt-1 font-semibold">10% discount coupon will apply upon success</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-saffron-500 hover:bg-saffron-600 text-white font-extrabold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center space-x-2"
          >
            <UserPlus className="h-5 w-5" />
            <span>{submitting ? 'Registering...' : 'Sign Up'}</span>
          </button>
        </form>

        <div className="text-center pt-4 text-sm text-gray-500 border-t border-orange-50">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-saffron-600 hover:text-saffron-700 underline">
            Sign In
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;
