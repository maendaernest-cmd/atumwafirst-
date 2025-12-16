import React, { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLocation, useNavigate } from 'react-router-dom';

/**
 * GlobalSocketListener
 * 
 * This component simulates the "Communication Role" described in the system architecture.
 * It mimics a persistent WebSocket (e.g., Socket.io) connection that listens for:
 * 1. Messaging: Incoming chat messages from other users.
 * 2. Notifications: System broadcasts and "Push" alerts from the backend.
 */
export const GlobalSocketListener: React.FC = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const location = useLocation();
    const navigate = useNavigate();
    
    // Track the last broadcast received to avoid duplicate alerts
    const lastBroadcastIdRef = useRef<number>(0);

    // 1. Simulate Incoming Chat Messages (Messaging Role)
    useEffect(() => {
        if (!user) return;
        
        const chatInterval = setInterval(() => {
            // Do not trigger global toast if user is already on the messages page
            if (location.pathname === '/messages') return;

            // 10% chance every 15 seconds to receive a message
            if (Math.random() > 0.90) {
                addToast(
                    'New Message',
                    'Sarah J: "Hey, are you still nearby?"',
                    'message'
                );
            }
        }, 15000);

        return () => clearInterval(chatInterval);
    }, [user, location.pathname, addToast]);

    // 2. Simulate System/Admin Broadcasts (Notifications Role)
    useEffect(() => {
        if (!user) return;

        // Function to poll for "Push" notifications from the "Server" (localStorage in this mock)
        const checkBroadcasts = () => {
            try {
                const stored = JSON.parse(localStorage.getItem('atumwa_broadcasts') || '[]');
                
                if (stored.length > 0) {
                    const latest = stored[0];
                    
                    // If we see a new ID we haven't processed yet
                    if (latest.id > lastBroadcastIdRef.current) {
                        lastBroadcastIdRef.current = latest.id;
                        
                        // Check Visibility Rule (Client, Atumwa, or All)
                        const isRelevant = latest.audience === 'all' || 
                            (latest.audience === 'clients' && user.role === 'client') ||
                            (latest.audience === 'atumwas' && user.role === 'atumwa');

                        // Don't show alert to the admin who sent it
                        if (isRelevant && user.role !== 'admin') {
                            addToast(
                                `System Alert: ${latest.title}`,
                                latest.content.length > 60 ? latest.content.substring(0, 60) + '...' : latest.content,
                                latest.type === 'alert' ? 'alert' : 'message'
                            );
                        }
                    }
                }
            } catch (e) {
                console.error("Failed to parse broadcasts", e);
            }
        };

        // Initialize ref with current latest to avoid alerting old history on reload
        const initialStored = JSON.parse(localStorage.getItem('atumwa_broadcasts') || '[]');
        if (initialStored.length > 0) {
            lastBroadcastIdRef.current = initialStored[0].id;
        }

        // Poll every 2 seconds to simulate real-time Push latency
        const pushInterval = setInterval(checkBroadcasts, 2000);
        
        return () => clearInterval(pushInterval);
    }, [user, addToast]);

    return null; // Headless component
};