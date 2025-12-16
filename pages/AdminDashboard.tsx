import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { MOCK_GIGS } from '../constants';
import { 
  BarChart3, 
  Users, 
  AlertTriangle, 
  Megaphone, 
  CheckCircle2, 
  TrendingUp, 
  Activity, 
  ShieldAlert, 
  Briefcase,
  Trash2,
  Filter,
  Info,
  Smartphone,
  Coins,
  DollarSign,
  XCircle,
  Send,
  Search,
  RefreshCcw,
  ThumbsDown,
  Ban,
  Clock,
  Loader2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend
} from 'recharts';

// --- Mock Data for Analytics ---
const INITIAL_ACTIVITY_DATA = [
  { name: 'Mon', gigs: 45, disputes: 2, users: 12 },
  { name: 'Tue', gigs: 52, disputes: 1, users: 15 },
  { name: 'Wed', gigs: 48, disputes: 0, users: 18 },
  { name: 'Thu', gigs: 61, disputes: 3, users: 22 },
  { name: 'Fri', gigs: 75, disputes: 1, users: 25 },
  { name: 'Sat', gigs: 95, disputes: 4, users: 30 },
  { name: 'Sun', gigs: 88, disputes: 2, users: 18 },
];

const PERFORMANCE_ALERTS = [
  { id: 1, type: 'supply', message: 'Low Messenger supply in Downtown Area', severity: 'high', time: '10 min ago' },
  { id: 2, type: 'fulfillment', message: 'Gig fulfillment rate dropped by 5% this hour', severity: 'medium', time: '35 min ago' },
  { id: 3, type: 'system', message: 'Payment gateway latency spike detected', severity: 'low', time: '2h ago' },
];

// --- Mock Data for Disputes ---
const MOCK_DISPUTES = [
  { 
    id: 'd1', 
    gigTitle: 'Urgent Prescription Pickup', 
    reporter: 'Sarah J. (Client)', 
    accused: 'Alex M. (Atumwa)', 
    reason: 'Item damaged upon arrival', 
    status: 'open',
    severity: 'medium',
    amount: 15.00
  },
  { 
    id: 'd2', 
    gigTitle: 'Grocery Run - Whole Foods', 
    reporter: 'Mike T. (Atumwa)', 
    accused: 'Dr. Smith (Client)', 
    reason: 'Client unavailable at drop-off location', 
    status: 'investigating',
    severity: 'low',
    amount: 22.50
  },
  { 
    id: 'd3', 
    gigTitle: 'Parcel Delivery to Airport', 
    reporter: 'System', 
    accused: 'User_882', 
    reason: 'Suspicious GPS activity detected during transit', 
    status: 'flagged',
    severity: 'high',
    amount: 45.00
  }
];

interface BroadcastMessage {
  id: number;
  title: string;
  content: string;
  audience: 'all' | 'clients' | 'atumwas';
  type: 'update' | 'policy' | 'alert';
  timestamp: string;
}

// Mock Broadcast History Data
const MOCK_BROADCAST_HISTORY: BroadcastMessage[] = [
    {
        id: 101,
        title: "Scheduled Maintenance",
        content: "Platform will undergo maintenance this Sunday at 2 AM EST. Expected downtime: 30 mins.",
        audience: 'all',
        type: 'update',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString() // 2 days ago
    },
    {
        id: 102,
        title: "Updated Safety Guidelines",
        content: "Please review the new contactless delivery protocols in the Help Center.",
        audience: 'atumwas',
        type: 'policy',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() // 5 days ago
    },
    {
        id: 103,
        title: "High Demand: Downtown",
        content: "Surge pricing active in Downtown due to high request volume.",
        audience: 'atumwas',
        type: 'alert',
        timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() // 30 mins ago
    }
];

export const AdminDashboard: React.FC = () => {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState<'analytics' | 'content' | 'moderation' | 'gigs'>('analytics');
  
  // Real-time Analytics State
  const [kpiStats, setKpiStats] = useState({
      users: 2450,
      activeGigs: 142,
      disputes: 8,
      revenue: 12400.00
  });
  const [liveChartData, setLiveChartData] = useState(INITIAL_ACTIVITY_DATA);

  // Content Management State
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [audience, setAudience] = useState<'all' | 'clients' | 'atumwas'>('all');
  const [postType, setPostType] = useState<'update' | 'policy' | 'alert'>('update');
  const [broadcastHistory, setBroadcastHistory] = useState<BroadcastMessage[]>([]);
  
  // Dispute Resolution State
  const [disputes, setDisputes] = useState(MOCK_DISPUTES);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Gig Management State
  const [dashboardGigs, setDashboardGigs] = useState(MOCK_GIGS);
  const [gigStatusFilter, setGigStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'completed' | 'expired'>('all');
  const [gigTypeFilter, setGigTypeFilter] = useState<'all' | 'prescription' | 'paperwork' | 'shopping' | 'parcel'>('all');
  const [deletingGigId, setDeletingGigId] = useState<string | null>(null);

  // Simulate Real-time Data Updates for Analytics
  useEffect(() => {
    if (activeTab !== 'analytics') return;

    const interval = setInterval(() => {
        // Randomize stats slightly to simulate live activity
        setKpiStats(prev => ({
            users: prev.users + (Math.random() > 0.7 ? 1 : 0),
            activeGigs: Math.max(130, Math.min(160, prev.activeGigs + Math.floor(Math.random() * 5) - 2)),
            disputes: prev.disputes, // Disputes usually stable
            revenue: prev.revenue + (Math.random() * 25) // Ticking revenue
        }));

        // Update chart data (simulate ongoing activity for the current day - Sunday)
        setLiveChartData(prev => {
            const newData = [...prev];
            const lastIdx = newData.length - 1;
            const currentDay = { ...newData[lastIdx] };
            
            if (Math.random() > 0.6) currentDay.gigs += 1;
            if (Math.random() > 0.85) currentDay.users += 1;
            
            newData[lastIdx] = currentDay;
            return newData;
        });

    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'content') {
        const stored = localStorage.getItem('atumwa_broadcasts');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setBroadcastHistory(parsed);
                } else {
                    setBroadcastHistory(MOCK_BROADCAST_HISTORY);
                    localStorage.setItem('atumwa_broadcasts', JSON.stringify(MOCK_BROADCAST_HISTORY));
                }
            } catch (e) {
                console.error("Failed to parse broadcasts", e);
                setBroadcastHistory(MOCK_BROADCAST_HISTORY);
            }
        } else {
            setBroadcastHistory(MOCK_BROADCAST_HISTORY);
            localStorage.setItem('atumwa_broadcasts', JSON.stringify(MOCK_BROADCAST_HISTORY));
        }
    }
  }, [activeTab]);

  const handleBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!postTitle || !postContent) return;

    const newBroadcast: BroadcastMessage = {
        id: Date.now(),
        title: postTitle,
        content: postContent,
        audience,
        type: postType,
        timestamp: new Date().toISOString()
    };

    const updatedBroadcasts = [newBroadcast, ...broadcastHistory];
    
    localStorage.setItem('atumwa_broadcasts', JSON.stringify(updatedBroadcasts));
    setBroadcastHistory(updatedBroadcasts);

    addToast(
        'Broadcast Sent',
        `Message "${postTitle}" sent to ${audience === 'all' ? 'All Users' : audience === 'clients' ? 'Clients' : 'Messengers'}.`,
        'success'
    );

    setPostTitle('');
    setPostContent('');
    setAudience('all');
  };

  const handleDeleteBroadcast = (id: number) => {
    const updated = broadcastHistory.filter(b => b.id !== id);
    setBroadcastHistory(updated);
    localStorage.setItem('atumwa_broadcasts', JSON.stringify(updated));
    addToast('Broadcast Deleted', 'Message removed from history.', 'success');
  };

  const handleResolveDispute = (id: string, action: string) => {
      setProcessingId(id);
      
      setTimeout(() => {
          setDisputes(prev => prev.map(d => 
              d.id === id ? { ...d, status: 'resolved' } : d
          ));

          addToast(
              'Dispute Resolved',
              `Dispute #${id} marked as resolved via: ${action}`,
              'success'
          );
          setProcessingId(null);
      }, 1500);
  };

  const handleDeleteGig = (id: string) => {
    if (window.confirm('Are you sure you want to permanently delete this gig? This action cannot be undone.')) {
        setDeletingGigId(id);
        setTimeout(() => {
            setDashboardGigs(prev => prev.filter(g => g.id !== id));
            addToast('Gig Deleted', `Gig #${id} has been permanently deleted from the registry.`, 'success');
            setDeletingGigId(null);
        }, 800);
    }
  };

  const filteredGigs = dashboardGigs.filter(gig => {
      const statusMatch = gigStatusFilter === 'all' || gig.status === gigStatusFilter;
      const typeMatch = gigTypeFilter === 'all' || gig.type === gigTypeFilter;
      return statusMatch && typeMatch;
  });

  return (
    <div className="space-y-6">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
             <ShieldAlert className="text-brand-600" /> Admin Command Center
           </h1>
           <p className="text-slate-500 text-sm">Monitor platform health, manage content, and resolve issues.</p>
        </div>
        <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm overflow-x-auto max-w-full">
           <button 
             onClick={() => setActiveTab('analytics')}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'analytics' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <BarChart3 size={16} /> Analytics
           </button>
           <button 
             onClick={() => setActiveTab('gigs')}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'gigs' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <Briefcase size={16} /> Gigs
           </button>
           <button 
             onClick={() => setActiveTab('moderation')}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'moderation' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <AlertTriangle size={16} /> Disputes
           </button>
           <button 
             onClick={() => setActiveTab('content')}
             className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${activeTab === 'content' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
           >
             <Megaphone size={16} /> Content
           </button>
        </div>
      </div>

      {/* --- ANALYTICS TAB --- */}
      {activeTab === 'analytics' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-500 text-xs font-bold uppercase">Total Users</span>
                    <Users className="text-brand-500 bg-brand-50 p-1.5 rounded-lg" size={28} />
                </div>
                <div className="text-2xl font-bold text-slate-800">{kpiStats.users.toLocaleString()}</div>
                <div className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp size={12} /> +12% this week
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-500 text-xs font-bold uppercase">Active Gigs</span>
                    <Activity className="text-amber-500 bg-amber-50 p-1.5 rounded-lg" size={28} />
                </div>
                <div className="text-2xl font-bold text-slate-800">{kpiStats.activeGigs}</div>
                <div className="text-xs text-slate-500 mt-1">
                    85% fulfillment rate
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-500 text-xs font-bold uppercase">Disputes</span>
                    <AlertTriangle className="text-red-500 bg-red-50 p-1.5 rounded-lg" size={28} />
                </div>
                <div className="text-2xl font-bold text-slate-800">{kpiStats.disputes}</div>
                <div className="text-xs text-red-600 font-medium mt-1">
                    Requires attention
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-2">
                    <span className="text-slate-500 text-xs font-bold uppercase">Revenue</span>
                    <span className="text-green-600 bg-green-50 px-2 py-0.5 rounded text-xs font-bold">$$$</span>
                </div>
                <div className="text-2xl font-bold text-slate-800">${(kpiStats.revenue / 1000).toFixed(1)}k</div>
                <div className="text-xs text-green-600 flex items-center gap-1 mt-1 font-medium">
                    <TrendingUp size={12} /> +5% vs last week
                </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
             {/* Main Chart */}
             <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <h3 className="font-bold text-slate-800 mb-6">Platform Activity</h3>
                 <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={liveChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                            <Tooltip 
                                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                                cursor={{fill: '#f8fafc'}}
                            />
                            <Legend />
                            <Bar dataKey="gigs" name="Gigs Completed" fill="#16a34a" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="users" name="New Users" fill="#10b981" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                 </div>
             </div>

             {/* Performance Alerts */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800">Performance Alerts</h3>
                    <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">Live</span>
                 </div>
                 <div className="space-y-3">
                    {PERFORMANCE_ALERTS.map(alert => (
                        <div key={alert.id} className={`p-3 rounded-lg border flex gap-3 ${
                            alert.severity === 'high' ? 'bg-red-50 border-red-100' :
                            alert.severity === 'medium' ? 'bg-amber-50 border-amber-100' :
                            'bg-slate-50 border-slate-100'
                        }`}>
                            {alert.severity === 'high' ? <AlertTriangle size={18} className="text-red-600 mt-0.5 flex-shrink-0" /> :
                             alert.severity === 'medium' ? <Clock size={18} className="text-amber-600 mt-0.5 flex-shrink-0" /> :
                             <Activity size={18} className="text-slate-500 mt-0.5 flex-shrink-0" />
                            }
                            <div>
                                <p className={`text-sm font-medium ${
                                    alert.severity === 'high' ? 'text-red-800' :
                                    alert.severity === 'medium' ? 'text-amber-800' :
                                    'text-slate-700'
                                }`}>{alert.message}</p>
                                <p className="text-xs text-slate-500 mt-1">{alert.time}</p>
                            </div>
                        </div>
                    ))}
                 </div>
                 <button className="w-full mt-4 text-center text-sm text-brand-600 font-medium hover:underline">
                    View System Logs
                 </button>
             </div>
          </div>
        </div>
      )}

      {/* --- GIGS MANAGEMENT TAB --- */}
      {activeTab === 'gigs' && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
             <div className="p-6 border-b border-slate-100 bg-slate-50">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <Briefcase size={20} className="text-brand-600" /> Gig Management
                    </h2>
                    <div className="text-sm text-slate-500">
                        Total Gigs: <strong>{dashboardGigs.length}</strong>
                    </div>
                 </div>
                 
                 <div className="flex flex-wrap gap-4">
                     {/* Status Filter */}
                     <div className="flex items-center gap-2">
                        <Filter size={16} className="text-slate-400" />
                        <select 
                            value={gigStatusFilter}
                            onChange={(e) => setGigStatusFilter(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="expired">Expired</option>
                        </select>
                     </div>

                     {/* Type Filter */}
                     <div className="flex items-center gap-2">
                        <select 
                            value={gigTypeFilter}
                            onChange={(e) => setGigTypeFilter(e.target.value as any)}
                            className="bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 capitalize"
                        >
                            <option value="all">All Types</option>
                            <option value="prescription">Prescription</option>
                            <option value="paperwork">Paperwork</option>
                            <option value="shopping">Shopping</option>
                            <option value="parcel">Parcel</option>
                        </select>
                     </div>
                 </div>
             </div>

             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                         <tr>
                             <th className="p-4">Title / ID</th>
                             <th className="p-4">Type</th>
                             <th className="p-4">Posted By</th>
                             <th className="p-4">Payment Method</th>
                             <th className="p-4">Status</th>
                             <th className="p-4">Price</th>
                             <th className="p-4 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {filteredGigs.length > 0 ? filteredGigs.map(gig => (
                             <tr key={gig.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-4">
                                     <div className="font-bold text-slate-800">{gig.title}</div>
                                     <div className="text-xs text-slate-500 font-mono">#{gig.id}</div>
                                 </td>
                                 <td className="p-4">
                                     <span className="capitalize bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium border border-slate-200">
                                        {gig.type}
                                     </span>
                                 </td>
                                 <td className="p-4">
                                     <div className="flex items-center gap-2">
                                         <img src={gig.postedBy.avatar} alt="" className="w-6 h-6 rounded-full" />
                                         <span className="text-slate-700">{gig.postedBy.name}</span>
                                     </div>
                                 </td>
                                 <td className="p-4">
                                     <div className="flex items-center gap-2 text-xs font-medium">
                                         {gig.paymentMethod === 'ecocash' && <><Smartphone size={14} className="text-blue-600"/> EcoCash</>}
                                         {gig.paymentMethod === 'zig' && <><Coins size={14} className="text-amber-600"/> ZiG</>}
                                         {gig.paymentMethod === 'cash_usd' && <><DollarSign size={14} className="text-green-600"/> Cash</>}
                                     </div>
                                 </td>
                                 <td className="p-4">
                                     <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                                         gig.status === 'open' ? 'bg-brand-100 text-brand-700' :
                                         gig.status === 'in-progress' ? 'bg-amber-100 text-amber-700' :
                                         gig.status === 'completed' ? 'bg-green-100 text-green-700' :
                                         'bg-slate-100 text-slate-500'
                                     }`}>
                                         {gig.status}
                                     </span>
                                 </td>
                                 <td className="p-4 font-bold text-slate-700">
                                     ${gig.price.toFixed(2)}
                                 </td>
                                 <td className="p-4 text-right">
                                     <button 
                                        disabled={deletingGigId === gig.id}
                                        onClick={() => handleDeleteGig(gig.id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md border border-red-100 hover:border-red-200 transition-all disabled:opacity-50"
                                     >
                                         {deletingGigId === gig.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                         Delete
                                     </button>
                                 </td>
                             </tr>
                         )) : (
                            <tr>
                                <td colSpan={7} className="p-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <XCircle size={32} className="text-slate-300" />
                                        <p>No gigs found matching your filters.</p>
                                        <button 
                                            onClick={() => {setGigStatusFilter('all'); setGigTypeFilter('all');}} 
                                            className="text-brand-600 font-bold hover:underline text-xs"
                                        >
                                            Clear Filters
                                        </button>
                                    </div>
                                </td>
                            </tr>
                         )}
                     </tbody>
                 </table>
             </div>
         </div>
      )}

      {/* --- CONTENT MANAGEMENT TAB --- */}
      {activeTab === 'content' && (
         <div className="grid md:grid-cols-3 gap-6 animate-in fade-in duration-300">
            <div className="md:col-span-2">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 bg-slate-50">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <Megaphone size={20} className="text-brand-600" /> Create Broadcast
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">Send targeted updates to users' feeds and notification centers.</p>
                    </div>
                    <div className="p-6">
                        <form onSubmit={handleBroadcast} className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Audience</label>
                                    <select 
                                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        value={audience}
                                        onChange={(e) => setAudience(e.target.value as any)}
                                    >
                                        <option value="all">Everyone (All Users)</option>
                                        <option value="clients">Clients Only</option>
                                        <option value="atumwas">Messengers (Atumwas) Only</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">Content Type</label>
                                    <select 
                                        className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                        value={postType}
                                        onChange={(e) => setPostType(e.target.value as any)}
                                    >
                                        <option value="update">Platform Update</option>
                                        <option value="policy">Policy Change</option>
                                        <option value="alert">Urgent Alert / Surge</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
                                <input 
                                    type="text" 
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="e.g., Surge Pricing in Effect Downtown"
                                    value={postTitle}
                                    onChange={(e) => setPostTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Message Body</label>
                                <textarea 
                                    className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 min-h-[150px]"
                                    placeholder="Type your announcement here..."
                                    value={postContent}
                                    onChange={(e) => setPostContent(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                <span className="text-xs text-slate-500 flex items-center gap-1">
                                    <CheckCircle2 size={12} /> Will appear in Feed & Notifications
                                </span>
                                <button 
                                    type="submit"
                                    className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-bold text-sm hover:bg-brand-700 transition-all shadow-lg shadow-brand-100 flex items-center gap-2"
                                >
                                    <Send size={16} /> Broadcast Now
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-slate-800">Broadcast History</h3>
                        {broadcastHistory.length > 0 && (
                            <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{broadcastHistory.length} sent</span>
                        )}
                    </div>
                    
                    <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
                        {broadcastHistory.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-lg">
                                <p className="text-slate-400 text-sm">No broadcasts have been sent yet.</p>
                            </div>
                        ) : (
                            broadcastHistory.map((broadcast) => (
                                <div key={broadcast.id} className="p-3 border border-slate-100 rounded-lg bg-slate-50 hover:bg-white hover:shadow-sm transition-all group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                             <h4 className="font-bold text-slate-800 text-sm">{broadcast.title}</h4>
                                             <div className="flex items-center gap-2 mt-1">
                                                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                                    broadcast.type === 'alert' ? 'bg-red-100 text-red-700' :
                                                    broadcast.type === 'policy' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-brand-100 text-brand-700'
                                                }`}>
                                                    {broadcast.type}
                                                </span>
                                                <span className="text-xs text-slate-500">• {new Date(broadcast.timestamp).toLocaleDateString()}</span>
                                             </div>
                                        </div>
                                        <button 
                                            onClick={() => handleDeleteBroadcast(broadcast.id)}
                                            className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                    <div className="text-xs text-slate-600 mb-2">
                                        <span className="font-semibold text-slate-500">To:</span> <span className="capitalize">{broadcast.audience}</span>
                                    </div>
                                    <p className="text-sm text-slate-700 line-clamp-2">{broadcast.content}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
         </div>
      )}

      {/* --- MODERATION TAB --- */}
      {activeTab === 'moderation' && (
         <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
             <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                 <div>
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <AlertTriangle size={20} className="text-red-500" /> Dispute Resolution Center
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">Review flagged gigs and resolve user conflicts.</p>
                 </div>
                 <div className="relative">
                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                    <input type="text" placeholder="Search ID or User..." className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                 </div>
             </div>

             <div className="overflow-x-auto">
                 <table className="w-full text-left text-sm">
                     <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                         <tr>
                             <th className="p-4">Dispute ID / Gig</th>
                             <th className="p-4">Reported By</th>
                             <th className="p-4">Accused</th>
                             <th className="p-4">Reason</th>
                             <th className="p-4">Severity</th>
                             <th className="p-4">Amount</th>
                             <th className="p-4 text-right">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {disputes.map(dispute => (
                             <tr key={dispute.id} className="hover:bg-slate-50 transition-colors">
                                 <td className="p-4">
                                     <div className="font-bold text-slate-800">#{dispute.id}</div>
                                     <div className="text-xs text-slate-500">{dispute.gigTitle}</div>
                                 </td>
                                 <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                            {dispute.reporter.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]" title={dispute.reporter}>{dispute.reporter}</span>
                                    </div>
                                 </td>
                                 <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 flex-shrink-0">
                                            {dispute.accused.charAt(0)}
                                        </div>
                                        <span className="text-sm font-medium text-slate-700 truncate max-w-[120px]" title={dispute.accused}>{dispute.accused}</span>
                                    </div>
                                 </td>
                                 <td className="p-4 max-w-xs text-slate-600">
                                     {dispute.reason}
                                 </td>
                                 <td className="p-4">
                                     <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                                         dispute.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                         dispute.severity === 'high' ? 'bg-red-100 text-red-700' :
                                         dispute.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                                         'bg-brand-100 text-brand-700'
                                     }`}>
                                         {dispute.status === 'resolved' ? <CheckCircle2 size={14} /> : 
                                          dispute.severity === 'high' ? <ShieldAlert size={14} /> :
                                          dispute.severity === 'medium' ? <AlertTriangle size={14} /> :
                                          <Info size={14} />
                                         }
                                         {dispute.status === 'resolved' ? 'Resolved' : dispute.severity}
                                     </div>
                                 </td>
                                 <td className="p-4 font-mono text-slate-700">
                                     ${dispute.amount.toFixed(2)}
                                 </td>
                                 <td className="p-4 text-right">
                                    {dispute.status === 'resolved' ? (
                                        <div className="flex justify-end items-center gap-2 text-green-600 font-medium text-xs">
                                            <CheckCircle2 size={16} /> Resolved
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-end gap-2">
                                            <button 
                                                disabled={processingId === dispute.id}
                                                onClick={() => handleResolveDispute(dispute.id, 'Refund Client')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-green-700 hover:bg-green-50 rounded-md border border-slate-200 hover:border-green-200 transition-all disabled:opacity-50 min-w-[85px] justify-center"
                                                title="Refund Client"
                                            >
                                                {processingId === dispute.id ? <Loader2 size={14} className="animate-spin" /> : <RefreshCcw size={14} />}
                                                Refund
                                            </button>
                                            <button 
                                                disabled={processingId === dispute.id}
                                                onClick={() => handleResolveDispute(dispute.id, 'Warn User')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-amber-700 hover:bg-amber-50 rounded-md border border-slate-200 hover:border-amber-200 transition-all disabled:opacity-50 min-w-[75px] justify-center"
                                                title="Warn User"
                                            >
                                                {processingId === dispute.id ? <Loader2 size={14} className="animate-spin" /> : <ThumbsDown size={14} />}
                                                Warn
                                            </button>
                                            <button 
                                                disabled={processingId === dispute.id}
                                                onClick={() => handleResolveDispute(dispute.id, 'Ban User')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-red-700 hover:bg-red-50 rounded-md border border-slate-200 hover:border-red-200 transition-all disabled:opacity-50 min-w-[70px] justify-center"
                                                title="Ban User"
                                            >
                                                {processingId === dispute.id ? <Loader2 size={14} className="animate-spin" /> : <Ban size={14} />}
                                                Ban
                                            </button>
                                        </div>
                                    )}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             </div>
             <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
                 <button className="text-brand-600 text-sm font-bold hover:underline">View Resolved History</button>
             </div>
         </div>
      )}
    </div>
  );
};