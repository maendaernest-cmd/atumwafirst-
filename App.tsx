import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Home } from './pages/Home';
import { Gigs } from './pages/Gigs';
import { MapPage } from './pages/MapPage';
import { Messages } from './pages/Messages';
import { Profile } from './pages/Profile';
import { Landing } from './pages/Landing';
import { AuthProvider, useAuth } from './context/AuthContext';

const AuthenticatedApp = () => {
  const { user } = useAuth();

  if (!user) {
    return <Landing />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Navigation />
      
      <main className="flex-1 max-w-7xl mx-auto w-full md:px-8 py-6 px-4 mb-16 md:mb-0">
        <Routes>
          <Route path="/" element={<Home />} />
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
      <AuthenticatedApp />
    </AuthProvider>
  );
}