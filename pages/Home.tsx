import React, { useEffect, useState } from 'react';
import { FEED_UPDATES, MOCK_GIGS, MOCK_ADMIN } from '../constants';
import { useAuth } from '../context/AuthContext';
import { ThumbsUp, MessageCircle, Share2, MapPin, Clock, CheckCircle, Bell, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();
  const [realtimeBroadcasts, setRealtimeBroadcasts] = useState<any[]>([]);

  // Load broadcasts from "Server" (localStorage)
  useEffect(() => {
    const fetchBroadcasts = () => {
        try {
            const stored = JSON.parse(localStorage.getItem('atumwa_broadcasts') || '[]');
            setRealtimeBroadcasts(stored);
        } catch (e) {
            console.error("Error loading broadcasts", e);
        }
    };
    
    fetchBroadcasts();

    // In a real app, this would be a socket.on('broadcast')
    // Here we poll occasionally or could use window storage event if multi-tab
    const interval = setInterval(fetchBroadcasts, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Passive Alert Simulation for Clients (Welcome Guide)
    if (user?.role === 'client') {
        const timer = setTimeout(() => {
            // Only show if not seen recently (mock logic)
            if (Math.random() > 0.7) {
                addToast(
                    'New Article Available',
                    'Read the latest guide: "How to maximize efficiency with Atumwa Express"',
                    'message'
                );
            }
        }, 3000);
        return () => clearTimeout(timer);
    }
  }, [user, addToast]);

  if (!user) return null;

  // Filter Broadcasts relevant to the current user
  const relevantBroadcasts = realtimeBroadcasts.filter(b => 
      b.audience === 'all' || 
      (b.audience === 'clients' && user.role === 'client') ||
      (b.audience === 'atumwas' && user.role === 'atumwa')
  ).map(b => ({
      id: `broadcast-${b.id}`,
      user: MOCK_ADMIN,
      content: `📢 ${b.title}\n\n${b.content}`,
      time: new Date(b.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      isBroadcast: true
  }));

  // Combine Real-time Broadcasts with Static Feed
  const feed = [...relevantBroadcasts, ...FEED_UPDATES];

  // Legacy hardcoded fallback if no broadcasts exist yet
  if (relevantBroadcasts.length === 0 && user.role === 'client' && !feed.some(p => p.user.role === 'admin' && !p.id.toString().startsWith('broadcast'))) {
      feed.unshift({
          id: 99,
          user: MOCK_ADMIN,
          content: '📢 Platform Update: We have improved our tracking system! You can now see real-time ETA updates for all your active gigs. Happy shipping!',
          time: 'Just now'
      });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Welcome / Status Input */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex gap-4 mb-4">
          <img 
            src={user.avatar} 
            alt="User" 
            className="w-12 h-12 rounded-full object-cover border border-slate-200"
          />
          <button className="flex-1 text-left bg-slate-50 hover:bg-slate-100 text-slate-500 px-4 py-3 rounded-full border border-slate-200 transition-colors">
            {user.role === 'client' ? "Post a new errand..." : "Share what you're working on..."}
          </button>
        </div>
        <div className="flex justify-between items-center px-4 pt-2">
            <button className="flex items-center gap-2 text-slate-600 hover:text-brand-600 text-sm font-medium">
                <span className="text-xl">📷</span> Photo
            </button>
            <button className="flex items-center gap-2 text-slate-600 hover:text-brand-600 text-sm font-medium">
                <span className="text-xl">🎥</span> Video
            </button>
            <button className="flex items-center gap-2 text-slate-600 hover:text-brand-600 text-sm font-medium">
                <span className="text-xl">📅</span> Event
            </button>
        </div>
      </div>

      {/* Recommended Gigs Section - Only visible for Atumwa or Admin */}
      {(user.role === 'atumwa' || user.role === 'admin') && (
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-slate-800">Recommended for you</h2>
                <button onClick={() => navigate('/gigs')} className="text-brand-600 text-sm font-medium hover:underline">View all</button>
            </div>
            <div className="space-y-3">
                {MOCK_GIGS.slice(0, 2).map(gig => (
                    <div key={gig.id} className="border border-slate-100 rounded-lg p-3 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => navigate('/gigs')}>
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold text-slate-800">{gig.title}</h3>
                                <div className="flex items-center text-xs text-slate-500 mt-1 gap-3">
                                    <span className="flex items-center gap-1"><MapPin size={12} /> {gig.distance}</span>
                                    <span className="flex items-center gap-1"><Clock size={12} /> {gig.status}</span>
                                </div>
                            </div>
                            <span className="font-bold text-brand-600 bg-brand-50 px-2 py-1 rounded text-sm">${gig.price.toFixed(2)}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}

      {/* Social Feed */}
      <div className="space-y-4">
        {feed.map(post => {
            const isAdminPost = post.user.role === 'admin';
            return (
                <div key={post.id} className={`p-4 rounded-xl shadow-sm border ${isAdminPost ? 'bg-brand-50/30 border-brand-100' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-start gap-3 mb-3">
                    <div className="relative">
                        <img src={post.user.avatar} alt={post.user.name} className="w-10 h-10 rounded-full object-cover" />
                        {isAdminPost && (
                            <div className="absolute -bottom-1 -right-1 bg-brand-600 rounded-full p-0.5 border border-white">
                                <Info size={10} className="text-white" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 flex items-center gap-1">
                        {post.user.name}
                        {post.user.isVerified && <CheckCircle size={14} className="text-blue-500 fill-blue-50" />}
                        {isAdminPost && <span className="bg-slate-800 text-white text-[10px] px-1.5 rounded uppercase font-bold">Admin</span>}
                        </h3>
                        <p className="text-xs text-slate-500">
                        {post.user.role === 'atumwa' ? 'Messenger' : isAdminPost ? 'Platform Update' : 'Client'} • {post.time}
                        </p>
                    </div>
                    </div>
                    
                    <p className="text-slate-700 mb-4 whitespace-pre-line">{post.content}</p>
                    
                    <div className="border-t border-slate-100 pt-3 flex justify-around">
                        <button className="flex items-center gap-2 text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors">
                            <ThumbsUp size={18} /> Like
                        </button>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors">
                            <MessageCircle size={18} /> Comment
                        </button>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-brand-600 text-sm font-medium transition-colors">
                            <Share2 size={18} /> Share
                        </button>
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};