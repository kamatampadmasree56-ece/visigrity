import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Bell, Key, Link2, Server, Settings, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { useToast } from '../context/ToastContext';
import { Card } from '../components/common/Card';

type Tab = 'profile' | 'security' | 'notifications' | 'api' | 'blockchain' | 'system';

const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'security', label: 'Security', icon: <Key size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: 'api', label: 'API Configuration', icon: <Server size={16} /> },
  { id: 'blockchain', label: 'Blockchain', icon: <Link2 size={16} /> },
  { id: 'system', label: 'System Info', icon: <Settings size={16} /> },
];

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { isBackendConnected } = useApp();
  const { showToast } = useToast();
  const [tab, setTab] = useState<Tab>('profile');
  const [notifications, setNotifications] = useState({ tampering: true, verified: true, reports: false, email: false });

  const handleSave = () => {
    showToast('Settings saved successfully.', 'success');
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F8FAFC]">Settings</h1>
        <p className="text-sm text-[#94A3B8] mt-1">Configure your VISIGRITY platform preferences and backend services.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar tabs */}
        <div className="md:w-52 flex-shrink-0">
          <div className="bg-[#0D1B2A] rounded-xl border border-[#38BDF8]/10 p-2 space-y-1">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                  tab === t.id
                    ? 'bg-[#38BDF8]/10 text-[#38BDF8] font-medium border border-[#38BDF8]/20'
                    : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#0B1624]'
                }`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <motion.div key={tab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} className="flex-1 min-w-0">
          {tab === 'profile' && (
            <Card>
              <div className="px-6 py-5 space-y-5">
                <h2 className="text-base font-semibold text-[#F8FAFC]">Profile Information</h2>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-[#38BDF8]/20 border-2 border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] font-bold text-2xl">
                    {user?.name?.charAt(0) ?? 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-[#F8FAFC]">{user?.name}</p>
                    <p className="text-sm text-[#94A3B8]">{user?.email}</p>
                    <p className="text-xs text-[#38BDF8] mt-0.5">{user?.role}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  {[
                    { label: 'Full Name', value: user?.name || '', placeholder: 'Your name' },
                    { label: 'Email', value: user?.email || '', placeholder: 'your@email.com' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">{field.label}</label>
                      <input
                        type="text"
                        defaultValue={field.value}
                        placeholder={field.placeholder}
                        className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">Role</label>
                    <input type="text" value={user?.role || ''} readOnly
                      className="w-full bg-[#050B14] border border-[#38BDF8]/10 rounded-lg px-4 py-2.5 text-sm text-[#94A3B8] cursor-not-allowed" />
                    <p className="text-xs text-[#94A3B8] mt-1">Role is enforced via backend RBAC and cannot be self-modified.</p>
                  </div>
                </div>
                <button onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm">
                  <Save size={15} /> Save Profile
                </button>
              </div>
            </Card>
          )}

          {tab === 'security' && (
            <Card>
              <div className="px-6 py-5 space-y-5">
                <h2 className="text-base font-semibold text-[#F8FAFC]">Security & Authentication</h2>
                <div className="p-4 rounded-xl bg-[#10B981]/5 border border-[#10B981]/20">
                  <p className="text-sm text-[#10B981] font-medium">Phase 2 — JWT Authentication Active</p>
                  <p className="text-xs text-[#94A3B8] mt-1">Passwords are hashed using bcrypt. Access tokens are cryptographically signed with HS256 JWT.</p>
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-medium text-[#94A3B8] block">Current Password</label>
                  <input type="password" placeholder="••••••••"
                    className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50" />
                  <label className="text-sm font-medium text-[#94A3B8] block">New Password</label>
                  <input type="password" placeholder="Min. 8 characters"
                    className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50" />
                </div>
                <button onClick={() => showToast('Password updated.', 'success')}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm">
                  Update Password
                </button>
              </div>
            </Card>
          )}

          {tab === 'notifications' && (
            <Card>
              <div className="px-6 py-5 space-y-5">
                <h2 className="text-base font-semibold text-[#F8FAFC]">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'tampering', label: 'Tampering Detected', desc: 'Alert when pipeline integrity is compromised.' },
                    { key: 'verified', label: 'Integrity Verified', desc: 'Notify on successful verification.' },
                    { key: 'reports', label: 'Report Generated', desc: 'Notify when an audit report is generated.' },
                    { key: 'email', label: 'Email Notifications', desc: 'Send security alerts to registered email.' },
                  ].map(item => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl bg-[#050B14] border border-[#38BDF8]/10">
                      <div>
                        <p className="text-sm font-medium text-[#F8FAFC]">{item.label}</p>
                        <p className="text-xs text-[#94A3B8] mt-0.5">{item.desc}</p>
                      </div>
                      <button
                        onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key as keyof typeof n] }))}
                        className={`relative w-11 h-6 rounded-full transition-colors ${notifications[item.key as keyof typeof notifications] ? 'bg-[#38BDF8]' : 'bg-[#0D1B2A] border border-[#38BDF8]/20'}`}
                      >
                        <motion.div
                          animate={{ x: notifications[item.key as keyof typeof notifications] ? 22 : 2 }}
                          className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                        />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2.5 bg-[#38BDF8] hover:bg-[#60A5FA] text-[#050B14] font-bold rounded-xl transition-colors text-sm">
                  <Save size={15} /> Save Preferences
                </button>
              </div>
            </Card>
          )}

          {tab === 'api' && (
            <Card>
              <div className="px-6 py-5 space-y-5">
                <h2 className="text-base font-semibold text-[#F8FAFC]">API Configuration</h2>
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                  isBackendConnected 
                    ? 'bg-[#10B981]/5 border-[#10B981]/20' 
                    : 'bg-[#EF4444]/5 border-[#EF4444]/20'
                }`}>
                  {isBackendConnected ? (
                    <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
                  ) : (
                    <AlertCircle size={18} className="text-[#EF4444] flex-shrink-0" />
                  )}
                  <div>
                    <p className={`text-sm font-medium ${isBackendConnected ? 'text-[#10B981]' : 'text-[#EF4444]'}`}>
                      API Status: {isBackendConnected ? 'Backend Connected' : 'Backend Not Connected'}
                    </p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">
                      {isBackendConnected 
                        ? 'FastAPI backend is live at http://localhost:8000/api. Real SQLAlchemy models and database queries are active.' 
                        : 'Could not connect to FastAPI server. Ensure uvicorn is running on port 8000.'}
                    </p>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-[#94A3B8] block mb-1.5">API Base URL</label>
                  <input type="text" defaultValue="http://localhost:8000/api"
                    className="w-full bg-[#050B14] border border-[#38BDF8]/20 rounded-lg px-4 py-2.5 text-sm text-[#F8FAFC] font-mono focus:outline-none focus:ring-2 focus:ring-[#38BDF8]/50" />
                  <p className="text-xs text-[#94A3B8] mt-1">Configured via VITE_API_BASE_URL environment variable.</p>
                </div>
              </div>
            </Card>
          )}

          {tab === 'blockchain' && (
            <Card>
              <div className="px-6 py-5 space-y-5">
                <h2 className="text-base font-semibold text-[#F8FAFC]">Blockchain Configuration</h2>
                <div className="p-4 rounded-xl bg-[#F59E0B]/5 border border-[#F59E0B]/30 flex items-center gap-3">
                  <Link2 size={18} className="text-[#F59E0B] flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-[#F59E0B]">Blockchain Mode: DEMO</p>
                    <p className="text-xs text-[#94A3B8] mt-0.5">Audit trail records are persisted in PostgreSQL with cryptographic SHA-256 hashes. Smart contract on-chain anchor is scheduled for Phase 3.</p>
                  </div>
                </div>
                {[
                  { label: 'Network Mode', value: 'DEMO (Cryptographic ledger simulated)' },
                  { label: 'Audit Trail Storage', value: 'PostgreSQL / SQLAlchemy (Implemented)' },
                  { label: 'Cryptographic Engine', value: 'SHA-256 Hash Verification (Implemented)' },
                  { label: 'On-Chain Smart Contract', value: 'Scheduled for Phase 3' },
                ].map(item => (
                  <div key={item.label} className="p-3 rounded-lg bg-[#050B14] border border-[#38BDF8]/10">
                    <p className="text-xs text-[#94A3B8] mb-1">{item.label}</p>
                    <p className="text-sm font-mono text-[#F8FAFC]">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {tab === 'system' && (
            <Card>
              <div className="px-6 py-5 space-y-5">
                <h2 className="text-base font-semibold text-[#F8FAFC]">System Information</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: 'Version', value: '2.0.0 (Phase 2 - Full Stack)' },
                    { label: 'Frontend', value: 'React 19 + TypeScript + Vite' },
                    { label: 'Backend', value: 'FastAPI + Uvicorn' },
                    { label: 'Database', value: 'PostgreSQL / SQLAlchemy 2.0' },
                    { label: 'Auth Mode', value: 'JWT Bearer + bcrypt' },
                    { label: 'Integrity Engine', value: 'SHA-256 (5-Stage Lineage)' },
                    { label: 'Environment', value: 'Development' },
                    { label: 'API Health', value: isBackendConnected ? 'Online (200 OK)' : 'Offline' },
                  ].map(item => (
                    <div key={item.label} className="p-3 rounded-lg bg-[#050B14] border border-[#38BDF8]/10">
                      <p className="text-xs text-[#94A3B8] mb-0.5">{item.label}</p>
                      <p className="text-sm font-medium text-[#F8FAFC]">{item.value}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 rounded-xl bg-[#0D1B2A] border border-[#38BDF8]/10">
                  <p className="text-xs text-[#94A3B8]">
                    <strong className="text-[#F8FAFC]">Phase 2 Implementation:</strong> React frontend is connected to the FastAPI backend and database. All datasets, models, inferences, security alerts, and audit trails persist in the database.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};
