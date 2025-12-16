import React, { useState, useEffect, useRef } from 'react';
import { MOCK_GIGS, MOCK_USERS } from '../constants';
import { MapPin, Navigation, Wifi, Clock, Car, Users, Bike, Layers, Filter, Activity, AlertTriangle } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

interface Coords {
  x: number; // Represents left %
  y: number; // Represents top %
}

interface FleetMember {
    id: string;
    name: string;
    coords: Coords;
    status: 'idle' | 'busy';
}

export const MapPage: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const location = useLocation();
  const isAdmin = user?.role === 'admin';

  // State for real-time positions
  const [userPos, setUserPos] = useState<Coords>({ x: 50, y: 50 });
  const [gigPos, setGigPos] = useState<Record<string, Coords>>(() => {
    // Initialize gigs layout
    const initial: Record<string, Coords> = {};
    MOCK_GIGS.forEach((gig, index) => {
        initial[gig.id] = {
            y: 20 + (index * 15),
            x: 20 + (index * 20)
        };
    });
    return initial;
  });

  // Admin: Active Fleet State
  const [fleet, setFleet] = useState<FleetMember[]>([
      { id: 'f1', name: 'Alex M.', coords: { x: 30, y: 40 }, status: 'busy' },
      { id: 'f2', name: 'Mike T.', coords: { x: 70, y: 20 }, status: 'busy' },
      { id: 'f3', name: 'Sarah L.', coords: { x: 50, y: 80 }, status: 'idle' },
      { id: 'f4', name: 'John D.', coords: { x: 20, y: 60 }, status: 'idle' },
      { id: 'f5', name: 'Emma W.', coords: { x: 80, y: 70 }, status: 'busy' },
  ]);

  // Admin: Layer Controls State
  const [layers, setLayers] = useState({
      busyFleetOnly: false,
      openGigsOnly: false,
      traffic: false
  });
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);

  const [selectedGigId, setSelectedGigId] = useState<string>(() => {
    return location.state?.selectedGigId || MOCK_GIGS[0].id;
  });

  // Update selected gig if navigation state changes
  useEffect(() => {
    if (location.state?.selectedGigId) {
        setSelectedGigId(location.state.selectedGigId);
    }
  }, [location.state]);

  // Ref to hold the 'server-side' truth for the simulation to prevent drift/closure issues
  const serverState = useRef({
      user: { x: 50, y: 50 },
      gigs: {} as Record<string, Coords>,
      fleet: [
        { id: 'f1', x: 30, y: 40 },
        { id: 'f2', x: 70, y: 20 },
        { id: 'f3', x: 50, y: 80 },
        { id: 'f4', x: 20, y: 60 },
        { id: 'f5', x: 80, y: 70 },
      ]
  });

  // Initialize server state ref for gigs
  useEffect(() => {
    const initialGigs: Record<string, Coords> = {};
    MOCK_GIGS.forEach((gig, index) => {
      initialGigs[gig.id] = {
          y: 20 + (index * 15),
          x: 20 + (index * 20)
      };
    });
    serverState.current.gigs = initialGigs;
  }, []);

  // Simulate WebSocket Connection
  useEffect(() => {
    const intervalId = setInterval(() => {
        // --- Mock WebSocket Message Handler Logic ---
        
        // 1. Simulate User Movement (Random walk for Client/Atumwa view)
        if (!isAdmin) {
            const moveUser = Math.random() > 0.3; 
            if (moveUser) {
                const current = serverState.current.user;
                const newX = Math.max(5, Math.min(95, current.x + (Math.random() - 0.5) * 4));
                const newY = Math.max(5, Math.min(95, current.y + (Math.random() - 0.5) * 4));
                
                serverState.current.user = { x: newX, y: newY };
                setUserPos({ x: newX, y: newY });
            }
        }

        // 2. Simulate Gig Movement (e.g. delivery in progress)
        MOCK_GIGS.forEach(gig => {
            if (Math.random() > 0.7) { 
                const current = serverState.current.gigs[gig.id];
                if (current) {
                    const newX = Math.max(5, Math.min(95, current.x + (Math.random() - 0.5) * 3));
                    const newY = Math.max(5, Math.min(95, current.y + (Math.random() - 0.5) * 3));
                    
                    serverState.current.gigs[gig.id] = { x: newX, y: newY };
                    
                    setGigPos(prev => ({
                        ...prev,
                        [gig.id]: { x: newX, y: newY }
                    }));
                }
            }
        });

        // 3. Simulate Fleet Movement (Admin View)
        if (isAdmin) {
             const newFleet = serverState.current.fleet.map(f => {
                const move = Math.random() > 0.2;
                if (!move) return f;
                
                return {
                    ...f,
                    x: Math.max(5, Math.min(95, f.x + (Math.random() - 0.5) * 5)),
                    y: Math.max(5, Math.min(95, f.y + (Math.random() - 0.5) * 5))
                };
             });
             serverState.current.fleet = newFleet;

             setFleet(prev => prev.map((member, idx) => ({
                 ...member,
                 coords: { x: newFleet[idx].x, y: newFleet[idx].y }
             })));
        }

    }, 2000); 

    return () => clearInterval(intervalId);
  }, [isAdmin]);

  // Simulate Client Lifecycle Events (Accepted -> En Route -> Delivered)
  useEffect(() => {
    if (user?.role !== 'client') return;
    
    // Sequence of notifications for the client demo
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(setTimeout(() => {
        addToast('Gig Accepted', 'Your "Urgent Prescription Pickup" has been accepted by Alex M.', 'success');
    }, 4000));

    timers.push(setTimeout(() => {
        addToast('En Route', 'Alex M. is on the way to the pickup location.', 'message');
    }, 12000));

    return () => timers.forEach(clearTimeout);
  }, [user, addToast]);


  // Determine active target for routing line
  const effectiveTargetId = gigPos[selectedGigId] ? selectedGigId : MOCK_GIGS[0].id;
  const targetPos = gigPos[effectiveTargetId];

  // Derive ETA (Real-time calculation based on positions)
  let eta = null;
  if (targetPos && !isAdmin) {
      const dx = targetPos.x - userPos.x;
      const dy = targetPos.y - userPos.y;
      const distancePercent = Math.sqrt(dx * dx + dy * dy);
      const realDistanceKm = (distancePercent / 100) * 8; 
      const timeMinutes = Math.ceil((realDistanceKm / 30) * 60); // 30km/h avg
      
      eta = {
          time: Math.max(1, timeMinutes),
          distance: realDistanceKm.toFixed(1)
      };
  }

  // Admin Filtering Logic
  const visibleFleet = isAdmin && layers.busyFleetOnly 
    ? fleet.filter(m => m.status === 'busy') 
    : fleet;

  const visibleGigs = layers.openGigsOnly
    ? MOCK_GIGS.filter(g => g.status === 'open')
    : MOCK_GIGS;

  // Height calc: Mobile: 100vh - 7rem (header+padding), Desktop: 100vh - 3rem (padding)
  return (
    <div className="h-[calc(100vh-7rem)] md:h-[calc(100vh-3rem)] bg-slate-200 rounded-xl relative overflow-hidden border border-slate-300 shadow-inner">
        {/* Simulated Map Background - Using an SVG pattern to look like roads */}
        <div className="absolute inset-0 bg-[#e5e7eb] opacity-60">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
                        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="white" strokeWidth="3"/>
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
        </div>

        {/* Traffic Density Layer (Admin Only) */}
        {isAdmin && layers.traffic && (
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-red-500/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
                <div className="absolute top-1/4 left-1/4 w-48 h-48 bg-amber-500/20 rounded-full blur-2xl"></div>
                <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-red-600/10 rounded-full blur-3xl"></div>
                <svg className="w-full h-full opacity-60">
                    <line x1="0" y1="20%" x2="100%" y2="80%" stroke="#ef4444" strokeWidth="6" strokeDasharray="20,10" strokeLinecap="round" className="animate-pulse" />
                    <line x1="100%" y1="10%" x2="0" y2="90%" stroke="#f59e0b" strokeWidth="4" strokeDasharray="15,15" strokeLinecap="round" />
                    <line x1="20%" y1="0" x2="80%" y2="100%" stroke="#ef4444" strokeWidth="4" strokeDasharray="10,20" strokeLinecap="round" />
                </svg>
                {/* Traffic Legend/Indicator */}
                <div className="absolute top-20 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-red-100 flex items-center gap-2 shadow-sm">
                    <AlertTriangle size={14} className="text-red-500" />
                    <span className="text-xs font-bold text-red-700">High Congestion Detected</span>
                </div>
            </div>
        )}

        {/* Optimized Route Line Visualization (Non-Admin Only) */}
        {!isAdmin && targetPos && (
            <>
                <svg className="absolute inset-0 pointer-events-none z-0 w-full h-full">
                    <line 
                        x1={`${userPos.x}%`} 
                        y1={`${userPos.y}%`} 
                        x2={`${targetPos.x}%`} 
                        y2={`${targetPos.y}%`} 
                        stroke="#16a34a" 
                        strokeWidth="3" 
                        strokeDasharray="5,5"
                        className="animate-pulse opacity-60"
                    />
                </svg>

                {/* Real-time ETA Badge on Midpoint */}
                {eta && (
                    <div 
                        className="absolute z-20 -translate-x-1/2 -translate-y-1/2 shadow-xl pointer-events-none transition-all duration-300 ease-linear"
                        style={{
                            left: `${(userPos.x + targetPos.x) / 2}%`,
                            top: `${(userPos.y + targetPos.y) / 2}%`
                        }}
                    >
                        <div className="bg-slate-900/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full flex items-center gap-2 border border-slate-700 animate-in zoom-in duration-300">
                            <Car size={14} className="text-brand-400" />
                            <span className="font-bold text-brand-400 text-sm">{eta.time} min</span>
                            <span className="w-px h-3 bg-slate-600"></span>
                            <span className="text-xs text-slate-300">{eta.distance} km</span>
                        </div>
                    </div>
                )}
            </>
        )}
        
        {/* Simulated Parks/Areas */}
        <div className="absolute top-1/4 left-1/4 w-48 h-32 bg-green-100/50 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-stone-200/50 rounded-full blur-xl pointer-events-none"></div>

        {/* Live Indicator */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-slate-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                {isAdmin ? 'SYSTEM LIVE' : 'LIVE'} <Wifi size={12} className="text-slate-400" />
            </span>
        </div>

        {/* Current User Marker (Non-Admin Only) */}
        {!isAdmin && (
            <div 
                className="absolute z-10 flex flex-col items-center transition-all duration-[2000ms] ease-linear will-change-[top,left]"
                style={{ 
                    top: `${userPos.y}%`, 
                    left: `${userPos.x}%`,
                    transform: 'translate(-50%, -50%)' 
                }}
            >
                <div className="w-16 h-16 bg-brand-500/20 rounded-full animate-pulse absolute"></div>
                <div className="w-4 h-4 bg-brand-600 rounded-full border-2 border-white shadow-lg z-20"></div>
                <div className="bg-white px-2 py-1 rounded shadow text-[10px] font-bold mt-1 z-20 whitespace-nowrap">You</div>
            </div>
        )}

        {/* Admin Fleet Markers */}
        {isAdmin && visibleFleet.map(member => (
            <div
                key={member.id}
                className="absolute z-30 flex flex-col items-center transition-all duration-[2000ms] ease-linear will-change-[top,left]"
                style={{ 
                    top: `${member.coords.y}%`, 
                    left: `${member.coords.x}%`,
                    transform: 'translate(-50%, -50%)' 
                }}
            >
                <div className={`w-3 h-3 rounded-full border-2 border-white shadow-sm z-20 ${member.status === 'busy' ? 'bg-amber-500' : 'bg-brand-500'}`}></div>
                <div className="mt-1 bg-slate-900/80 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm whitespace-nowrap opacity-0 hover:opacity-100 transition-opacity">
                    {member.name}
                </div>
            </div>
        ))}

        {/* Gig Markers */}
        {visibleGigs.map((gig) => {
            const pos = gigPos[gig.id] || { x: 50, y: 50 }; // Fallback
            const isSelected = gig.id === effectiveTargetId && !isAdmin;
            
            return (
                <div 
                    key={gig.id} 
                    className={`absolute group cursor-pointer transition-all duration-[2000ms] ease-linear will-change-[top,left] ${isSelected ? 'z-40' : 'z-10'}`} 
                    style={{ 
                        top: `${pos.y}%`, 
                        left: `${pos.x}%` 
                    }}
                    onClick={() => setSelectedGigId(gig.id)}
                >
                    <div className={`relative flex flex-col items-center transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                         <div className={`p-1 rounded-full shadow-lg border mb-1 ${isSelected ? 'bg-brand-600 border-white ring-2 ring-brand-300' : 'bg-white border-slate-100'}`}>
                            {gig.type === 'prescription' && <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSelected ? 'bg-white text-red-500' : 'bg-red-100'}`}>💊</div>}
                            {gig.type === 'paperwork' && <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSelected ? 'bg-white text-stone-500' : 'bg-stone-100'}`}>📄</div>}
                            {gig.type === 'shopping' && <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSelected ? 'bg-white text-green-500' : 'bg-green-100'}`}>🛍️</div>}
                            {gig.type === 'parcel' && <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${isSelected ? 'bg-white text-amber-500' : 'bg-amber-100'}`}>📦</div>}
                         </div>
                         <div className={`absolute bottom-full mb-2 ${isSelected ? 'block' : 'hidden group-hover:block'} w-48 bg-white p-2 rounded-lg shadow-xl text-xs z-30`}>
                             <div className="font-bold text-slate-800">{gig.title}</div>
                             <div className="text-brand-600 font-bold">${gig.price.toFixed(2)}</div>
                             <div className="text-slate-500">{gig.distance} away</div>
                         </div>
                    </div>
                </div>
            )
        })}

        {/* Admin Overlay: Live Stats */}
        {isAdmin && (
             <div className="absolute top-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-slate-200 w-48 animate-in slide-in-from-left duration-500">
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Live Operations</div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Bike size={14} className="text-brand-600" /> Active Fleet
                        </div>
                        <span className="font-bold text-slate-900">{fleet.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                            <Layers size={14} className="text-brand-600" /> Active Gigs
                        </div>
                        <span className="font-bold text-slate-900">{MOCK_GIGS.length}</span>
                    </div>
                </div>
             </div>
        )}

        {/* Admin Layer Controls (New Feature) */}
        {isAdmin && (
            <div className="absolute bottom-6 right-6 z-50 flex flex-col items-end">
                <button 
                onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
                className={`p-3 rounded-full shadow-lg border transition-all flex items-center justify-center ${isLayerMenuOpen ? 'bg-slate-800 text-white border-slate-900' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                title="Map Layers"
                >
                    <Layers size={20} />
                </button>
                
                {isLayerMenuOpen && (
                <div className="absolute bottom-14 right-0 bg-white rounded-xl shadow-xl border border-slate-200 p-4 w-60 animate-in slide-in-from-bottom-2 duration-200">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Filter size={12} /> Map Filters
                    </h4>
                    <div className="space-y-3">
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Busy Fleet Only</span>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${layers.busyFleetOnly ? 'bg-brand-600' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${layers.busyFleetOnly ? 'left-6' : 'left-1'}`} />
                                <input 
                                    type="checkbox" 
                                    checked={layers.busyFleetOnly}
                                    onChange={e => setLayers({...layers, busyFleetOnly: e.target.checked})}
                                    className="sr-only"
                                />
                            </div>
                        </label>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Open Gigs Only</span>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${layers.openGigsOnly ? 'bg-brand-600' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${layers.openGigsOnly ? 'left-6' : 'left-1'}`} />
                                <input 
                                    type="checkbox" 
                                    checked={layers.openGigsOnly}
                                    onChange={e => setLayers({...layers, openGigsOnly: e.target.checked})}
                                    className="sr-only"
                                />
                            </div>
                        </label>
                        <div className="h-px bg-slate-100 my-2"></div>
                        <label className="flex items-center justify-between cursor-pointer group">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">Traffic Density</span>
                                {layers.traffic && <Activity size={12} className="text-red-500 animate-pulse" />}
                            </div>
                            <div className={`w-10 h-5 rounded-full relative transition-colors ${layers.traffic ? 'bg-red-500' : 'bg-slate-300'}`}>
                                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all shadow-sm ${layers.traffic ? 'left-6' : 'left-1'}`} />
                                <input 
                                    type="checkbox" 
                                    checked={layers.traffic}
                                    onChange={e => setLayers({...layers, traffic: e.target.checked})}
                                    className="sr-only"
                                />
                            </div>
                        </label>
                    </div>
                </div>
                )}
            </div>
        )}

        {/* Map Controls (Hide on Admin to avoid clutter) */}
        {!isAdmin && (
            <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
                <button className="bg-white p-3 rounded-full shadow-lg text-slate-700 hover:bg-slate-50">
                    <Navigation size={20} />
                </button>
                <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col gap-1">
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-xl font-bold text-slate-600">+</button>
                    <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-xl font-bold text-slate-600">-</button>
                </div>
            </div>
        )}

        {/* Search Overlay */}
        <div className="absolute top-4 left-4 right-4 md:left-auto md:w-96 z-20">
            {/* If admin, adjust position to not overlap stats */}
            <div className={`bg-white p-2 rounded-lg shadow-lg flex gap-2 ${isAdmin ? 'md:mr-16 mt-16 md:mt-0' : ''}`}>
                <div className="flex-1 bg-slate-100 rounded px-3 py-2 flex items-center text-slate-500 text-sm">
                    <MapPin size={16} className="mr-2" />
                    Search area...
                </div>
                <button className="bg-brand-600 text-white px-4 py-2 rounded font-medium text-sm">Filter</button>
            </div>
        </div>
    </div>
  );
};