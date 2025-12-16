import { Gig, User, ChatThread, WalletTransaction } from './types';

export const MOCK_USERS: User[] = [
  { id: 'u2', name: 'Sarah J.', role: 'client', avatar: 'https://picsum.photos/id/65/200/200', rating: 4.9, location: 'London, UK', isVerified: true }, // Diaspora Client
  { id: 'u3', name: 'Dr. Moyo', role: 'client', avatar: 'https://picsum.photos/id/66/200/200', rating: 5.0, location: 'Avenues, Harare', isVerified: true }, // Local Client
  { id: 'u4', name: 'Tinashe M.', role: 'atumwa', avatar: 'https://picsum.photos/id/68/200/200', rating: 4.6, location: 'Warren Park', isVerified: true },
];

// Defined Roles for Login
// MOCK_ATUMWA is unverified to demonstrate ID upload flow
export const MOCK_ATUMWA: User = {
  id: 'u1',
  name: 'Blessing C.',
  role: 'atumwa',
  avatar: 'https://picsum.photos/id/64/200/200',
  rating: 4.8,
  location: 'Harare CBD',
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
  location: 'Eastgate Centre',
  jobsCompleted: 0,
  isVerified: true
};

export const MOCK_GIGS: Gig[] = [
  {
    id: 'g1',
    title: 'Urgent Prescription Pickup',
    description: 'Need someone to pick up a prescription from Greenwood Pharmacy on Fife Ave and deliver to my mother in the Avenues.',
    type: 'prescription',
    price: 15.00,
    paymentMethod: 'ecocash',
    status: 'open',
    locationStart: 'Greenwood Pharmacy, Fife Ave',
    locationEnd: 'Jacaranda Mews, Avenues',
    postedBy: MOCK_USERS[1], // Dr. Moyo
    postedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
    distance: '2.5 km'
  },
  {
    id: 'g2',
    title: 'Legal Document Drop-off',
    description: 'Deliver signed contracts to the High Court. Must be there before 4 PM.',
    type: 'paperwork',
    price: 25.00,
    paymentMethod: 'cash_usd',
    status: 'in-progress', // Changed to in-progress for demo
    locationStart: 'Honey & Blanckenberg, 2nd St',
    locationEnd: 'High Court, Samora Machel',
    postedBy: MOCK_USERS[0], // Sarah (Diaspora)
    postedAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(), // 2 hours ago
    distance: '1.2 km',
    assignedTo: 'u1' // Assigned to mock Atumwa
  },
  {
    id: 'g3',
    title: 'Grocery Run for Family',
    description: 'Fresh veggies, Maize Meal, and Cooking Oil from Food Lovers. Delivery to Mt Pleasant.',
    type: 'shopping',
    price: 18.50,
    paymentMethod: 'zig',
    status: 'open',
    locationStart: 'Food Lovers Market, Avondale',
    locationEnd: 'Office Park, Mt Pleasant',
    postedBy: MOCK_USERS[0], // Sarah (Diaspora)
    postedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    distance: '3.0 km'
  },
  {
    id: 'g4',
    title: 'Bus Parcel Collection',
    description: 'Collect a parcel sent from Bulawayo arriving at Roadport. It is a box of auto parts.',
    type: 'parcel',
    price: 20.00,
    paymentMethod: 'ecocash',
    status: 'in-progress',
    locationStart: 'Roadport Bus Station',
    locationEnd: 'Greendale',
    postedBy: MOCK_USERS[2], // Tinashe
    postedAt: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
    distance: '8.0 km',
    assignedTo: 'u1' // Assigned to the mock Atumwa
  },
  {
    id: 'g5',
    title: 'Gym Bag Retrieval',
    description: 'Left my gym bag at the studio in Sam Levy\'s. Need it brought to my office in town.',
    type: 'parcel',
    price: 12.00,
    paymentMethod: 'cash_usd',
    status: 'open', // This should be marked expired by logic
    locationStart: 'ProFitness, Borrowdale',
    locationEnd: 'Eastgate Centre, CBD',
    postedBy: MOCK_USERS[0],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(), // 96 hours ago (4 days)
    distance: '11.5 km'
  },
  {
    id: 'g6',
    title: 'Last Minute Airport Delivery',
    description: 'Need a package delivered to RGM Airport departures drop-off zone.',
    type: 'parcel',
    price: 45.00,
    paymentMethod: 'cash_usd',
    status: 'open',
    locationStart: 'Meikles Hotel',
    locationEnd: 'RGM Int. Airport',
    postedBy: MOCK_USERS[0],
    postedAt: new Date(Date.now() - 1000 * 60 * 60 * 52).toISOString(), // 52 hours ago (within last 24h of 72h window)
    distance: '14 km'
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
  { id: 't2', date: '2023-10-24', amount: 15.00, type: 'credit', description: 'Coffee Run - Avondale' },
  { id: 't3', date: '2023-10-22', amount: -5.00, type: 'debit', description: 'Platform Fee' },
  { id: 't4', date: '2023-10-20', amount: 40.00, type: 'credit', description: 'Roadport Parcel' },
  { id: 't5', date: '2023-10-18', amount: 22.00, type: 'credit', description: 'Pharmacy Pickup' },
];

export const FEED_UPDATES = [
  { id: 1, user: MOCK_USERS[0], content: 'Just had a great experience with an Atumwa for my grocery run in Avondale! 🛒 #Harare #Convenience', time: '2h ago' },
  { id: 2, user: MOCK_USERS[2], content: 'Looking for a reliable messenger for recurring document deliveries to Government Complex. PM me.', time: '4h ago' },
  { id: 3, user: MOCK_ATUMWA, content: 'Completed 5 gigs today. CBD traffic is crazy but we move! 🏙️', time: '6h ago' },
];