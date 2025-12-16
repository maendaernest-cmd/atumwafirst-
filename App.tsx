import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Gigs } from './pages/Gigs';
import { MapPage } from './pages/MapPage';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Landing } from './pages/Landing';
import { AdminDashboard } from './pages/AdminDashboard';
import { GlobalSocketListener } from './components/GlobalSocketListener';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

const AuthenticatedApp = () => {
  const { user } = useAuth();

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 flex-col md:flex-row">
      {/* Global WebSocket Simulation for Chat and Admin Broadcasts */}
      <GlobalSocketListener />
      
      <Navigation />
      
      {/* 
          Mobile: pt-20 (80px) to clear the fixed h-16 (64px) header + spacing. 
          Desktop: pt-6, md:px-8.
          Removed mb-16 (bottom nav margin).
      */}
      <main className="flex-1 max-w-7xl mx-auto w-full md:px-8 py-6 px-4 pt-20 md:pt-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin" element={user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
          <Route path="/gigs" element={<Gigs />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AuthenticatedApp />
      </ToastProvider>
    </AuthProvider>
  );
}