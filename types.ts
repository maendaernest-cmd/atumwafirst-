export type UserRole = 'client' | 'atumwa' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
  rating: number;
  location: string;
  jobsCompleted?: number;
  isVerified: boolean;
}

export type GigType = 'prescription' | 'paperwork' | 'parcel' | 'shopping';
export type PaymentMethod = 'ecocash' | 'cash_usd' | 'zig';

export interface Gig {
  id: string;
  title: string;
  description: string;
  type: GigType;
  price: number;
  paymentMethod: PaymentMethod;
  status: 'open' | 'in-progress' | 'completed' | 'expired';
  locationStart: string;
  locationEnd: string;
  postedBy: User;
  postedAt: string; // ISO date string
  distance: string;
  assignedTo?: string; // ID of the Atumwa who accepted the gig
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isRead: boolean;
}

export interface ChatThread {
  id: string;
  participant: User;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  isTyping?: boolean;
}

export interface WalletTransaction {
  id: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  description: string;
}