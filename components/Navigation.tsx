import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Briefcase, Map, MessageSquare, User, LogOut, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NavItem = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex flex-col md:flex-row items-center justify-center md:justify-start md:px-6 md:py-3 py-2 px-1 rounded-lg transition-colors ${
        isActive
          ? 'text-brand-600 md:bg-brand-50'
          : 'text-slate-500 hover:text-brand-600 hover:bg-slate-50'
      }`
    }
  >
    <Icon className="w-6 h-6 md:mr-3" />
    <span className="text-xs md:text-base font-medium mt-1 md:mt-0">{label}</span>
  </NavLink>
);

export const Navigation: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Desktop Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200 h-screen sticky top-0 left-0 pt-6 shadow-sm z-20">
        <div className="px-6 mb-8 flex items-center">
          <div className="w-8 h-8 bg-brand-600 rounded-md flex items-center justify-center text-white font-bold text-xl mr-2">
            A
          </div>
          <span className="text-2xl font-bold text-slate-800 tracking-tight">Atumwa</span>
        </div>
        
        <div className="flex flex-col space-y-2 px-2">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/gigs" icon={Briefcase} label={user?.role === 'client' ? "My Gigs" : "Gigs"} />
          <NavItem to="/map" icon={Map} label="Map" />
          <NavItem to="/messages" icon={MessageSquare} label="Messages" />
          <NavItem to="/profile" icon={User} label="Profile" />
        </div>

        <div className="mt-auto border-t border-slate-100">
           {user && (
             <div className="p-4">
                <div className="flex items-center gap-3 mb-3 px-2">
                  <div className="relative">
                    <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full" />
                    {user.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                        <CheckCircle size={12} className="text-blue-500 fill-white" />
                      </div>
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-slate-700 truncate flex items-center gap-1">
                      {user.name}
                    </p>
                    <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                  </div>
                </div>
                <button 
                  onClick={logout}
                  className="w-full flex items-center justify-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut size={16} /> Sign Out
                </button>
             </div>
           )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-16 flex items-center justify-around z-50 pb-safe">
        <NavItem to="/" icon={Home} label="Home" />
        <NavItem to="/gigs" icon={Briefcase} label="Gigs" />
        <NavItem to="/map" icon={Map} label="Map" />
        <NavItem to="/messages" icon={MessageSquare} label="Chat" />
        <NavItem to="/profile" icon={User} label="Me" />
      </nav>
    </>
  );
};