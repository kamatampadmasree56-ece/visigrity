import React from 'react';
import { Menu, Bell, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
  title?: string;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick, title }) => {
  const { securityEvents, pipelineStatus } = useApp();
  const { user } = useAuth();
  const activeAlerts = securityEvents.filter(e => !e.resolved).length;
  const isCompromised = pipelineStatus.overall === 'COMPROMISED';

  return (
    <header className="h-16 bg-[#0B1624] border-b border-[#38BDF8]/10 flex items-center px-4 gap-4 flex-shrink-0">
      <button
        onClick={onMenuClick}
        className="lg:hidden text-[#94A3B8] hover:text-[#F8FAFC] p-2 rounded-lg hover:bg-[#0D1B2A] transition-colors"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex-1">
        {title && <h1 className="text-base font-semibold text-[#F8FAFC]">{title}</h1>}
      </div>

      {/* Pipeline status indicator */}
      <div className={`
        hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border
        ${isCompromised
          ? 'bg-[#EF4444]/10 border-[#EF4444]/30 text-[#EF4444]'
          : 'bg-[#22C55E]/10 border-[#22C55E]/30 text-[#22C55E]'
        }
      `}>
        {isCompromised
          ? <><AlertTriangle size={12} /> Pipeline Compromised</>
          : <><CheckCircle2 size={12} /> Pipeline Trusted</>
        }
      </div>

      {/* Alerts */}
      <div className="relative">
        <button className="text-[#94A3B8] hover:text-[#F8FAFC] p-2 rounded-lg hover:bg-[#0D1B2A] transition-colors relative">
          <Bell size={20} />
          {activeAlerts > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-[#EF4444] rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {activeAlerts > 9 ? '9+' : activeAlerts}
            </span>
          )}
        </button>
      </div>

      {/* User avatar */}
      <div className="w-9 h-9 rounded-full bg-[#38BDF8]/20 border border-[#38BDF8]/30 flex items-center justify-center text-[#38BDF8] font-bold text-sm flex-shrink-0">
        {user?.name?.charAt(0) ?? 'U'}
      </div>
    </header>
  );
};
