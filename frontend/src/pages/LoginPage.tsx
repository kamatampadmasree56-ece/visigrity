import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { VisigrityLogo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password.'); return; }
    setLoading(true);
    try {
      await login(email, password);
      showToast('Login successful. Welcome to VISIGRITY.', 'success');
      navigate('/command-center');
    } catch {
      setError('Invalid credentials. Use demo login or enter any email/password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    try {
      await login('demo@visigrity.com', undefined, true);
      showToast('Demo login successful. Welcome, Demo Validator!', 'success');
      navigate('/command-center');
    } catch {
      setError('Demo login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B1624] border-r border-[#38BDF8]/10 flex-col items-center justify-center p-12">
        <VisigrityLogo size={56} className="mb-8" />
        <h2 className="text-2xl font-bold text-[#F8FAFC] mb-3 text-center">Pipeline Integrity Command Center</h2>
        <p className="text-[#94A3B8] text-center max-w-sm text-sm leading-relaxed">
          Verify integrity across your entire computer vision pipeline.
          Track contributors, detect tampering, and generate audit evidence.
        </p>
        <div className="mt-10 space-y-3 w-full max-w-sm">
          {['Pipeline Integrity Verified', 'Hash Provenance Tracked', 'Contributor Accountability', 'Audit Records Secured'].map(item => (
            <div key={item} className="flex items-center gap-3 text-sm text-[#94A3B8]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden mb-8 flex justify-center">
            <VisigrityLogo size={40} />
          </div>

          <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">Welcome Back</h1>
          <p className="text-sm text-[#94A3B8] mb-8">Sign in to access the security command center.</p>

          {/* Demo credentials box */}
          <div className="mb-6 p-4 rounded-xl bg-[#38BDF8]/5 border border-[#38BDF8]/20">
            <p className="text-xs font-semibold text-[#38BDF8] mb-2 uppercase tracking-wider">Demo Credentials</p>
            <div className="space-y-1 text-xs text-[#94A3B8]">
              <div className="flex justify-between">
                <span>Email:</span>
                <code className="text-[#38BDF8]">demo@visigrity.com</code>
              </div>
              <div className="flex justify-between">
                <span>Password:</span>
                <code className="text-[#38BDF8]">demo1234</code>
              </div>
              <div className="flex justify-between">
                <span>Role:</span>
                <span className="text-[#F8FAFC]">Validator (Demo)</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-sm text-[#EF4444]">
              <AlertCircle size={16} className="flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="login-email" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full bg-[#050B14] border border-[#38BDF8]/20 hover:border-[#38BDF8]/40 rounded-lg pl-10 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors"
                />
              </div>
            </div>
            <div>
              <label htmlFor="login-password" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#050B14] border border-[#38BDF8]/20 hover:border-[#38BDF8]/40 rounded-lg pl-10 pr-10 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-[#38BDF8] hover:text-[#60A5FA] transition-colors">
                Forgot password?
              </Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="my-4 flex items-center gap-3">
            <div className="flex-1 h-px bg-[#38BDF8]/10" />
            <span className="text-xs text-[#94A3B8]">or</span>
            <div className="flex-1 h-px bg-[#38BDF8]/10" />
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full py-2.5 border border-[#38BDF8]/40 hover:border-[#38BDF8] text-[#38BDF8] font-semibold rounded-xl transition-colors disabled:opacity-50"
          >
            Demo Login (Validator)
          </button>

          <p className="text-center text-sm text-[#94A3B8] mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#38BDF8] hover:text-[#60A5FA] font-medium transition-colors">
              Create Account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};
