export interface Swapper {
  id: string;
  name: string;
  avatar: string;
  offers: string[];
  seeks: string[];
  rating: number;
  match: number;
  isOnline?: boolean;
  avatarUrl?: string;
  isRequested?: boolean;
  reports?: number;
  status: 'active' | 'suspended' | 'deleted';
  suspensionEndDate?: string;
  appealStatus?: 'none' | 'pending' | 'resolved';
  appealMessage?: string;
  reportHistory?: { reason: string; date: string }[];
}

export const MOCK_SWAPPERS: Swapper[] = [
  {
    id: "user-1",
    name: "Carlos M.",
    avatar: "User",
    offers: ["Spanish Language", "Guitar"],
    seeks: ["React Development", "English"],
    rating: 4.9,
    match: 98,
    isOnline: true,
    avatarUrl: "/carlos_avatar_1778031871898.png",
    status: 'active'
  },
  {
    id: "user-2",
    name: "Elena R.",
    avatar: "Terminal",
    offers: ["Python", "Data Science", "Machine Learning"],
    seeks: ["UI/UX Design", "Figma"],
    rating: 4.8,
    match: 95,
    isOnline: false,
    avatarUrl: "/elena_avatar_1778032087691.png",
    status: 'active'
  },
  {
    id: "user-3",
    name: "Arjun K.",
    avatar: "Code2",
    offers: ["ReactJS", "Node.js", "Web Dev"],
    seeks: ["Digital Marketing", "SEO"],
    rating: 5.0,
    match: 88,
    isOnline: true,
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop",
    reports: 12,
    status: 'suspended',
    suspensionEndDate: '2026-05-16',
    appealStatus: 'pending',
    appealMessage: "I am nallavan, please check my last swaps. I was just joking with that user.",
    reportHistory: [
      { reason: "Inappropriate language", date: "2026-05-01" },
      { reason: "Spamming", date: "2026-05-03" }
    ]
  },
  {
    id: "user-4",
    name: "Priya M.",
    avatar: "Palette",
    offers: ["Photoshop", "Illustrator", "Logo Design"],
    seeks: ["Next.js", "Tailwind CSS"],
    rating: 4.7,
    match: 85,
    isOnline: false,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop",
    status: 'active',
    reports: 2
  },
  {
    id: "user-5",
    name: "Lucia G.",
    avatar: "BarChart",
    offers: ["Excel", "Financial Modeling"],
    seeks: ["Public Speaking", "Spanish Language"],
    rating: 4.9,
    match: 70,
    isOnline: true,
    avatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&auto=format&fit=crop",
    status: 'active'
  },
  {
    id: "user-6",
    name: "James T.",
    avatar: "Music",
    offers: ["Bass Guitar", "Music Theory"],
    seeks: ["Python", "JavaScript"],
    rating: 4.6,
    match: 65,
    isOnline: false,
    avatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop",
    reports: 4,
    status: 'active'
  },
  {
    id: "user-7",
    name: "Michael B.",
    avatar: "Shield",
    offers: ["Cybersecurity", "Network Admin"],
    seeks: ["French", "Cooking"],
    rating: 4.2,
    match: 60,
    status: 'deleted',
    reports: 25,
    reportHistory: [
      { reason: "Policy violation", date: "2026-04-15" },
      { reason: "Harassment", date: "2026-04-20" }
    ]
  }
];
