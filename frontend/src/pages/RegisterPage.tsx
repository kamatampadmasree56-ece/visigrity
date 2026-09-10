import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { VisigrityLogo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import type { Role } from '../types';

const ROLES: Role[] = ['DATA CONTRIBUTOR', 'MODEL DEVELOPER', 'VALIDATOR', 'INFERENCE OPERATOR', 'ADMIN'];

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<Role>('DATA CONTRIBUTOR');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    if (!name.trim()) return 'Full name is required.';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return 'Valid email is required.';
    if (password.length < 8) return 'Password must be at least 8 characters.';
    if (password !== confirmPassword) return 'Passwords do not match.';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);
    try {
      await register(name, email, password, role);
      showToast('Account created successfully. Welcome to VISIGRITY!', 'success');
      navigate('/command-center');
    } catch {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="flex justify-center mb-8">
          <VisigrityLogo size={40} />
        </div>
        <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2 text-center">Create Account</h1>
        <p className="text-sm text-[#94A3B8] mb-8 text-center">Join the VISIGRITY integrity platform.</p>

        {error && (
          <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-sm text-[#EF4444]">
            <AlertCircle size={16} className="flex-shrink-0" /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label htmlFor="reg-name" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Full Name</label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input id="reg-name" type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors" />
            </div>
          </div>
          {/* Email */}
          <div>
            <label htmlFor="reg-email" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Email</label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input id="reg-email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors" />
            </div>
          </div>
          {/* Role */}
          <div>
            <label htmlFor="reg-role" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Role</label>
            <select id="reg-role" value={role} onChange={e => setRole(e.target.value as Role)}
              className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors">
              {ROLES.map(r => <option key={r} value={r} className="bg-[#0B1624]">{r}</option>)}
            </select>
          </div>
          {/* Password */}
          <div>
            <label htmlFor="reg-password" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input id="reg-password" type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg pl-9 pr-10 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors" />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#F8FAFC]">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          {/* Confirm Password */}
          <div>
            <label htmlFor="reg-confirm" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Confirm Password</label>
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input id="reg-confirm" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Repeat your password"
                className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors disabled:opacity-50 mt-2">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-[#94A3B8] mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-[#38BDF8] hover:text-[#60A5FA] font-medium transition-colors">Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};
