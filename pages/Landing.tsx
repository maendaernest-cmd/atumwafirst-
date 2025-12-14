import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Briefcase, ShoppingBag, ShieldCheck, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <div className="inline-block p-4 rounded-2xl bg-brand-600 text-white mb-6 shadow-xl shadow-brand-200">
             <Briefcase size={48} />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Welcome to <span className="text-brand-600">Atumwa</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            The local marketplace for errands, deliveries, and professional tasks. 
            Connect with trusted messengers or start earning today.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Client Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-brand-300 transition-all duration-300 group cursor-pointer" onClick={() => login('client')}>
            <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-6 group-hover:scale-110 transition-transform">
              <ShoppingBag size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">I need help</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Post errands like prescription pickups, shopping, or paperwork delivery.
            </p>
            <button className="flex items-center text-brand-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
              Login as Client <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          {/* Atumwa Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-brand-300 transition-all duration-300 group cursor-pointer" onClick={() => login('atumwa')}>
            <div className="w-14 h-14 bg-brand-50 rounded-xl flex items-center justify-center text-brand-600 mb-6 group-hover:scale-110 transition-transform">
              <Briefcase size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">I want to earn</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Browse available gigs, submit bids, and get paid for completing tasks.
            </p>
            <button className="flex items-center text-brand-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
              Login as Messenger <ArrowRight size={16} className="ml-1" />
            </button>
          </div>

          {/* Admin Card */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 hover:shadow-xl hover:border-brand-300 transition-all duration-300 group cursor-pointer" onClick={() => login('admin')}>
            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center text-slate-600 mb-6 group-hover:scale-110 transition-transform">
              <ShieldCheck size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Admin</h3>
            <p className="text-slate-500 mb-6 text-sm">
              Manage users, disputes, and oversee platform activity.
            </p>
            <button className="flex items-center text-brand-600 font-bold text-sm group-hover:translate-x-1 transition-transform">
              Login as Admin <ArrowRight size={16} className="ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};