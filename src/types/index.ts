export interface Swapper {
  id: string;
  name: string;
  avatar: string;
  avatarUrl?: string;
  offers: string[];
  seeks: string[];
  rating: number;
  match: number;
  isOnline?: boolean;
  status?: 'active' | 'suspended' | 'deleted';
  suspensionEndDate?: string;
  reports?: number;
  appealStatus?: 'none' | 'pending' | 'resolved';
  appealMessage?: string;
  email?: string;
}

export interface SupportMessage {
  id: string;
  userEmail: string;
  message: string;
  reply?: string;
  status: 'pending' | 'resolved';
  timestamp: string;
}

export interface LandingContent {
  heroTitle: string;
  heroSubtitle: string;
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
  testimonials: {
    author: string;
    role: string;
    content: string;
    rating: number;
  }[];
}
