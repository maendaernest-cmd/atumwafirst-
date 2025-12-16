import React, { useState, useEffect, useRef } from 'react';
import { MOCK_CHATS } from '../constants';
import { useAuth } from '../context/AuthContext';
import { ChatThread, Message } from '../types';
import { Search, MoreVertical, Send, Image as ImageIcon, Mic, MessageSquare } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const MOCK_INCOMING_MESSAGES = [
  "Are you close?",
  "Can you grab an extra bag?",
  "I'm at the entrance.",
  "Thanks!",
  "Just confirming the address.",
  "How much longer?",
  "Great work!",
  "Is the traffic bad?",
  "Call me if you get lost."
];

export const Messages: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [chats, setChats] = useState<ChatThread[]>(MOCK_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(MOCK_CHATS[0].id);
  const [messageInput, setMessageInput] = useState('');
  
  // Initialize message history
  const [chatMessages, setChatMessages] = useState<Record<string, Message[]>>({
    'c1': [
        { id: 'm1', senderId: 'u2', receiverId: 'u1', text: 'Is the prescription ready for pickup?', timestamp: '10:30 AM', isRead: true }
    ],
    'c2': [
        { id: 'm2', senderId: 'u1', receiverId: 'u3', text: 'Dropping it off now.', timestamp: 'Yesterday', isRead: true },
        { id: 'm3', senderId: 'u3', receiverId: 'u1', text: 'Thank you for the quick delivery!', timestamp: 'Yesterday', isRead: true }
    ]
  });

  const activeChat = chats.find(c => c.id === activeChatId) || null;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Refs for accessing current state inside interval closure without resetting it
  const activeChatIdRef = useRef(activeChatId);
  const chatsRef = useRef(chats);

  useEffect(() => {
      activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  useEffect(() => {
      chatsRef.current = chats;
  }, [chats]);

  // Handle incoming navigation state (e.g. "Chat" button from Gigs page)
  useEffect(() => {
    if (location.state?.recipientId) {
        const { recipientId, recipientName } = location.state;
        const existingChat = chats.find(c => c.participant.id === recipientId);
        
        if (existingChat) {
            setActiveChatId(existingChat.id);
        } else {
            // Create new temporary chat thread
            const newChat: ChatThread = {
                id: `c_${Date.now()}`,
                participant: {
                    id: recipientId,
                    name: recipientName || 'Messenger',
                    role: 'atumwa',
                    avatar: `https://ui-avatars.com/api/?name=${recipientName || 'Messenger'}&background=random`,
                    rating: 5.0,
                    location: 'Unknown',
                    isVerified: true
                },
                lastMessage: '',
                lastMessageTime: 'Now',
                unreadCount: 0
            };
            setChats(prev => [newChat, ...prev]);
            setActiveChatId(newChat.id);
        }
    }
  }, [location.state]);

  // Scroll to bottom when messages change
  useEffect(() => {
      if (activeChatId) {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
  }, [chatMessages, activeChatId]);

  // Simulate WebSocket Connection (Typing & Incoming Messages)
  useEffect(() => {
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const interval = setInterval(() => {
        // Simulation Logic: 60% chance to trigger an event cycle every 3 seconds
        if (Math.random() > 0.4) {
            const currentChats = chatsRef.current;
            if (currentChats.length === 0) return;

            // Pick a random chat to become active
            const randomChatIndex = Math.floor(Math.random() * currentChats.length);
            const targetChat = currentChats[randomChatIndex];
            
            // 1. Set Typing Status
            setChats(prev => prev.map(c => 
                c.id === targetChat.id ? { ...c, isTyping: true } : c
            ));

            // 2. Schedule Message Delivery (1s - 2.5s delay)
            const delay = 1000 + Math.random() * 1500;
            const timeoutId = setTimeout(() => {
                const randomText = MOCK_INCOMING_MESSAGES[Math.floor(Math.random() * MOCK_INCOMING_MESSAGES.length)];
                const now = new Date();
                const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                if (!user) return;

                const newMessage: Message = {
                    id: `nm-${Date.now()}`,
                    senderId: targetChat.participant.id,
                    receiverId: user.id,
                    text: randomText,
                    timestamp: timeString,
                    isRead: false
                };

                // Update Message History
                setChatMessages(prev => ({
                    ...prev,
                    [targetChat.id]: [...(prev[targetChat.id] || []), newMessage]
                }));

                // Update Chat List (Clear typing, update text/count, move to top)
                setChats(prevChats => {
                    const updatedChats = prevChats.map(c => {
                        if (c.id === targetChat.id) {
                            const isChatActive = c.id === activeChatIdRef.current;
                            return {
                                ...c,
                                isTyping: false,
                                lastMessage: randomText,
                                lastMessageTime: timeString,
                                unreadCount: isChatActive ? 0 : c.unreadCount + 1
                            };
                        }
                        return c;
                    });
                    
                    // Move updated chat to top
                    const updatedTarget = updatedChats.find(c => c.id === targetChat.id);
                    const others = updatedChats.filter(c => c.id !== targetChat.id);
                    return updatedTarget ? [updatedTarget, ...others] : others;
                });

            }, delay);
            
            timeouts.push(timeoutId);
        }
    }, 3000);

    return () => {
        clearInterval(interval);
        timeouts.forEach(clearTimeout);
    };
  }, [user]); 

  if (!user) return null;

  const handleChatSelect = (id: string) => {
    setActiveChatId(id);
    // Mark as read when selected
    setChats(prev => prev.map(chat => 
        chat.id === id ? { ...chat, unreadCount: 0 } : chat
    ));
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !activeChatId) return;
    
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessage: Message = {
        id: `om-${Date.now()}`,
        senderId: user.id,
        receiverId: activeChat?.participant.id || 'unknown',
        text: messageInput,
        timestamp: timeString,
        isRead: true
    };

    // Update Message History
    setChatMessages(prev => ({
        ...prev,
        [activeChatId]: [...(prev[activeChatId] || []), newMessage]
    }));

    // Update List
    setChats(prev => {
        const updatedChats = prev.map(chat => {
            if (chat.id === activeChatId) {
                return {
                    ...chat,
                    lastMessage: messageInput,
                    lastMessageTime: timeString
                };
            }
            return chat;
        });
        const active = updatedChats.find(c => c.id === activeChatId);
        const others = updatedChats.filter(c => c.id !== activeChatId);
        return active ? [active, ...others] : others;
    });
    
    setMessageInput('');
  };

  const currentMessages = activeChatId ? (chatMessages[activeChatId] || []) : [];

  // Calculate container height dynamically
  // Mobile: 100vh - header(64px) - padding-top(24px) - padding-bottom(24px) ~ 112px gap. Safe with 7rem.
  // Desktop: 100vh - padding(48px) ~ 3rem.
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[calc(100vh-7rem)] md:h-[calc(100vh-3rem)] flex">
      {/* Sidebar - Chat List */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-col border-r border-slate-200`}>
        <div className="p-4 border-b border-slate-100">
           <h2 className="text-xl font-bold text-slate-800 mb-4">Messages</h2>
           <div className="relative">
              <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
              <input 
                type="text" 
                placeholder="Search messages..." 
                className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
           </div>
        </div>
        <div className="flex-1 overflow-y-auto">
           {chats.map(chat => (
             <div 
               key={chat.id} 
               onClick={() => handleChatSelect(chat.id)}
               className={`p-4 flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors ${activeChatId === chat.id ? 'bg-brand-50 border-r-4 border-brand-500' : 'border-b border-slate-50'}`}
             >
                <div className="relative">
                   <img src={chat.participant.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                   {/* Online Indicator */}
                   <span className="absolute bottom-0 right-0 bg-green-500 border-2 border-white w-3 h-3 rounded-full"></span>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <h3 className={`truncate ${chat.unreadCount > 0 ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>{chat.participant.name}</h3>
                        <span className={`text-xs ${chat.unreadCount > 0 ? 'text-brand-600 font-bold' : 'text-slate-400'}`}>{chat.lastMessageTime}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <p className={`text-sm truncate pr-2 ${chat.unreadCount > 0 ? 'text-slate-900 font-medium' : 'text-slate-500'}`}>
                            {chat.isTyping ? <span className="text-brand-600 italic animate-pulse">Typing...</span> : chat.lastMessage}
                        </p>
                        {chat.unreadCount > 0 && (
                            <span className="bg-brand-600 text-white text-[10px] font-bold h-5 min-w-[1.25rem] px-1.5 rounded-full flex items-center justify-center shadow-sm">
                                {chat.unreadCount}
                            </span>
                        )}
                    </div>
                </div>
             </div>
           ))}
        </div>
      </div>

      {/* Main Chat Area */}
      {activeChat ? (
        <div className="flex-1 flex flex-col h-full bg-slate-50">
            {/* Chat Header */}
            <div className="bg-white p-4 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <button className="md:hidden text-slate-500 mr-2" onClick={() => setActiveChatId(null)}>←</button>
                    <img src={activeChat.participant.avatar} alt="" className="w-10 h-10 rounded-full" />
                    <div>
                        <h3 className="font-bold text-slate-800">{activeChat.participant.name}</h3>
                        <div className="text-xs text-green-600 flex items-center gap-1">
                            {activeChat.isTyping ? (
                                <span className="animate-pulse font-semibold">Typing...</span>
                            ) : (
                                <>● Online</>
                            )}
                        </div>
                    </div>
                </div>
                <button className="text-slate-400 hover:text-slate-600">
                    <MoreVertical size={20} />
                </button>
            </div>

            {/* Messages Stream */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="flex justify-center">
                    <span className="text-xs text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Today</span>
                </div>
                
                {currentMessages.map((msg, index) => {
                   const isMe = msg.senderId === user.id;
                   return (
                       <div key={msg.id || index} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                           {!isMe && <img src={activeChat.participant.avatar} className="w-8 h-8 rounded-full self-end" alt="avatar" />}
                           
                           <div className={`p-3 rounded-2xl shadow-sm max-w-[80%] text-sm ${
                               isMe 
                               ? 'bg-brand-600 text-white rounded-br-none' 
                               : 'bg-white border border-slate-100 text-slate-800 rounded-bl-none'
                           }`}>
                               <p>{msg.text}</p>
                               <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-brand-200' : 'text-slate-400'}`}>{msg.timestamp}</p>
                           </div>
                       </div>
                   )
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-slate-200">
                <div className="flex items-center gap-2">
                    <button className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-full transition-colors">
                        <ImageIcon size={20} />
                    </button>
                    <div className="flex-1 relative">
                        <input 
                            type="text" 
                            value={messageInput}
                            onChange={(e) => setMessageInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..." 
                            className="w-full bg-slate-100 border-0 rounded-full pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button className="absolute right-2 top-2 p-1 text-slate-400 hover:text-brand-600">
                            <Mic size={18} />
                        </button>
                    </div>
                    <button 
                        onClick={handleSendMessage}
                        className="p-3 bg-brand-600 text-white rounded-full hover:bg-brand-700 transition-colors shadow-sm"
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center flex-col text-slate-400">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <MessageSquare size={32} />
            </div>
            <p>Select a conversation to start messaging</p>
        </div>
      )}
    </div>
  );
};