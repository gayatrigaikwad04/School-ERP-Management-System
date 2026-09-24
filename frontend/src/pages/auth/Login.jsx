import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export const Login = () => {
  const [email, setEmail] = useState('admin@oakridge.edu.in');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please provide both email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      showToast('Welcome back! Logged in successfully.', 'success');
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please verify email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('admin@oakridge.edu.in');
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* Brand Crest */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-blue-700 flex items-center justify-center text-white shadow-md">
            <span className="material-symbols-outlined text-3xl">school</span>
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 font-headline">
          Oakridge Academy
        </h2>
        <p className="mt-1 text-center text-sm text-slate-500 font-medium">
          SchoolERP • Administrative Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-xs text-rose-700">
                <span className="material-symbols-outlined text-base text-rose-600">error</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  mail
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@oakridge.edu.in"
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[11px] text-slate-400">Demo: admin123</span>
              </div>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                  lock
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-colors"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white font-semibold text-sm shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-base">login</span>
                    <span>Sign In to SchoolERP</span>
                  </>
                )}
              </button>
            </div>

            {/* Demo Helper Button */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">MERN Development Mode</span>
              <button
                type="button"
                onClick={handleDemoFill}
                className="text-xs font-semibold text-blue-700 hover:underline"
              >
                Auto-fill Demo Admin
              </button>
            </div>
          </form>
        </div>

        {/* Security / System Footer Note */}
        <div className="mt-6 text-center text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-sm">verified_user</span>
          <span>Encrypted JWT Authentication • Role: School Administrator</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
