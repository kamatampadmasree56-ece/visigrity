import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Home } from 'lucide-react';
import { VisigrityLogo } from '../components/common/Logo';
import { useAuth } from '../context/AuthContext';

export const NotFoundPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <VisigrityLogo size={48} className="justify-center mb-8" />
        <div className="text-8xl font-bold text-[#38BDF8]/20 mb-4">404</div>
        <h1 className="text-2xl font-bold text-[#F8FAFC] mb-2">Page Not Found</h1>
        <p className="text-[#94A3B8] mb-8 max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {isAuthenticated ? (
            <Link to="/command-center"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors">
              <Home size={18} /> Return to Command Center
            </Link>
          ) : (
            <Link to="/"
              className="flex items-center gap-2 px-5 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors">
              <ArrowLeft size={18} /> Return to Home
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
};
