import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { Header } from '../components/layout/Header';
import { motion } from 'framer-motion';

const pageTitles: Record<string, string> = {
  '/command-center': 'Command Center',
  '/data-registry': 'Data Registry',
  '/model-registry': 'Model Registry',
  '/inference-lab': 'Inference Lab',
  '/integrity-verify': 'Integrity Verification',
  '/blockchain-audit': 'Blockchain Audit',
  '/contributors': 'Contributors',
  '/version-control': 'Version Control',
  '/attack-lab': 'Attack Lab',
  '/evidence-reports': 'Evidence & Audit Reports',
  '/settings': 'Settings',
};

export const AppLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const title = pageTitles[pathname] || 'VISIGRITY';

  return (
    <div className="flex h-screen overflow-hidden bg-[#050B14]">
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          onMenuClick={() => setMobileMenuOpen(true)}
          title={title}
        />
        <main className="flex-1 overflow-y-auto">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className="p-4 md:p-6 min-h-full"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};
