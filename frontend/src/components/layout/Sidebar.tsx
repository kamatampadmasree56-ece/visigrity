import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Database, Brain, FlaskConical, ShieldCheck, 
  Link2, Users, GitBranch, Zap, FileText, Settings, X, LogOut, AlertTriangle
} from 'lucide-react';
import { VisigrityLogo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useToast } from '../../context/ToastContext';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Command Center', path: '/command-center', icon: <LayoutDashboard size={18} /> },
  { label: 'Data Registry', path: '/data-registry', icon: <Database size={18} /> },
  { label: 'Model Registry', path: '/model-registry', icon: <Brain size={18} /> },
  { label: 'Inference Lab', path: '/inference-lab', icon: <FlaskConical size={18} /> },
  { label: 'Integrity Verify', path: '/integrity-verify', icon: <ShieldCheck size={18} /> },
  { label: 'Blockchain Audit', path: '/blockchain-audit', icon: <Link2 size={18} /> },
  { label: 'Contributors', path: '/contributors', icon: <Users size={18} /> },
  { label: 'Version Control', path: '/version-control', icon: <GitBranch size={18} /> },
  { label: 'Attack Lab', path: '/attack-lab', icon: <Zap size={18} /> },
  { label: 'Evidence Reports', path: '/evidence-reports', icon: <FileText size={18} /> },
  { label: 'Settings', path: '/settings', icon: <Settings size={18} /> },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const SidebarContent: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { logout, user } = useAuth();
  const { pipelineStatus, securityEvents } = useApp();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const activeAlerts = securityEvents.filter(e => !e.resolved).length;
  const isCompromised = pipelineStatus.overall === 'COMPROMISED';

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'info');
    navigate('/login');
  };

  return (
    <div className="flex flex-col h-full bg-[#0B1624] border-r border-[#38BDF8]/10">
      {/* Logo area */}
      <div className="px-4 py-5 border-b border-[#38BDF8]/10 flex items-center justify-between">
        <VisigrityLogo size={32} />
        {onClose && (
          <button onClick={onClose} className="text-[#94A3B8] hover:text-[#F8FAFC] lg:hidden p-1">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Pipeline status banner */}
      {isCompromised && (
        <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/30 flex items-center gap-2">
          <AlertTriangle size={14} className="text-[#EF4444] flex-shrink-0" />
          <span className="text-xs text-[#EF4444] font-medium">Pipeline Compromised</span>
        </div>
      )}

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto space-y-1">
        {navItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onClose}
            className={({ isActive }) => `
              flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-[#38BDF8]/10 text-[#38BDF8] border border-[#38BDF8]/20'
                : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0D1B2A]'
              }
            `}
          >
            {item.icon}
            <span className="flex-1">{item.label}</span>
            {item.label === 'Attack Lab' && activeAlerts > 0 && (
              <span className="bg-[#EF4444] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {activeAlerts > 9 ? '9+' : activeAlerts}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User area */}
      <div className="px-3 py-4 border-t border-[#38BDF8]/10">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0) ?? 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-[#F8FAFC] truncate">{user?.name}</p>
            <p className="text-xs text-[#94A3B8] truncate">{user?.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[#94A3B8] hover:text-[#EF4444] hover:bg-[#EF4444]/5 transition-all duration-200"
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onMobileClose }) => {
  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden lg:block w-64 flex-shrink-0 h-full">
        <SidebarContent />
      </div>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onMobileClose}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed left-0 top-0 bottom-0 w-72 z-50 lg:hidden"
            >
              <SidebarContent onClose={onMobileClose} />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
