import React, { useState, useEffect, useRef } from 'react';
import { MOCK_GIGS, MOCK_USERS, MOCK_ATUMWA } from '../constants';
import { useAuth } from '../context/AuthContext';
import { Gig, GigType, PaymentMethod } from '../types';
import { MapPin, Clock, Filter, ShoppingBag, FileText, Pill, Package, X, Search, Trash2, CheckCircle, Navigation, AlertCircle, Shield, Flag, Zap, TrendingUp, Map, MessageSquare, DollarSign, Wallet, CheckCircle2, Briefcase, Smartphone, Coins, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';

const MOCK_LOCATIONS = [
  "Greenwood Pharmacy, Fife Ave",
  "Food Lovers Market, Avondale",
  "High Court, Samora Machel Ave",
  "Main Post Office, Inez Terrace",
  "Avenues Clinic, Mazowe St",
  "Eastgate Centre, CBD",
  "Sam Levy's Village, Borrowdale",
  "Joina City, CBD",
  "Parirenyatwa Hospital",
  "Westgate Shopping Mall",
  "Roadport Bus Station",
  "Mbare Musika",
  "University of Zimbabwe, Mt Pleasant",
  "Meikles Hotel, CBD",
  "RGM International Airport"
];

interface GigCardProps {
    gig: Gig;
    isOwner?: boolean;
    isAdmin?: boolean;
    onAction?: (action: 'accept' | 'complete' | 'cancel' | 'track' | 'chat', gigId: string, price?: number) => void;
    onViewMap?: (gigId: string) => void;
    userRole?: string;
}

const GigCard: React.FC<GigCardProps> = ({ gig, isOwner, isAdmin, onAction, onViewMap, userRole }) => {
  const getTypeIcon = (type: GigType) => {
    switch (type) {
      case 'prescription': return <Pill className="text-red-500" />;
      case 'paperwork': return <FileText className="text-stone-500" />;
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

  const getPaymentIcon = (method: PaymentMethod) => {
      switch(method) {
          case 'ecocash': return <Smartphone size={14} className="text-blue-600" />;
          case 'zig': return <Coins size={14} className="text-amber-600" />;
          case 'cash_usd': return <DollarSign size={14} className="text-green-600" />;
      }
  };

  const getPaymentLabel = (method: PaymentMethod) => {
       switch(method) {
          case 'ecocash': return 'EcoCash';
          case 'zig': return 'ZiG';
          case 'cash_usd': return 'Cash USD';
      }
  };

  // Calculate if gig is expiring soon (older than 48h but less than 72h)
  const hoursOld = (Date.now() - new Date(gig.postedAt).getTime()) / (1000 * 60 * 60);
  const hoursLeft = 72 - hoursOld;
  const isExpiringSoon = gig.status === 'open' && hoursLeft > 0 && hoursLeft <= 24;

  // Visual state for card based on status
  const cardStyle = {
      completed: 'border-green-200 bg-green-50/20',
      expired: 'border-slate-100 bg-slate-50 opacity-75',
      urgent: 'border-red-300 bg-red-50/40 shadow-md ring-1 ring-red-200',
      default: 'border-slate-100 bg-white hover:shadow-md'
  };

  const currentStyle = gig.status === 'completed' 
      ? cardStyle.completed 
      : gig.status === 'expired' 
          ? cardStyle.expired 
          : isExpiringSoon
            ? cardStyle.urgent
            : cardStyle.default;

  return (
    <div className={`p-5 rounded-xl shadow-sm border transition-all relative ${currentStyle}`}>
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center border ${
             gig.status === 'completed' ? 'bg-green-100 border-green-200' 
             : gig.status === 'expired' ? 'bg-slate-200 border-slate-300'
             : isExpiringSoon ? 'bg-red-100 border-red-200'
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
                    <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded flex items-center gap-1 border border-red-200 animate-pulse shadow-sm">
                        <Flag size={10} className="fill-red-700" /> Urgent: {Math.ceil(hoursLeft)}h left
                    </span>
                )}
            </div>
            <h3 className={`font-bold text-lg leading-tight mb-1 ${gig.status === 'expired' ? 'text-slate-500' : 'text-slate-800'}`}>{gig.title}</h3>
            <div className="flex items-center text-sm text-slate-500 mb-2">
              <span className="mr-3 flex items-center gap-1"><MapPin size={14} /> {gig.distance}</span>
              <span className="mr-3 font-medium text-slate-700">From: {gig.locationStart}</span>
              <button 
                  onClick={(e) => {
                      e.stopPropagation();
                      onViewMap?.(gig.id);
                  }}
                  className="text-brand-600 hover:text-brand-800 hover:bg-brand-50 p-1.5 rounded-md transition-colors flex items-center gap-1 text-xs font-bold"
                  title="View on Map"
              >
                  <Map size={14} /> <span className="hidden sm:inline">Map</span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Price Tag */}
        <div className="text-right">
           <div className={`text-xl font-bold ${gig.status === 'completed' ? 'text-green-600' : gig.status === 'expired' ? 'text-slate-500' : isExpiringSoon ? 'text-red-600' : 'text-slate-800'}`}>${gig.price.toFixed(2)}</div>
           <div className={`text-xs font-medium flex items-center justify-end gap-1 ${
               gig.paymentMethod === 'ecocash' ? 'text-blue-600' :
               gig.paymentMethod === 'zig' ? 'text-amber-600' : 'text-green-600'
           }`}>
               {getPaymentIcon(gig.paymentMethod)} {getPaymentLabel(gig.paymentMethod)}
           </div>
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
           {gig.postedBy.isVerified && <CheckCircle size={12} className="text-blue-500 fill-blue-50" />}
        </div>

        <div className="flex gap-2">
            {/* Actions for Atumwa */}
            {userRole === 'atumwa' && gig.status === 'open' && (
                <button 
                    onClick={() => onAction?.('accept', gig.id)}
                    className="bg-brand-600 text-white px-5 py-2 rounded-lg font-medium hover:bg-brand-700 transition-colors text-sm shadow-sm"
                >
                    Accept Gig
                </button>
            )}
            
            {userRole === 'atumwa' && gig.status === 'in-progress' && (
                <button 
                    onClick={() => onAction?.('complete', gig.id, gig.price)}
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

            {/* Client Actions: Chat & Track for In-Progress and Completed */}
            {isOwner && (gig.status === 'in-progress' || gig.status === 'completed') && (
                 <>
                    {gig.status === 'in-progress' && (
                        <button 
                            onClick={() => onAction?.('track', gig.id)}
                            className="bg-slate-900 text-white px-5 py-2 rounded-lg font-medium hover:bg-slate-800 transition-all text-sm flex items-center gap-2 shadow-md shadow-slate-200"
                        >
                            <Navigation size={16} /> Track
                        </button>
                    )}
                    <button
                        onClick={() => onAction?.('chat', gig.id)}
                        className="bg-brand-50 text-brand-600 px-5 py-2 rounded-lg font-medium hover:bg-brand-100 transition-colors text-sm flex items-center gap-2"
                    >
                        <MessageSquare size={16} /> Chat
                    </button>
                 </>
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
    locationEnd: '',
    paymentMethod: 'cash_usd' as PaymentMethod
  });
  const [urgency, setUrgency] = useState<'standard' | 'express' | 'priority'>('standard');

  // Dynamic Pricing Logic
  useEffect(() => {
    let basePrice = 15;
    if (formData.type === 'shopping') basePrice = 25;
    if (formData.type === 'paperwork') basePrice = 20;
    if (formData.type === 'parcel') basePrice = 18;
    if (formData.type === 'prescription') basePrice = 15;

    let multiplier = 1;
    if (urgency === 'express') multiplier = 1.3;
    if (urgency === 'priority') multiplier = 1.8;

    // Small random variance to simulate live market demand
    const demandVariance = 1 + (Math.random() * 0.1 - 0.05);
    
    const suggestedPrice = (basePrice * multiplier * demandVariance).toFixed(2);
    setFormData(prev => ({ ...prev, price: suggestedPrice }));
  }, [formData.type, urgency]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      price: parseFloat(formData.price) || 0
    });
    setFormData({ title: '', description: '', type: 'shopping', price: '', locationStart: '', locationEnd: '', paymentMethod: 'cash_usd' }); 
    setUrgency('standard');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50 shrink-0">
          <h2 className="font-bold text-lg text-slate-800">Post a New Request</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white p-1 rounded-full border border-slate-200 hover:bg-slate-100 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <div className="overflow-y-auto p-4 sm:p-6 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                <label className="block text-sm font-semibold text-slate-700 mb-2">Description & Title</label>
                <input 
                required
                type="text" 
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent placeholder-slate-400 mb-2"
                placeholder="Title (e.g., Pickup prescription)"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                />
                <textarea 
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent min-h-[80px] placeholder-slate-400"
                placeholder="Describe the task details, items to buy, or specific instructions..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                />
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-100">
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

            {/* Dynamic Pricing Section */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex justify-between items-center mb-3">
                    <label className="block text-sm font-semibold text-slate-700">Urgency Level</label>
                    {urgency !== 'standard' && (
                        <span className="text-xs font-bold text-brand-600 flex items-center gap-1 bg-brand-100 px-2 py-0.5 rounded-full">
                            <TrendingUp size={12} /> High Demand
                        </span>
                    )}
                </div>
                
                <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm mb-4">
                    <button
                        type="button"
                        onClick={() => setUrgency('standard')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${urgency === 'standard' ? 'bg-slate-100 text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Standard
                    </button>
                    <button
                        type="button"
                        onClick={() => setUrgency('express')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${urgency === 'express' ? 'bg-amber-100 text-amber-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        Express
                    </button>
                    <button
                        type="button"
                        onClick={() => setUrgency('priority')}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1 ${urgency === 'priority' ? 'bg-red-100 text-red-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Zap size={12} className={urgency === 'priority' ? 'fill-red-800' : ''} /> Priority
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Payment Method</label>
                    <div className="grid grid-cols-3 gap-2">
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: 'cash_usd'})}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${formData.paymentMethod === 'cash_usd' ? 'bg-green-50 border-green-500 text-green-700 ring-1 ring-green-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <DollarSign size={16} /> Cash (USD)
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: 'ecocash'})}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${formData.paymentMethod === 'ecocash' ? 'bg-blue-50 border-blue-500 text-blue-700 ring-1 ring-blue-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Smartphone size={16} /> EcoCash
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData({...formData, paymentMethod: 'zig'})}
                            className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all flex flex-col items-center gap-1 ${formData.paymentMethod === 'zig' ? 'bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-500' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                        >
                            <Coins size={16} /> ZiG
                        </button>
                    </div>
                </div>

                <label className="block text-xs font-semibold text-slate-500 mb-1">Suggested Price (Dynamic)</label>
                <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500">$</span>
                    <input 
                        required
                        type="number" 
                        min="0"
                        step="0.01"
                        className="w-full bg-white border border-slate-300 rounded-lg pl-7 pr-4 py-2.5 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        value={formData.price}
                        onChange={e => setFormData({...formData, price: e.target.value})}
                    />
                </div>
            </div>

            <button 
                type="submit"
                className={`w-full text-white py-3.5 rounded-lg font-bold text-sm transition-all shadow-lg mt-2 sticky bottom-0 z-10 ${
                    urgency === 'priority' ? 'bg-red-600 hover:bg-red-700 shadow-red-200' :
                    urgency === 'express' ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-200' :
                    'bg-brand-600 hover:bg-brand-700 shadow-brand-200'
                }`}
            >
                {urgency === 'priority' ? 'Post Priority Request' : 'Post Request'}
            </button>
            </form>
        </div>
      </div>
    </div>
  );
};

const CompleteGigModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (price: number) => void;
  gig: Gig | null;
}> = ({ isOpen, onClose, onConfirm, gig }) => {
  const [confirmPrice, setConfirmPrice] = useState('');

  useEffect(() => {
    if (gig) setConfirmPrice(gig.price.toFixed(2));
  }, [gig]);

  if (!isOpen || !gig) return null;

  const getPaymentInstruction = () => {
      if (gig?.paymentMethod === 'cash_usd') return "Verify you have collected the full cash amount from the client.";
      if (gig?.paymentMethod === 'ecocash') return "Verify you have received the EcoCash transfer on your phone.";
      if (gig?.paymentMethod === 'zig') return "Verify you have received the ZiG transfer to your wallet.";
      return "Verify the final agreed amount to release funds.";
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-sm p-6 relative">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 mx-auto">
            <CheckCircle size={28} />
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-2 text-center">Complete Job?</h2>
        <div className="text-center mb-6">
            <p className="text-sm text-slate-500 mb-2">
                Confirming completion for <strong>{gig.title}</strong>.
            </p>
            <div className={`text-xs font-semibold px-3 py-2 rounded-lg inline-block border ${
                gig.paymentMethod === 'cash_usd' ? 'bg-green-50 text-green-700 border-green-200' :
                gig.paymentMethod === 'ecocash' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                'bg-amber-50 text-amber-700 border-amber-200'
            }`}>
                {getPaymentInstruction()}
            </div>
        </div>
        
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Final Payment Amount</label>
          <div className="relative">
             <DollarSign className="absolute left-3 top-2.5 text-slate-400" size={18} />
             <input 
                type="number" 
                step="0.01"
                className="w-full bg-slate-50 border border-slate-300 rounded-lg pl-9 pr-4 py-2 text-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
                value={confirmPrice}
                onChange={(e) => setConfirmPrice(e.target.value)}
             />
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-50 rounded-lg transition-colors border border-slate-200"
          >
            Cancel
          </button>
          <button 
            onClick={() => onConfirm(parseFloat(confirmPrice) || 0)}
            className="flex-1 py-2.5 bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition-colors shadow-lg shadow-green-100 flex items-center justify-center gap-2"
          >
            Confirm Payment
          </button>
        </div>
      </div>
    </div>
  );
};

// --- NEW COMPONENT FOR STATS ---
const StatsCard = ({ title, value, icon: Icon, color, subtext }: any) => (
    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start justify-between">
      <div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
      </div>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={20} />
      </div>
    </div>
);

const DashboardStats = ({ user, gigs }: { user: any, gigs: Gig[] }) => {
    if (user.role === 'client') {
      const active = gigs.filter((g) => g.postedBy.id === user.id && g.status === 'open').length;
      const inProgress = gigs.filter((g) => g.postedBy.id === user.id && g.status === 'in-progress').length;
      const completed = gigs.filter((g) => g.postedBy.id === user.id && g.status === 'completed').length;
  
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard title="Active Requests" value={active} icon={AlertCircle} color="bg-brand-100 text-brand-600" subtext="Waiting for runner" />
          <StatsCard title="In Progress" value={inProgress} icon={Clock} color="bg-amber-100 text-amber-600" subtext="Track real-time" />
          <StatsCard title="Completed" value={completed} icon={CheckCircle2} color="bg-green-100 text-green-600" subtext="All time" />
        </div>
      );
    }
  
    if (user.role === 'atumwa') {
      const available = gigs.filter((g) => g.status === 'open' && g.postedBy.id !== user.id).length;
      const myActive = gigs.filter((g) => g.assignedTo === user.id && g.status === 'in-progress').length;
      // Mock earnings calculation
      const earnings = gigs.filter((g) => g.assignedTo === user.id && g.status === 'completed').reduce((acc, curr) => acc + curr.price, 0);
  
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatsCard title="Available Nearby" value={available} icon={MapPin} color="bg-brand-100 text-brand-600" subtext="Within 10km" />
          <StatsCard title="Active Jobs" value={myActive} icon={Briefcase} color="bg-blue-100 text-blue-600" subtext="In progress" />
          <StatsCard title="Total Earnings" value={`$${earnings.toFixed(2)}`} icon={Wallet} color="bg-green-100 text-green-600" subtext="Lifetime" />
        </div>
      );
    }
  
    return null;
};

export const Gigs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [filter, setFilter] = useState<GigType | 'all'>('all');
  // Admin Status Filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'in-progress' | 'completed' | 'expired'>('all');
  // Atumwa View Mode: 'browse' (available gigs) or 'my_jobs' (assigned to me)
  const [viewMode, setViewMode] = useState<'browse' | 'my_jobs'>('browse');
  const [gigs, setGigs] = useState<Gig[]>(MOCK_GIGS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [completingGig, setCompletingGig] = useState<Gig | null>(null);

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
    
    // Run immediately on mount
    checkExpiration();
    
    // Check every minute to handle expiration while viewing the page
    const interval = setInterval(checkExpiration, 60000);
    return () => clearInterval(interval);
  }, []);

  // Simulate High Priority Push Notification for Atumwas
  useEffect(() => {
    if (user?.role !== 'atumwa') return;

    const timeout = setTimeout(() => {
        addToast(
            'Action Alert: Priority Gig',
            'New urgent prescription pickup nearby ($25). Expires in 5m.',
            'alert'
        );
    }, 5000); // 5 seconds after landing on the page

    return () => clearTimeout(timeout);
  }, [user, addToast]);

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

  const handleViewMap = (gigId: string) => {
      navigate('/map', { state: { selectedGigId: gigId } });
  };

  const handleConfirmCompletion = (finalPrice: number) => {
      if (!completingGig) return;
      
      setGigs(prev => prev.map(gig => {
          if (gig.id === completingGig.id) {
              return { ...gig, status: 'completed', price: finalPrice };
          }
          return gig;
      }));

      addToast(
          'Payment Released',
          `Transaction complete. $${finalPrice.toFixed(2)} has been released to your wallet.`,
          'earnings'
      );
      setCompletingGig(null);
  };

  const handleGigAction = (action: 'accept' | 'complete' | 'cancel' | 'track' | 'chat', gigId: string, price?: number) => {
      if (action === 'complete') {
          const gig = gigs.find(g => g.id === gigId);
          if (gig) setCompletingGig(gig);
          return;
      }

      if (action === 'track') {
         navigate('/map', { state: { selectedGigId: gigId } });
         return;
      }

      if (action === 'chat') {
        const gig = gigs.find(g => g.id === gigId);
        if (gig?.assignedTo) {
            // Find name
            const allUsers = [...MOCK_USERS, MOCK_ATUMWA]; 
            const assignee = allUsers.find(u => u.id === gig.assignedTo);

            navigate('/messages', {
                state: {
                    recipientId: gig.assignedTo,
                    recipientName: assignee ? assignee.name : 'Messenger'
                }
            });
        }
        return;
      }

      if (action === 'cancel') {
          setGigs(prev => prev.filter(g => g.id !== gigId));
          return;
      }
      
      if (action === 'accept') {
          setGigs(prev => prev.map(gig => {
              if (gig.id === gigId && gig.status === 'open') {
                  return { ...gig, status: 'in-progress', assignedTo: user.id };
              }
              return gig;
          }));
          setViewMode('my_jobs');
      }
  };

  let displayedGigs = gigs;

  if (user.role === 'client') {
      displayedGigs = gigs.filter(g => g.postedBy.id === user.id);
  } else if (user.role === 'atumwa') {
      if (viewMode === 'browse') {
          displayedGigs = gigs.filter(g => g.postedBy.id !== user.id && g.status === 'open');
      } else {
          displayedGigs = gigs.filter(g => g.assignedTo === user.id);
      }
  } else if (user.role === 'admin') {
      if (statusFilter !== 'all') {
          displayedGigs = gigs.filter(g => g.status === statusFilter);
      }
  }

  const filteredGigs = filter === 'all' 
    ? displayedGigs 
    : displayedGigs.filter(g => g.type === filter);

  // Counts for Atumwa toggle
  const browseCount = gigs.filter(g => g.postedBy.id !== user.id && g.status === 'open').length;
  const myJobsCount = gigs.filter(g => g.assignedTo === user.id).length;

  return (
    <div className="space-y-6 relative">
      <PostGigModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateGig} 
      />

      <CompleteGigModal
        isOpen={!!completingGig}
        onClose={() => setCompletingGig(null)}
        onConfirm={handleConfirmCompletion}
        gig={completingGig}
      />

      {/* DASHBOARD STATS SECTION */}
      <DashboardStats user={user} gigs={gigs} />

      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4">
          <div>
              <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  {user.role === 'client' ? 'My Posted Gigs' 
                    : user.role === 'admin' ? 'Global Gigs Registry' 
                    : 'Gigs Marketplace'}
                  {user.role === 'admin' && <Shield size={20} className="text-brand-600" />}
              </h1>
              <p className="text-slate-500 text-sm">
                  {user.role === 'client' ? 'Manage your active requests and history.' 
                  : user.role === 'admin' ? 'View and manage all platform activity and requests.'
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
                      Browse ({browseCount})
                  </button>
                  <button 
                    onClick={() => setViewMode('my_jobs')}
                    className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${viewMode === 'my_jobs' ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                      My Jobs ({myJobsCount})
                  </button>
              </div>
          )}
      </div>

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
            onViewMap={handleViewMap}
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