import { Gig, User, ChatThread, WalletTransaction } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u2', name: 'Sarah J.', role: 'client', avatar: 'https://picsum.photos/id/65/200/200', rating: 4.9, location: 'West End', isVerified: true },
  { id: 'u3', name: 'Dr. Smith', role: 'client', avatar: 'https://picsum.photos/id/66/200/200', rating: 5.0, location: 'City Clinic', isVerified: true },
  { id: 'u4', name: 'Mike T.', role: 'atumwa', avatar: 'https://picsum.photos/id/68/200/200', rating: 4.6, location: 'North Side', isVerified: true },
];

// Defined Roles for Login
// MOCK_ATUMWA is unverified to demonstrate ID upload flow
export const MOCK_ATUMWA: User = {
  id: 'u1',
  name: 'Alex M.',
  role: 'atumwa',
  avatar: 'https://picsum.photos/id/64/200/200',
  rating: 4.8,
  location: 'Downtown District',
  jobsCompleted: 142,
  isVerified: false 
};

// MOCK_CLIENT is unverified to demonstrate email verification flow
export const MOCK_CLIENT: User = {
  ...MOCK_USERS[0],
  isVerified: false
}; 

export const MOCK_ADMIN: User = {
  id: 'admin1',
  name: 'Admin User',
  role: 'admin',
  avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff',
  rating: 5.0,
  location: 'HQ',
  jobsCompleted: 0,
  isVerified: true
};

export const MOCK_GIGS: Gig[] = [
  {
    id: 'g1',
    title: 'Urgent Prescription Pickup',
    description: 'Need someone to pick up a prescription from CVS on Main St and deliver to my elderly mother.',
    type: 'prescription',
    price: 15.00,
    status: 'open',
    locationStart: 'CVS Pharmacy, Main St',
    locationEnd: 'Oak Avenue Apartments',
    postedBy: MOCK_USERS[1], // Dr. Smith
    postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    distance: '2.5 km'
  },
  {
    id: 'g2',
    title: 'Legal Document Drop-off',
    description: 'Deliver signed contracts to the City Court Clerk. Must be there before 4 PM.',
    type: 'paperwork',
    price: 25.00,
    status: 'open',
    locationStart: 'Law Offices, 5th Ave',
    locationEnd: 'City Courthouse',
    postedBy: MOCK_USERS[0], // Sarah (MOCK_CLIENT)
    postedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    distance: '1.2 km'
  },
  {
    id: 'g3',
    title: 'Quick Grocery Run',
    description: 'Milk, Eggs, Bread, and Coffee. I am stuck in a meeting.',
    type: 'shopping',
    price: 18.50,
    status: 'open',
    locationStart: 'Whole Foods',
    locationEnd: 'Tech Park, Building B',
    postedBy: MOCK_USERS[0], // Sarah (MOCK_CLIENT)
    postedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    distance: '0.8 km'
  },
  {
    id: 'g4',
    title: 'Parcel Collection from Post Office',
    description: 'Large box waiting at the post office. Too heavy for me to carry.',
    type: 'parcel',
    price: 20.00,
    status: 'in-progress',
    locationStart: 'Central Post Office',
    locationEnd: 'Residential Area',
    postedBy: MOCK_USERS[2], // Mike
    postedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    distance: '3.0 km',
    assignedTo: 'u1' // Assigned to the mock Atumwa
  },
  {
    id: 'g5',
    title: 'Old Request - Forgotten Items',
    description: 'Left my gym bag at the studio. Need it brought to my office.',
    type: 'parcel',
    price: 12.00,
    status: 'open', // This should be marked expired by logic
    locationStart: 'Yoga Studio, 2nd St',
    locationEnd: 'Financial District',
    postedBy: MOCK_USERS[0],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 96 hours ago (4 days)
    distance: '4.5 km'
  },
  {
    id: 'g6',
    title: 'Last Minute Delivery',
    description: 'Need a package delivered to the airport before I fly out tomorrow.',
    type: 'parcel',
    price: 45.00,
    status: 'open',
    locationStart: 'Downtown Hotel',
    locationEnd: 'Airport Terminal 1',
    postedBy: MOCK_USERS[0],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 52 hours ago (within last 24h of 72h window)
    distance: '12 km'
  }
];

export const MOCK_CHATS: ChatThread[] = [
  {
    id: 'c1',
    participant: MOCK_USERS[0],
    lastMessage: 'Is the prescription ready for pickup?',
    lastMessageTime: '10:30 AM',
    unreadCount: 1
  },
  {
    id: 'c2',
    participant: MOCK_USERS[1],
    lastMessage: 'Thank you for the quick delivery!',
    lastMessageTime: 'Yesterday',
    unreadCount: 0
  }
];

export const WALLET_HISTORY: WalletTransaction[] = [
  { id: 't1', date: '2023-10-25', amount: 25.00, type: 'credit', description: 'Legal Doc Delivery' },
  { id: 't2', date: '2023-10-24', amount: 15.00, type: 'credit', description: 'Coffee Run' },
  { id: 't3', date: '2023-10-22', amount: -5.00, type: 'debit', description: 'Platform Fee' },
  { id: 't4', date: '2023-10-20', amount: 40.00, type: 'credit', description: 'Multiple Parcel Drop' },
  { id: 't5', date: '2023-10-18', amount: 22.00, type: 'credit', description: 'Prescription Pickup' },
];

export const FEED_UPDATES = [
  { id: 1, user: MOCK_USERS[0], content: 'Just had a great experience with an Atumwa for my grocery run! 🛒 #lifesaver', time: '2h ago' },
  { id: 2, user: MOCK_USERS[2], content: 'Looking for a reliable messenger for recurring document deliveries. PM me.', time: '4h ago' },
  { id: 3, user: MOCK_ATUMWA, content: 'Completed 5 gigs today. The city is busy! 🏙️', time: '6h ago' },
];