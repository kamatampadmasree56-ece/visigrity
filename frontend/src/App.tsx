import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { ToastProvider } from './context/ToastContext';
import { ToastContainer } from './components/common/Toast';
import { ProtectedRoute, PublicRoute } from './routes/ProtectedRoute';
import { AppLayout } from './layouts/AppLayout';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { DataRegistryPage } from './pages/DataRegistryPage';
import { ModelRegistryPage } from './pages/ModelRegistryPage';
import { InferenceLabPage } from './pages/InferenceLabPage';
import { IntegrityVerifyPage } from './pages/IntegrityVerifyPage';
import { BlockchainAuditPage } from './pages/BlockchainAuditPage';
import { ContributorsPage } from './pages/ContributorsPage';
import { VersionControlPage } from './pages/VersionControlPage';
import { AttackLabPage } from './pages/AttackLabPage';
import { EvidenceReportsPage } from './pages/EvidenceReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<LandingPage />} />

              {/* Auth routes — redirect to dashboard if logged in */}
              <Route element={<PublicRoute />}>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              </Route>

              {/* Protected routes — require authentication */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/command-center" element={<CommandCenterPage />} />
                  <Route path="/data-registry" element={<DataRegistryPage />} />
                  <Route path="/model-registry" element={<ModelRegistryPage />} />
                  <Route path="/inference-lab" element={<InferenceLabPage />} />
                  <Route path="/integrity-verify" element={<IntegrityVerifyPage />} />
                  <Route path="/blockchain-audit" element={<BlockchainAuditPage />} />
                  <Route path="/contributors" element={<ContributorsPage />} />
                  <Route path="/version-control" element={<VersionControlPage />} />
                  <Route path="/attack-lab" element={<AttackLabPage />} />
                  <Route path="/evidence-reports" element={<EvidenceReportsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                </Route>
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            <ToastContainer />
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
