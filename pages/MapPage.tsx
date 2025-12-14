import React, { useState, useEffect, useRef } from 'react';
import { MOCK_GIGS } from '../constants';
import { MapPin, Navigation, Wifi } from 'lucide-react';

interface Coords {
  x: number; // Represents left %
  y: number; // Represents top %
}

export const MapPage: React.FC = () => {
  // State for real-time positions
  const [userPos, setUserPos] = useState<Coords>({ x: 50, y: 50 });
  const [gigPos, setGigPos] = useState<Record<string, Coords>>(() => {
    // Initialize gigs with the same layout logic as before
    const initial: Record<string, Coords> = {};
    MOCK_GIGS.forEach((gig, index) => {
        initial[gig.id] = {
            y: 20 + (index * 15),
            x: 20 + (index * 20)
        };
    });
    return initial;
  });

  // Ref to hold the 'server-side' truth for the simulation to prevent drift/closure issues
  const serverState = useRef({
      user: { x: 50, y: 50 },
      gigs: {} as Record<string, Coords>
  });

  // Initialize server state ref
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
        
        // 1. Simulate User Movement (Random walk)
        const moveUser = Math.random() > 0.3; // 70% chance to move
        if (moveUser) {
            const current = serverState.current.user;
            // Move by -2% to +2%
            const newX = Math.max(5, Math.min(95, current.x + (Math.random() - 0.5) * 4));
            const newY = Math.max(5, Math.min(95, current.y + (Math.random() - 0.5) * 4));
            
            serverState.current.user = { x: newX, y: newY };
            
            // Update React State
            setUserPos({ x: newX, y: newY });
        }

        // 2. Simulate Gig Movement (e.g. delivery in progress)
        MOCK_GIGS.forEach(gig => {
            // 30% chance per gig to move per tick
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

    }, 2000); // Update every 2 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="h-[calc(100vh-8rem)] md:h-[calc(100vh-3rem)] bg-slate-200 rounded-xl relative overflow-hidden border border-slate-300 shadow-inner">
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
        
        {/* Simulated Parks/Areas */}
        <div className="absolute top-1/4 left-1/4 w-48 h-32 bg-green-100/50 rounded-full blur-xl pointer-events-none"></div>
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-blue-100/50 rounded-full blur-xl pointer-events-none"></div>

        {/* Live Indicator */}
        <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-sm flex items-center gap-2 border border-slate-200">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                LIVE <Wifi size={12} className="text-slate-400" />
            </span>
        </div>

        {/* Current User Marker */}
        <div 
            className="absolute z-10 flex flex-col items-center transition-all duration-[2000ms] ease-linear will-change-[top,left]"
            style={{ 
                top: `${userPos.y}%`, 
                left: `${userPos.x}%`,
                transform: 'translate(-50%, -50%)' 
            }}
        >
            <div className="w-16 h-16 bg-blue-500/20 rounded-full animate-pulse absolute"></div>
            <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-20"></div>
            <div className="bg-white px-2 py-1 rounded shadow text-[10px] font-bold mt-1 z-20 whitespace-nowrap">You</div>
        </div>

        {/* Gig Markers */}
        {MOCK_GIGS.map((gig) => {
            const pos = gigPos[gig.id] || { x: 50, y: 50 }; // Fallback
            
            return (
                <div 
                    key={gig.id} 
                    className="absolute group cursor-pointer transition-all duration-[2000ms] ease-linear will-change-[top,left]" 
                    style={{ 
                        top: `${pos.y}%`, 
                        left: `${pos.x}%` 
                    }}
                >
                    <div className="relative flex flex-col items-center transition-transform hover:scale-110">
                         <div className="bg-white p-1 rounded-full shadow-lg border border-slate-100 mb-1">
                            {gig.type === 'prescription' && <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-xs">💊</div>}
                            {gig.type === 'paperwork' && <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-xs">📄</div>}
                            {gig.type === 'shopping' && <div className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center text-xs">🛍️</div>}
                            {gig.type === 'parcel' && <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-xs">📦</div>}
                         </div>
                         <div className="absolute bottom-full mb-2 hidden group-hover:block w-48 bg-white p-2 rounded-lg shadow-xl text-xs z-30">
                             <div className="font-bold text-slate-800">{gig.title}</div>
                             <div className="text-brand-600 font-bold">${gig.price.toFixed(2)}</div>
                             <div className="text-slate-500">{gig.distance} away</div>
                         </div>
                    </div>
                </div>
            )
        })}

        {/* Map Controls */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20">
            <button className="bg-white p-3 rounded-full shadow-lg text-slate-700 hover:bg-slate-50">
                <Navigation size={20} />
            </button>
            <div className="bg-white p-2 rounded-lg shadow-lg flex flex-col gap-1">
                 <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-xl font-bold text-slate-600">+</button>
                 <button className="w-8 h-8 flex items-center justify-center hover:bg-slate-100 rounded text-xl font-bold text-slate-600">-</button>
            </div>
        </div>

        {/* Search Overlay */}
        <div className="absolute top-4 left-4 right-4 md:w-96 z-20">
            <div className="bg-white p-2 rounded-lg shadow-lg flex gap-2">
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
