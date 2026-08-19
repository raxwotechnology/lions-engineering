import React, { useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Layout/Navbar';
import { Sidebar } from './components/Layout/Sidebar';
import { Footer } from './components/Layout/Footer';
import { AppRoutes } from './routes/AppRoutes';
import { ErrorBoundary } from './components/Common/ErrorBoundary';

const AppLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) {
    return <AppRoutes />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col lg:pl-64 min-w-0">
        <Navbar toggleMobileSidebar={() => setMobileOpen(!mobileOpen)} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          <AppRoutes />
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <AppLayout />
            </ErrorBoundary>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
