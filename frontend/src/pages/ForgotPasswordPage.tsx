import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { VisigrityLogo } from '../components/common/Logo';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate a demo flow
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
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

        {!sent ? (
          <>
            <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2 text-center">Reset Password</h1>
            <p className="text-sm text-[#94A3B8] mb-8 text-center">Enter your email and we'll send you reset instructions.</p>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 text-sm text-[#EF4444]">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="text-sm font-medium text-[#94A3B8] block mb-1.5">Email</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    id="forgot-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#F8FAFC] placeholder-[#94A3B8]/50 focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50 transition-colors"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <div className="mt-4 p-3 rounded-lg bg-[#F59E0B]/5 border border-[#F59E0B]/20">
              <p className="text-xs text-[#F59E0B] text-center">
                Demo Mode: No real emails will be sent. This demonstrates the password reset flow.
              </p>
            </div>
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-[#22C55E]" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-[#F8FAFC] mb-2">Reset Link Sent (Demo)</h2>
            <p className="text-sm text-[#94A3B8] mb-2">
              In a production environment, a reset link would be sent to <strong className="text-[#38BDF8]">{email}</strong>.
            </p>
            <p className="text-xs text-[#94A3B8] mb-8">
              For Phase 1, please use the demo login to access the platform.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-[#38BDF8] hover:text-[#60A5FA] transition-colors"
            >
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </motion.div>
        )}

        {!sent && (
          <div className="mt-6 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#94A3B8] hover:text-[#F8FAFC] transition-colors">
              <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        )}
      </motion.div>
    </div>
  );
};
