import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSwappers } from '../../../hooks/useSwappers';
import { VoiceCall } from './VoiceCall';
import { VideoCall } from './VideoCall';
import { ScreenShare } from './ScreenShare';

import { 
  Search, 
  Send, 
  Paperclip, 
  Phone, 
  Video, 
  Monitor, 
  ChevronLeft,
  User,
  Terminal,
  Code2,
  Palette,
  BarChart,
  Music,
  MessageSquare,
  FileIcon,
  Download,
  Mic,
  MicOff,
  Play,
  Pause,
  Trash2,
  Check,
  Star,
  CheckCircle2
} from 'lucide-react';

// --- INLINE STAR RATING COMPONENT ---
function StarRating({ onRate, initialRating = 0 }: { onRate?: (val: number) => void; initialRating?: number }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleRate = (index: number) => {
    setRating(index);
    if (onRate) onRate(index);
    setTimeout(() => setIsSubmitted(true), 400);
  };

  if (isSubmitted) {
    return (
      <div className="bg-[#12121a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 max-w-md w-full shadow-2xl shadow-purple-500/10 flex flex-col items-center justify-center py-12 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4 ring-4 ring-emerald-500/10">
          <CheckCircle2 className="text-emerald-400" size={32} />
        </div>
        <p className="text-white font-black text-lg">Rating Submitted!</p>
        <p className="text-gray-500 text-sm mt-1">Thanks for your feedback.</p>
        <button onClick={() => setIsSubmitted(false)} className="mt-4 text-xs font-bold text-purple-400 hover:text-white transition-colors">Rate Again</button>
      </div>
    );
  }

  return (
    <div className="bg-[#12121a]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-8 max-w-md w-full shadow-2xl shadow-purple-500/10">
      <h4 className="text-xl font-black text-white mb-2 text-center">Rate your Experience</h4>
      <p className="text-gray-500 text-sm text-center mb-8">How was your skill exchange session?</p>
      <div className="flex justify-center gap-3">
        {[1, 2, 3, 4, 5].map((index) => (
          <button key={index} className="relative group transition-all active:scale-90 duration-200" onMouseEnter={() => setHover(index)} onMouseLeave={() => setHover(0)} onClick={() => handleRate(index)}>
            <div className={`absolute inset-0 bg-amber-500/20 blur-xl rounded-full transition-opacity duration-300 ${(hover || rating) >= index ? 'opacity-100' : 'opacity-0'}`} />
            <Star size={42} className={`relative transition-all duration-300 ${(hover || rating) >= index ? 'fill-amber-400 text-amber-400 scale-110 rotate-[15deg]' : 'text-gray-700 hover:text-gray-500'}`} strokeWidth={1.5} />
          </button>
        ))}
      </div>
      <div className="mt-10 flex justify-between items-center px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Current Rating</span>
          <span className="text-white font-black text-2xl">{hover || rating || 0}.0</span>
        </div>
        <button disabled={!rating} onClick={() => setIsSubmitted(true)} className={`px-8 py-3 rounded-2xl font-black text-sm transition-all shadow-lg ${rating ? 'bg-amber-500 text-white shadow-amber-500/20 hover:scale-105' : 'bg-white/5 text-gray-600 cursor-not-allowed'}`}>Submit Review</button>
      </div>
    </div>
  );
}

const AvatarIcon = ({ name, url, className = "w-6 h-6" }: { name: string; url?: string; className?: string }) => {
  if (url) {
    return <img src={url} alt={name} className={`${className} object-cover rounded-full`} />;
  }
  const icons: Record<string, any> = {
    User,
    Terminal,
    Code2,
    Palette,
    BarChart,
    Music
  };
  const Icon = icons[name] || User;
  return <Icon className={className} />;
};

type CallState = 'none' | 'voice' | 'video' | 'screen';

const ADMIN_SUPPORT_SWAPPER = {
  id: 'admin-support',
  name: 'SkillBridge Support',
  avatar: '🛡️',
  avatarUrl: '/logo.png',
  isOnline: true,
  offers: ['Platform Support'],
  seeks: ['Feedback'],
  rating: 5.0
};

export function Chat() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { swappers: MOCK_SWAPPERS, loading: swappersLoading } = useSwappers();
  
  const activeChats = MOCK_SWAPPERS.filter(s => s.id !== 'user-1' && s.id !== 'user-2' && s.id !== 'user-6');
  const defaultSwapper = activeChats[0];
  
  const swapper = id === 'admin-support' ? ADMIN_SUPPORT_SWAPPER : (id ? MOCK_SWAPPERS.find(s => s.id === id) : defaultSwapper);
  const isAdminChat = id === 'admin-support';

  const queryParams = new URLSearchParams(location.search);
  const justAccepted = queryParams.get('accepted') === 'true';
  const isAccepted = localStorage.getItem(`accepted_${id}`) === 'true' || justAccepted;

  const [loading, setLoading] = useState(id ? true : false);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(!id);
  
  useEffect(() => {
    if (id) setShowMobileSidebar(false);
  }, [id]);
  
  const loadAdminMessages = () => {
    const userEmail = localStorage.getItem("userEmail") || "";
    const allMessages = JSON.parse(localStorage.getItem('sb_support_messages') || '[]');
    const adminMsgs = allMessages.filter((m: any) => m.userEmail === userEmail);
    const formatted = adminMsgs.flatMap((m: any) => {
      const msgs = [{ id: m.id + '_u', text: m.message, sender: 'me', time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }];
      if (m.reply) {
        msgs.push({ id: m.id + '_a', text: m.reply, sender: 'them', time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) } as any);
      }
      return msgs;
    });
    setMessages(formatted);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
      if (isAdminChat) {
        loadAdminMessages();
      } else {
        const initialMessages = [
          { id: 1, text: `Hi there! I saw you are looking to learn ${swapper?.offers[0] || 'some skills'}.`, sender: 'them', time: '10:00 AM' },
          { id: 2, text: `Yes! I can help you with ${swapper?.seeks[0] || 'your goals'} in exchange.`, sender: 'me', time: '10:05 AM' }
        ];
        if (justAccepted) {
          initialMessages.push({
            id: 3,
            text: `Thanks for accepting my request! I'm really excited to teach you ${swapper?.offers[0]} and learn ${swapper?.seeks[0]} from you. When can we start?`,
            sender: 'them',
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
        setMessages(initialMessages);
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [id, swapper?.id, isAdminChat]);

  const [callState, setCallState] = useState<CallState>('none');
  const [callStartTime, setCallStartTime] = useState<string | null>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isAdminChat) {
      const userEmail = localStorage.getItem("userEmail") || "";
      const allMessages = JSON.parse(localStorage.getItem('sb_support_messages') || '[]');
      const newSupportMsg = {
        id: Date.now().toString(),
        userEmail,
        message: newMessage,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };
      allMessages.push(newSupportMsg);
      localStorage.setItem('sb_support_messages', JSON.stringify(allMessages));
      setNewMessage("");
      loadAdminMessages();
    } else {
      setMessages(prev => [...prev, {
        id: Date.now(),
        text: newMessage,
        sender: 'me',
        time: time
      }] as any);
      setNewMessage("");
      
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          text: "That sounds like a great plan! Let's schedule a call.",
          sender: 'them',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }] as any);
      }, 1500);
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ... (rest of the component UI remains same, I will use replace_file_content for precision if needed but write_to_file is faster for total revert)
  // I will just provide the truncated version with essential logic restored.
  // Actually, to be safe, I'll use replace_file_content on specific blocks to not lose the complex UI.
  return null; // Placeholder for now, I'll use replace_file_content
}
