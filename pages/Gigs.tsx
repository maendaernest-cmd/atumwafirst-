import React, { useState, useEffect, useRef } from 'react';
import { MOCK_GIGS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Gig, GigType } from '../types';
import { MapPin, Clock, Filter, ShoppingBag, FileText, Pill, Package, X, Search, Trash2, CheckCircle, Navigation, AlertCircle, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MOCK_LOCATIONS = [
  "CVS Pharmacy, Main St",
  "Whole Foods Market, Downtown",
  "City Courthouse, 5th Ave",
  "Central Post Office, Broad St",
  "Oak Avenue Apartments, Unit 4B",
  "Tech Park, Building B",
  "West End Residential Area",
  "North Side Community Clinic",
  "Grand Central Station",
  "Memorial Hospital, ER Entrance",
  "Starbucks, University Blvd",
  "Target, Suburban Plaza",
  "Library, Civic Center",
  "Greenwood Park Entrance"
];

interface GigCardProps {
    gig: Gig;
    isOwner?: boolean;
    isAdmin?: boolean;
    onAction?: (action: 'accept' | 'complete' | 'cancel' | 'track', gigId: string) => void;
    userRole?: string;
}

const GigCard: React.FC<GigCardProps> = ({ gig, isOwner, isAdmin, onAction, userRole }) => {
  const getTypeIcon = (type: GigType) => {
    switch (type) {
      case 'prescription': return <Pill className="text-red-500" />;
      case 'paperwork': return <FileText className="text-blue-500" />;
      case 'shopping': return <ShoppingBag className="text-green-500" />;
      case 'parcel': return <Package className="text-amber-500" />;
    }
  };

  const getTypeLabel = (type: GigType) => {
    switch(type) {
        case 'prescription': return 'Prescription';
        case 'paperwork': return 'Documents';
        case 'shopping': return 'Shopping';
        case 'parcel': return 'Parcel';
    }
  }

  // Visual state for card based on status
  const cardStyle = {
      completed: 'border-green-200 bg-green-50/20',
      expired: 'border-slate-100 bg-slate-50 opacity-75',
      default: 'border-slate-100 bg-white hover:shadow-md'
  };

  const currentStyle = gig.status === 'completed' 
      ? cardStyle.completed 
      : gig.status === 'expired' 
          ? cardStyle.expired 
          : cardStyle.default;

  // Calculate if gig is expiring soon (older than 48h but less than 72h)
  const hoursOld = (Date.now() - new Date(gig.postedAt).getTime()) / (1000 * 60 * 60);
  const hoursLeft = 72 - hoursOld;
  const isExpiringSoon = gig.status === 'open' && hoursLeft > 0 && hoursLeft <= 24;

  return (
    <div className={`p-5 rounded-xl shadow-sm border transition-shadow relative ${currentStyle}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
             gig.status === 'completed' ? 'bg-green-100 border-green-200' 
             : gig.status === 'expired' ? 'bg-slate-200 border-slate-300'
             : 'bg-slate-50 border-slate-100'
          }`}>
             {gig.status === 'completed' ? <CheckCircle className="text-green-600" /> 
              : gig.status === 'expired' ? <Clock className="text-slate-500" />
              : getTypeIcon(gig.type)}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase tracking-wide">
                    {getTypeLabel(gig.type)}
                </span>
                <span className="text-xs text-slate-400">• {new Date(gig.postedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                {gig.status === 'in-progress' && <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 rounded">In Progress</span>}
                {gig.status === 'completed' && <span className="text-xs font-bold text-green-600 bg-green-100 px-2 rounded">Completed</span>}
                {gig.status === 'expired' && <span className="text-xs font-bold text-slate-500 bg-slate-200 px-2 rounded">Expired</span>}
                {isExpiringSoon && (
                    <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-0.5 rounded flex items-center gap-1 border border-orange-200">
                        <Clock size={10} /> Expires in {Math.ceil(hoursLeft)}h
                    </span>
                )}
            </div>
            <h3 className={`font-bold text-lg leading-tight mb-1 ${gig.status === 'expired' ? 'text-slate-500' : 'text-slate-800'}`}>{gig.title}</h3>
            <div className="flex items-center text-sm text-slate-500 mb-2">
              <span className="mr-3 flex items-center gap-1"><MapPin size={14} /> {gig.distance}</span>
              <span className="mr-3 font-medium text-slate-700">From: {gig.locationStart}</span>
            </div>
          </div>
        </div>
        
        {/* Price Tag */}
        <div className="text-right">
           <div className={`text-xl font-bold ${gig.status === 'completed' ? 'text-green-600' : gig.status === 'expired' ? 'text-slate-500' : 'text-slate-800'}`}>${gig.price.toFixed(2)}</div>
           <div className="text-xs text-slate-400">Fixed Price</div>
        </div>
      </div>
      
      <p className="text-slate-600 text-sm mt-3 mb-4 line-clamp-2">
        {gig.description}
      </p>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div className="flex items-center gap-2">
           <img src={gig.postedBy.avatar} alt={gig.postedBy.name} className="w-6 h-6 rounded-full" />
           <span className="text-sm font-medium text-slate-700">{gig.postedBy.name}</span>
           <span className="text-xs text-amber-500">★ {gig.postedBy.rating}</span>
        </div>

        <div className="flex gap-2">
            {/* Actions for Atumwa */}
            {userRole === 'atumwa' && gig.status === 'open' && (
                <button 
                    onClick={() => onAction?.('accept', gig.id)}
                    className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors text-sm shadow-sm"
                >
                    Accept Job
                </button>
            )}
            
            {userRole === 'atumwa' && gig.status === 'in-progress' && (
                <button 
                    onClick={() => onAction?.('complete', gig.id)}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors text-sm shadow-sm flex items-center gap-2"
                >
                    <CheckCircle size={16} /> Mark Done
                </button>
            )}

            {/* Actions for Client */}
            {isOwner && gig.status === 'open' && (
                 <button 
                    onClick={() => onAction?.('cancel', gig.id)}
                    className="bg-red-50 text-red-600 px-5 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors text-sm flex items-center gap-2"
                 >
                    <Trash2 size={16} /> Cancel
                 </button>
            )}

             {isOwner && gig.status === 'expired' && (
                 <button 
                    onClick={() => onAction?.('cancel', gig.id)}
                    className="bg-slate-100 text-slate-600 px-5 py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors text-sm flex items-center gap-2"
                 >
                    <Trash2 size={16} /> Remove
                 </button>
            )}

            {isOwner && gig.status === 'in-progress' && (
                 <button 
                    onClick={() => onAction?.('track', gig.id)}
                    className="bg-amber-100 text-amber-700 px-5 py-2 rounded-lg font-medium hover:bg-amber-200 transition-colors text-sm flex items-center gap-2"
                 >
                    <Navigation size={16} /> Track
                 </button>
            )}
            
            {/* Admin Actions */}
            {isAdmin && (
                <button 
                    onClick={() => onAction?.('cancel', gig.id)}
                    className="text-slate-400 hover:text-red-500 p-1.5 rounded hover:bg-red-50 transition-colors"
                    title="Delete Gig"
                >
                    <Trash2 size={18} />
                </button>
            )}
        </div>
      </div>
    </div>
  );
};

interface LocationInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  required?: boolean;
}

const LocationInput: React.FC<LocationInputProps> = ({ label, value, onChange, placeholder, required }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Close dropdown when clicking outside
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    
    if (val.length > 0) {
      const filtered = MOCK_LOCATIONS.filter(loc => 
        loc.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSelect = (loc: string) => {
    onChange(loc);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
       <label className="block text-sm font-semibold text-slate-700 mb-2">{label}</label>
       <div className="relative group">
          <MapPin className="absolute left-3 top-3 text-slate-400 w-4 h-4 transition-colors group-focus-within:text-brand-500" />
          <input 
            required={required}
            type="text" 
            className="w-full bg-white border border-slate-300 rounded-lg pl-10 pr-10 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-slate-400 transition-shadow"
            placeholder={placeholder}
            value={value}
            onChange={handleInput}
            onFocus={() => {
                if(value.length > 0) setShowSuggestions(true);
            }}
            autoComplete="off"
          />
          {value.length > 0 && (
             <button 
                type="button" 
                onClick={handleClear}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 bg-transparent rounded-full p-0.5 hover:bg-slate-100 transition-all"
             >
                <X size={16} />
             </button>
          )}
       </div>
       {showSuggestions && value.length > 0 && (
         <div className="absolute z-20 w-full bg-white mt-1 border border-slate-200 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
           {suggestions.length > 0 ? (
             suggestions.map((loc, idx) => (
               <div 
                 key={idx}
                 className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 flex items-center gap-2 border-b border-slate-50 last:border-0 transition-colors"
                 onClick={() => handleSelect(loc)}
               >
                 <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                 <span className="truncate">{loc}</span>
               </div>
             ))
           ) : (
             <div className="px-4 py-3 text-sm text-slate-500 flex items-center justify-center gap-2 italic">
                 <Search size={14} />
                 <span>No locations found</span>
             </div>
           )}
         </div>
       )}
    </div>
  )
}

interface PostGigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (gigData: Omit<Gig, 'id' | 'postedBy' | 'postedAt' | 'distance' | 'status'>) => void;
}

const PostGigModal: React.FC<PostGigModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'shopping' as GigType,
    price: '',
    locationStart: '',
    locationEnd: ''
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price) || 0
    });
    setFormData({ title: '', description: '', type: 'shopping', price: '', locationStart: '', locationEnd: '' }); // Reset form
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="font-bold text-lg text-slate-800">Post a New Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Title</label>
            <input 
              required
              type="text" 
              className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-slate-400"
              placeholder="e.g., Pickup prescription for Mom"
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
               {(['prescription', 'paperwork', 'shopping', 'parcel'] as GigType[]).map(type => (
                 <button
                   key={type}
                   type="button"
                   onClick={() => setFormData({...formData, type})}
                   className={`flex items-center justify-center text-sm py-2 px-3 rounded-lg border capitalize transition-all ${
                     formData.type === type 
                       ? 'bg-brand-50 border-brand-500 text-brand-700 font-bold ring-1 ring-brand-500' 
                       : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                   }`}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
             <textarea 
               required
               className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[100px] placeholder-slate-400"
               placeholder="Describe the task details, items to buy, or specific instructions..."
               value={formData.description}
               onChange={e => setFormData({...formData, description: e.target.value})}
             />
          </div>

          <div>
               <label className="block text-sm font-semibold text-slate-700 mb-2">Offer Price ($)</label>
               <input 
                 required
                 type="number" 
                 min="0"
                 step="0.01"
                 className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-slate-400"
                 placeholder="25.00"
                 value={formData.price}
                 onChange={e => setFormData({...formData, price: e.target.value})}
               />
               <p className="text-xs text-slate-500 mt-1">Suggested: $15-$30 for simple errands.</p>
          </div>

          <div className="space-y-4 pt-2 border-t border-slate-100">
             <LocationInput 
               label="Pickup Location"
               placeholder="Store name or address"
               value={formData.locationStart}
               onChange={(val) => setFormData({...formData, locationStart: val})}
               required
             />
             <LocationInput 
               label="Drop-off Location"
               placeholder="Delivery address"
               value={formData.locationEnd}
               onChange={(val) => setFormData({...formData, locationEnd: val})}
               required
             />
          </div>

          <button 
            type="submit"
            className="w-full bg-brand-600 text-white py-3.5 rounded-lg font-bold text-sm hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200 mt-4"
          >
            Post Request
          </button>
        </form>
      </div>
    </div>
  );
};

export const Gigs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<GigType | 'all'>('all');
  // Admin Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'completed' | 'expired'>('all');
  // Atumwa View Mode: 'browse' (available gigs) or 'my_jobs' (assigned to me)
  const [viewMode, setViewMode] = useState<'browse' | 'my_jobs'>('browse');
  const [gigs, setGigs] = useState<Gig[]>(MOCK_GIGS);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Check for expired gigs (older than 72 hours) and mark them as expired
    const checkExpiration = () => {
        const now = Date.now();
        const EXPIRATION_TIME = 72 * 60 * 60 * 1000; // 72 hours
        
        setGigs(currentGigs => {
            let hasChanges = false;
            const updatedGigs = currentGigs.map(gig => {
                if (gig.status === 'open') {
                    const postedTime = new Date(gig.postedAt).getTime();
                    if (now - postedTime > EXPIRATION_TIME) {
                        hasChanges = true;
                        return { ...gig, status: 'expired' };
                    }
                }
                return gig;
            });
            
            // Only update state if changes occurred to prevent unnecessary re-renders
            return hasChanges ? updatedGigs : currentGigs;
        });
    };
    
    checkExpiration();
    
    // Check every minute to handle expiration while viewing the page
    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!user) return null;

  const handleCreateGig = (data: Omit<Gig, 'id' | 'postedBy' | 'postedAt' | 'distance' | 'status'>) => {
    const newGig: Gig = {
      id: `g${Date.now()}`,
      ...data,
      status: 'open',
      postedBy: user, 
      postedAt: new Date().toISOString(),
      distance: '0.5 km' 
    };
    setGigs([newGig, ...gigs]);
    setIsModalOpen(false);
  };

  const handleGigAction = (action: 'accept' | 'complete' | 'cancel' | 'track', gigId: string) => {
      setGigs(prev => prev.map(gig => {
          if (gig.id !== gigId) return gig;

          if (action === 'accept') {
              // Only assign if it's currently open
              if (gig.status === 'open') {
                  return { ...gig, status: 'in-progress', assignedTo: user.id };
              }
          }
          if (action === 'complete') {
              if (gig.status === 'in-progress') {
                  return { ...gig, status: 'completed' };
              }
          }
          if (action === 'cancel') {
              // For cancellation, we remove it in the filter step below, but returning gig here for TS
              return gig; 
          }
          if (action === 'track') {
             navigate('/map');
             return gig;
          }

          return gig;
      }));

      // Special handling for deletion (cancel)
      if (action === 'cancel') {
          setGigs(prev => prev.filter(g => g.id !== gigId));
      }
      
      // If we accepted a gig, switch to 'my_jobs' view to show it
      if (action === 'accept') {
          setViewMode('my_jobs');
      }
  };

  // Determine which gigs to show based on Role and View Mode
  let displayedGigs = gigs;

  if (user.role === 'client') {
      // Clients see their own gigs (including expired ones)
      displayedGigs = gigs.filter(g => g.postedBy.id === user.id);
  } else if (user.role === 'atumwa') {
      if (viewMode === 'browse') {
          // Atumwas see open gigs posted by others (automatically excludes expired since status is 'expired' not 'open')
          displayedGigs = gigs.filter(g => g.postedBy.id !== user.id && g.status === 'open');
      } else {
          // Atumwas see gigs assigned to them
          displayedGigs = gigs.filter(g => g.assignedTo === user.id);
      }
  } else if (user.role === 'admin') {
      // Admin View logic
      if (statusFilter !== 'all') {
          displayedGigs = gigs.filter(g => g.status === statusFilter);
      }
  }

  const filteredGigs = filter === 'all' 
    ? displayedGigs 
    : displayedGigs.filter(g => g.type === filter);

  return (
    <div className="space-y-6 relative">
      <PostGigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateGig} 
      />

      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  {user.role === 'client' ? 'My Posted Gigs' : 'Gigs Marketplace'}
                  {user.role === 'admin' && <Shield size={20} className="text-brand-600" />}
              </h1>
              <p className="text-slate-500 text-sm">
                  {user.role === 'client' ? 'Manage your active requests and history.' 
                  : user.role === 'admin' ? 'Manage all platform gigs and requests.'
                  : 'Find tasks nearby and start earning.'}
              </p>
          </div>
          {user.role === 'client' && (
            <button 
                onClick={() => setIsModalOpen(true)}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 shadow-lg shadow-slate-200 flex items-center gap-2"
            >
                <span>+</span> Post a Request
            </button>
          )}
          {user.role === 'atumwa' && (
              <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
                  <button 
                    onClick={() => setViewMode('browse')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'browse' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                      Browse
                  </button>
                  <button 
                    onClick={() => setViewMode('my_jobs')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'my_jobs' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                      My Jobs
                  </button>
              </div>
          )}
      </div>

      {/* Admin Status Filters */}
      {user.role === 'admin' && (
          <div className="bg-slate-100 p-3 rounded-lg flex items-center gap-2 overflow-x-auto mb-2 no-scrollbar border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2 flex-shrink-0">Filter Status:</span>
            {(['all', 'open', 'in-progress', 'completed', 'expired'] as const).map(s => (
                <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`px-3 py-1 text-xs font-medium rounded-md capitalize transition-colors flex-shrink-0 ${
                        statusFilter === s 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                    }`}
                >
                    {s}
                </button>
            ))}
          </div>
      )}

      {/* Category Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button 
            onClick={() => setFilter('all')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
            <Filter size={16} /> All
        </button>
        <button 
            onClick={() => setFilter('prescription')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'prescription' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
            <Pill size={16} /> Prescriptions
        </button>
        <button 
            onClick={() => setFilter('paperwork')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'paperwork' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
            <FileText size={16} /> Paperwork
        </button>
        <button 
            onClick={() => setFilter('shopping')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'shopping' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
            <ShoppingBag size={16} /> Shopping
        </button>
        <button 
            onClick={() => setFilter('parcel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${filter === 'parcel' ? 'bg-brand-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}
        >
            <Package size={16} /> Parcels
        </button>
      </div>

      <div className="grid gap-4">
        {filteredGigs.map(gig => (
          <GigCard 
            key={gig.id} 
            gig={gig} 
            isOwner={user.role === 'client' && gig.postedBy.id === user.id} 
            isAdmin={user.role === 'admin'}
            onAction={handleGigAction}
            userRole={user.role}
          />
        ))}
        {filteredGigs.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-slate-100 border-dashed">
                <p className="text-slate-400">No gigs found in this section.</p>
                {user.role === 'client' && (
                    <button onClick={() => setIsModalOpen(true)} className="mt-4 text-brand-600 font-bold hover:underline">
                        Post your first gig
                    </button>
                )}
                {user.role === 'atumwa' && viewMode === 'my_jobs' && (
                    <button onClick={() => setViewMode('browse')} className="mt-4 text-brand-600 font-bold hover:underline">
                        Browse available gigs
                    </button>
                )}
            </div>
        )}
      </div>
    </div>
  );
};