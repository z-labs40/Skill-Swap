import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSwappers } from '../../../hooks/useSwappers';
import { chatService } from '../../../services/chatService';
import { useAuth } from '../../../hooks/useAuth';
import { getAuthState } from '../../../lib/auth';
import { getSupportMessages, sendSupportMessage } from '../../../lib/contentService';
import { SecureImage } from '../../common/SecureImage';
import { SecureAudio } from '../../common/SecureAudio';
import { SecureFileDownload } from '../../common/SecureFileDownload';
import { socketService } from '../../../services/socketService';
import { userService } from '../../../services/userService';
import { useToast } from '../../../context/ToastContext';
import { useCall } from '../../../context/CallContext';
import { AvatarIcon } from '../../common/AvatarIcon';


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
  CheckCircle2,
  PhoneOff,
  MoreVertical,
  Edit2,
  X,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { aiService } from '../../../services/aiService';

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

type CallState = 'none' | 'voice' | 'video' | 'screen';

const ADMIN_SUPPORT_SWAPPER = {
  id: 'admin-support',
  name: 'SkillBridge Support',
  avatar: '🛡️',
  avatarUrl: '/logo.png',
  isOnline: true,
  offers: ['Platform Support'],
  seeks: ['Feedback'],
  rating: 5.0,
  isOfficial: true
};


export function Chat() {
  const { id: otherId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth: currentUser } = useAuth();
  const { swappers: allSwappers, loading: swappersLoading } = useSwappers();
  const [conversations, setConversations] = useState<any[]>([]);
  const [conversationsLoading, setConversationsLoading] = useState(true);
  const { showToast } = useToast();

  const [profile, setProfile] = useState<any>(null);
  const [swapper, setSwapper] = useState<any>(null);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // Sync swapper from allSwappers or fetch if missing
  useEffect(() => {
    if (otherId === 'admin-support') {
      setSwapper({ ...ADMIN_SUPPORT_SWAPPER, isOnline: true });
    } else if (otherId) {
      const found = allSwappers.find(s => s.id === otherId);
      if (found) {
        setSwapper(found);
      } else {
        // Fetch profile if not in swappers list
        userService.getProfile(otherId)
          .then(data => {
            setSwapper({
              ...data,
              avatar: data.name.charAt(0),
              avatarUrl: data.avatar_url,
              isOnline: false
            });
          })
          .catch(err => {
            console.error("Failed to fetch partner profile:", err);
          });
      }
    } else if (conversations.length > 0) {
      // Default to first conversation if no ID in URL
      setSwapper(conversations[0]);
    } else if (allSwappers.length > 0) {
      // Fallback to first available swapper if no conversations
      setSwapper(allSwappers[0]);
    }
  }, [otherId, allSwappers, conversations]);

  const isAdminChat = otherId === 'admin-support';

  const queryParams = new URLSearchParams(location.search);
  const justAccepted = queryParams.get('accepted') === 'true';
  const isAccepted = localStorage.getItem(`accepted_${otherId}`) === 'true' || justAccepted;
  const isNewMatch = false; // Removed mock match logic

  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSidebar, setShowMobileSidebar] = useState(!otherId);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const { callState, startCall: globalStartCall, endCall: globalEndCall } = useCall();

  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleUnsend = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      setMessages(prev => prev.filter(m => m.id !== messageId));
      setActiveMenuId(null);
      showToast("Message unsent", "success");
    } catch (err) {
      showToast("Failed to unsend message", "error");
    }
  };

  const handleEdit = async (messageId: string) => {
    if (!editValue.trim()) return;
    try {
      await chatService.editMessage(messageId, editValue);
      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, text: editValue, isEdited: true } : m
      ));
      setEditingMessageId(null);
      setEditValue("");
      showToast("Message updated", "success");
    } catch (err) {
      showToast("Failed to update message", "error");
    }
  };

  const handleClearChat = async () => {
    if (!otherId || !currentUser.id) return;
    try {
      await chatService.deleteConversation(currentUser.id, otherId);
      setMessages([]);
      setShowConfirmDelete(false);
      showToast("Conversation deleted", "success");
    } catch (err) {
      showToast("Failed to delete conversation", "error");
    }
  };

  useEffect(() => {
    if (currentUser.id) {
      // 1. Set up listeners FIRST
      const handleUserOnline = (userId: string) => {
        console.log(`Chat Socket: User ${userId} is ONLINE`);
        setOnlineUserIds(prev => new Set(prev).add(userId));
      };

      const handleUserOffline = (userId: string) => {
        console.log(`Chat Socket: User ${userId} is OFFLINE`);
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      };

      const handleInitialOnlineUsers = (userIds: string[]) => {
        console.log('Chat Socket: Initial online users:', userIds);
        setOnlineUserIds(new Set(userIds));
      };

      socketService.on('user_online', handleUserOnline);
      socketService.on('user_offline', handleUserOffline);
      socketService.on('get_online_users', handleInitialOnlineUsers);

      // 2. Then connect
      socketService.connect(currentUser.id);

      return () => {
        socketService.off('user_online');
        socketService.off('user_offline');
        socketService.off('get_online_users');
      };
    }
  }, [currentUser.id]);

  useEffect(() => {
    if (currentUser?.id) {
      userService.getProfile(currentUser.id).then(data => {
        setProfile(data);
      });
    }
  }, [currentUser?.id]);

  const fetchMessages = async () => {
    if (!currentUser.id || !otherId) return;
    try {
      const data = await chatService.getMessages(currentUser.id, otherId);
      const mappedMessages = data.map(m => {
        let text = m.message;
        let callType = 'voice';
        let callStatus = 'ended';
        
        if (m.type === 'call') {
          const parts = m.message.split('|');
          if (parts.length >= 3) {
            const initiatorId = parts[0];
            callType = parts[1].toLowerCase();
            callStatus = parts[2].toLowerCase();
            const isMeInitiator = initiatorId === currentUser.id;
            
            if (callStatus === 'ended') {
              text = isMeInitiator ? `Outgoing ${parts[1]} Call` : `Incoming ${parts[1]} Call`;
            } else {
              text = isMeInitiator ? `Cancelled ${parts[1]} Call` : `Missed ${parts[1]} Call`;
            }
          }
        }

        return {
          id: m.id,
          text: text,
          sender: m.sender_id === currentUser.id ? 'me' : 'them',
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isFile: m.type === 'file',
          isVoice: m.type === 'voice',
          isSystem: m.type === 'call',
          callType,
          callStatus,
          duration: m.file_url,
          fileUrl: m.type === 'file' || m.type === 'voice' ? m.file_url : undefined,
          isEdited: m.is_edited
        };
      });
      setMessages(mappedMessages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  // Removed local call listeners and ringtone handling - now handled globally in CallContext

  useEffect(() => {
    if (otherId) {
      setShowMobileSidebar(false);
      setLoading(true);
      
      const handleReceiveMessage = (data: any) => {
        if (data.senderId === otherId || data.receiverId === otherId) {
          console.log("New real-time message received:", data);
          fetchMessages(); // Refresh to get the latest
        }
      };

      socketService.on('receive_private_message', handleReceiveMessage);

      if (isAdminChat) {
        loadAdminMessages();
        const interval = setInterval(loadAdminMessages, 5000); // Poll for admin replies every 5s
        setLoading(false);
        return () => clearInterval(interval);
      } else {
        fetchMessages();
        const interval = setInterval(fetchMessages, 10000); // Polling as fallback (10s)
        return () => {
          clearInterval(interval);
          socketService.off('receive_private_message', handleReceiveMessage);
        };
      }
      
      setAiSuggestions([]); // Clear AI suggestions when switching chats
      
      return () => {
        socketService.off('receive_private_message', handleReceiveMessage);
      };
    } else {
      setLoading(false);
    }
  }, [otherId, currentUser.id, currentUser.email, isAdminChat]);

  const [newMessage, setNewMessage] = useState("");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const loadAdminMessages = async () => {
    if (isAdminChat) {
      const userEmail = currentUser.email || localStorage.getItem("userEmail") || "";

      try {
        const allMessages = await getSupportMessages();
        console.log('Support Chat: Data Received:', allMessages?.length);
        const messagesArray = allMessages || [];
        
        const adminMsgs = messagesArray.filter((m: any) => {
          const dbEmail = (m.user_email || "").toLowerCase().trim();
          const targetEmail = userEmail.toLowerCase().trim();
          const match = dbEmail === targetEmail;
          return match;
        });
        
        console.log('Support Chat: Filtered messages for user:', adminMsgs.length);

        const sorted = adminMsgs.sort((a: any, b: any) => 
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
        );

        const formatted = sorted.map((m: any) => ({
          id: m.id,
          text: m.message,
          sender: (m.status === 'replied' || m.id.toString().startsWith('reply_') || m.id.toString().startsWith('ai_')) ? 'them' : 'me',
          time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }));
        
        setMessages(formatted);
      } catch (error) {
        console.error('Failed to load support messages:', error);
      }
    }
  };

  const loadConversations = async () => {
    if (!currentUser.id) return;
    try {
      const convos = await chatService.getConversations(currentUser.id);
      // Backend now returns profile objects instead of just IDs
      const convoProfiles = convos.map((p: any) => ({
        ...p,
        avatar: p.avatar_url || p.name.charAt(0),
        isOnline: onlineUserIds.has(p.id)
      }));
      setConversations(convoProfiles);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setConversationsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10000); // Update sidebar every 10s
    return () => clearInterval(interval);
  }, [currentUser.id, allSwappers]);

  useEffect(() => {
    loadAdminMessages();
    const handleUpdate = () => {
      loadAdminMessages();
      loadConversations();
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('focus', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('focus', handleUpdate);
    };
  }, [otherId, isAdminChat]);
  const [callStartTime, setCallStartTime] = useState<string | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [isPausedVoice, setIsPausedVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [showRatingModal, setShowRatingModal] = useState(false);

  const startCall = (type: any) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setCallStartTime(time);
    setMessages(prev => [...prev, {
      id: Date.now(),
      text: `${type === 'video' ? 'Video' : type === 'voice' ? 'Voice' : 'Screen Share'} Call Started`,
      sender: 'me' as const,
      time: time,
      isSystem: true,
      callType: type,
      callStatus: 'started'
    }] as any);
    globalStartCall(swapper, type);
  };



  useEffect(() => {
    setRequestSent(false);
    // Removed hardcoded mock messages to allow real API data to show
  }, [otherId, swapper?.id]);

  useEffect(() => {
    let timer: any;
    if (isRecordingVoice && !isPausedVoice) {
      timer = setInterval(() => {
        setVoiceDuration(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecordingVoice, isPausedVoice]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start();
      setIsRecordingVoice(true);
      setVoiceDuration(0);
    } catch (err) {
      console.error('Error starting recording:', err);
      showToast('Could not access microphone', 'error');
    }
  };

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="h-screen hero-bg flex items-center justify-center fixed inset-0 z-[60]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mb-6" />
          <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4 animate-bounce shadow-2xl border border-white/10">
            <AvatarIcon name={swapper?.avatar || 'User'} className="w-10 h-10 text-purple-400" />
          </div>
          <h2 className="text-white text-xl font-bold mb-1 tracking-tight">{swapper?.name}</h2>
          <p className="text-gray-500 text-xs font-bold tracking-[0.2em] animate-pulse uppercase">
            Opening Messages...
          </p>
        </div>
      </div>
    );
  }

  if (swappersLoading) {
    return (
      <div className="h-screen hero-bg flex items-center justify-center fixed inset-0 z-[60]">
        <div className="flex flex-col items-center">
          <div className="w-20 h-20 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mb-6" />
        </div>
      </div>
    );
  }

  if (!swapper) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <h2>User not found.</h2>
      </div>
    );
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser.id) return;

    if (isAdminChat) {
      const userEmail = currentUser.email || localStorage.getItem("userEmail") || "";
      if (!userEmail) {
        showToast("Please log in to contact support", "error");
        return;
      }
      try {
        await sendSupportMessage(userEmail, newMessage);
        setNewMessage("");
        // Optimistically reload messages
        setTimeout(loadAdminMessages, 500); 
      } catch (error) {
        console.error('Failed to send support message:', error);
        showToast("Failed to send message", "error");
      }
    } else if (otherId) {
      try {
        await chatService.sendMessage(currentUser.id, otherId, newMessage);
        setNewMessage("");
        fetchMessages();
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    }
  };

  const handleFetchAiSuggestions = async () => {
    if (messages.length === 0 || !swapper || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const last5Messages = messages.slice(-5).map(m => ({
        senderName: m.sender === 'me' ? currentUser.name : swapper.name,
        text: m.text
      }));
      const suggestions = await aiService.getSmartReplies(last5Messages, currentUser.name || "User", swapper.name);
      setAiSuggestions(suggestions);
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
      showToast('Failed to get AI suggestions', 'error');
    } finally {
      setIsAiLoading(false);
    }
  };


  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser.id || !otherId) return;

    try {
      const uploadData = await chatService.uploadFile(file);
      await chatService.sendMessage(currentUser.id, otherId, file.name, 'file', uploadData.fileUrl);
      fetchMessages();
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  const formatVoiceTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const handleSendVoice = () => {
    if (!mediaRecorderRef.current || voiceDuration < 1) return;

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
      const file = new File([audioBlob], `voice-message-${Date.now()}.wav`, { type: 'audio/wav' });

      try {
        const uploadData = await chatService.uploadFile(file);
        if (currentUser.id && otherId) {
          await chatService.sendMessage(currentUser.id, otherId, "Voice message", 'voice', uploadData.fileUrl);
          fetchMessages();
        }
      } catch (error) {
        console.error('Failed to upload voice message:', error);
      }

      setIsRecordingVoice(false);
      setIsPausedVoice(false);
      setVoiceDuration(0);
    };

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
  };

  const handleCancelVoice = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
    setIsRecordingVoice(false);
    setIsPausedVoice(false);
    setVoiceDuration(0);
  };

  return (
    <div className="h-[100dvh] hero-bg flex overflow-hidden fixed inset-0 z-50">

      {/* Sidebar - Chat List */}
      <div className={`w-full md:w-80 border-r border-white/10 bg-black/40 flex flex-col shrink-0 ${showMobileSidebar ? 'flex' : 'hidden md:flex'}`}>
        <div className="h-20 border-b border-white/10 flex items-center px-6 gap-3 shrink-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:bg-white/10 hover:text-white transition-all shadow-lg"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white font-bold text-lg tracking-tight">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="px-4 mb-4 relative">
            <Search className="absolute left-7 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
            />
          </div>

          <div className="space-y-1 px-2">
            {/* Admin Support Thread */}
            <button
              onClick={() => {
                navigate(`/user/messages/admin-support`);
                setShowMobileSidebar(false);
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${otherId === 'admin-support'
                ? 'bg-purple-600/20 border border-purple-500/30'
                : 'hover:bg-white/5 border border-transparent'
                }`}
            >
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 relative overflow-hidden p-2">
                <img src="/logo.png" alt="Admin" className="w-full h-full object-contain" />
                <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black bg-green-500 z-10" />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                  <h3 className="text-white font-bold truncate">SkillBridge Support</h3>
                  <span className="text-[10px] text-purple-400 font-black uppercase">Official</span>
                </div>
                <p className="text-gray-400 text-xs truncate">Ask us anything...</p>
              </div>
            </button>

            {conversations
              .filter(s => s.id !== currentUser.id && s.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    navigate(`/user/messages/${s.id}`);
                    setShowMobileSidebar(false);
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${otherId === s.id
                    ? 'bg-purple-600/20 border border-purple-500/30'
                    : 'hover:bg-white/5 border border-transparent'
                    }`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center shrink-0 relative overflow-hidden">
                    <AvatarIcon name={s.name} url={s.avatarUrl} className="w-full h-full" />
                    <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-black ${onlineUserIds.has(s.id) ? 'bg-green-500' : 'bg-gray-500'} z-10`} />
                  </div>
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex justify-between items-start mb-0.5">
                      <h3 className="text-white font-semibold truncate">{s.name}</h3>
                      <span className={`text-[10px] font-bold uppercase ${onlineUserIds.has(s.id) ? 'text-green-400' : 'text-gray-500'}`}>
                        {onlineUserIds.has(s.id) ? "Online" : (s.lastTimestamp ? new Date(s.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Offline")}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">
                      {s.lastMessage && !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s.lastMessage)
                        ? s.lastMessage 
                        : (s.lastMessage && !s.lastMessage.includes('-') ? s.lastMessage : "No messages yet")}
                    </p>
                  </div>
                </button>
              ))}
            {conversations.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <p className="text-xs text-white">No active chats</p>
                <button
                  onClick={() => navigate('/user/explore')}
                  className="mt-4 text-purple-400 text-[10px] font-bold uppercase tracking-widest hover:text-white"
                >
                  Find Swappers
                </button>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col relative overflow-hidden bg-black/20 ${!showMobileSidebar ? 'flex' : 'hidden md:flex'}`}>

        {/* Chat Header */}
        <div className="h-14 sm:h-20 border-b border-white/10 bg-white/5 flex items-center px-3 sm:px-6 justify-between shrink-0 z-10">
          {otherId && swapper ? (
            <>
              <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="md:hidden p-1.5 -ml-1 text-gray-400 hover:text-white"
                >
                  <ChevronLeft size={20} />
                </button>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  key={swapper.id}
                  className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden"
                >
                  <AvatarIcon name={swapper.name} url={swapper.avatarUrl} className="w-full h-full" />
                </motion.div>
                <div className="min-w-0 max-w-[120px] sm:max-w-none">
                  <h1 className="text-white font-black text-xs sm:text-base truncate leading-tight">{swapper?.name}</h1>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className={`w-1.5 h-1.5 rounded-full ${isAdminChat || swapper?.isOnline ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-gray-500'}`} />
                    <span className="text-[9px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest truncate">
                      {isAdminChat || swapper?.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 sm:gap-3">
                {!isNewMatch && !isAdminChat && (
                  <div className="flex items-center gap-1 sm:gap-3">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => globalStartCall(swapper, 'voice')} className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-all">
                      <Phone className="w-3 h-3 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => globalStartCall(swapper, 'video')} className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-all">
                      <Video className="w-3 h-3 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => globalStartCall(swapper, 'screen')} className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-white/10 flex items-center justify-center text-gray-300 hover:bg-white/10 transition-all hidden xs:flex">
                      <Monitor className="w-3 h-3 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.1, backgroundColor: 'rgba(220, 38, 38, 0.1)' }} 
                      whileTap={{ scale: 0.9 }} 
                      onClick={() => setShowConfirmDelete(true)} 
                      className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl border border-red-500/20 flex items-center justify-center text-red-500 hover:bg-red-500/20 transition-all"
                      title="Clear Conversation"
                    >
                      <Trash2 className="w-3 h-3 sm:w-5 sm:h-5" />
                    </motion.button>
                  </div>
                )}
                {!isAdminChat && (
                  <button
                    onClick={() => navigate(`/profile/${swapper.id}`)}
                    className="px-4 py-2 ml-2 rounded-xl border border-white/10 text-sm font-semibold text-gray-300 hover:bg-white/10 transition-all hidden md:block"
                  >
                    View Profile
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h2 className="text-white font-bold">Messages</h2>
            </div>
          )}
        </div>

        {/* Dynamic Chat Area */}
        {!swapper ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-black/20 text-center">
            <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center mb-6 border border-white/10 shadow-2xl">
              <MessageSquare className="w-10 h-10 text-purple-400 opacity-50" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
            <p className="text-gray-400 max-w-xs text-sm">Select a conversation from the sidebar to start swapping skills!</p>
          </div>
        ) : isNewMatch && !localStorage.getItem(`request_${swapper?.id}`) ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-black/20">
            <div className="max-w-md w-full text-center fade-in-1">
              <div className="w-24 h-24 mx-auto bg-white/5 rounded-3xl flex items-center justify-center mb-6 shadow-xl border border-white/10 overflow-hidden">
                <AvatarIcon name={swapper?.name || ""} url={swapper?.avatarUrl} className="w-full h-full" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Connect with {swapper?.name.split(' ')[0]}</h2>
              <p className="text-gray-400 mb-8 text-sm">
                Propose a skill swap! You can teach them <span className="text-purple-400">{swapper?.seeks[0]}</span> in exchange for <span className="text-blue-400">{swapper?.offers[0]}</span>.
              </p>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 mb-4 h-32"
                placeholder={`Hi ${swapper.name.split(' ')[0]}, I'd love to swap skills with you...`}
              />
              <button
                onClick={() => {
                  localStorage.setItem(`request_${swapper.id}`, 'true');
                  navigate(0);
                }}
                className="w-full gradient-btn py-3.5 rounded-xl text-white font-bold shadow-lg"
              >
                Send Swap Request
              </button>
            </div>
          </div>
        ) : isNewMatch && localStorage.getItem(`request_${swapper.id}`) ? (
          <div className="flex-1 flex items-center justify-center p-6 bg-black/20">
            <div className="text-center fade-in-1">
              <div className="text-5xl mb-4">✅</div>
              <h2 className="text-xl font-bold text-white mb-2">Request Sent!</h2>
              <p className="text-gray-400 text-sm">Waiting for {swapper.name.split(' ')[0]} to accept your swap proposal.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="text-center text-xs text-gray-500 mb-8">
                You matched with {swapper.name} based on mutual skills
              </div>

              {messages.map((msg: any) => (
                <div key={msg.id} className={`flex flex-col ${msg.sender === 'me' && !msg.isSystem ? 'items-end' : 'items-start'} ${msg.isSystem ? 'items-center py-4' : ''}`}>
                  {msg.isSystem ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-[#12121a]/60 backdrop-blur-xl border border-white/5 rounded-3xl p-4 flex items-center gap-5 max-w-sm w-full shadow-2xl shadow-black/40 group"
                    >
                      <div className="relative">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 duration-500 ${
                          msg.callStatus === 'missed' 
                            ? 'bg-gradient-to-br from-red-500/20 to-red-600/10 text-red-500 border border-red-500/20 shadow-red-500/20' 
                            : msg.callStatus === 'started'
                            ? 'bg-gradient-to-br from-purple-500/20 to-purple-600/10 text-purple-500 border border-purple-500/20 shadow-purple-500/20'
                            : 'bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 text-emerald-500 border border-emerald-500/20 shadow-emerald-500/20'
                        }`}>
                          {msg.callType === 'video' ? <Video size={24} /> : msg.callType === 'voice' ? <Phone size={24} /> : <Monitor size={24} />}
                        </div>
                        <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-lg flex items-center justify-center border-2 border-[#12121a] shadow-lg ${
                          msg.callStatus === 'missed' ? 'bg-red-500' : msg.callStatus === 'started' ? 'bg-purple-500' : 'bg-emerald-500'
                        }`}>
                          {msg.callStatus === 'missed' ? <PhoneOff size={10} className="text-white" /> : msg.callStatus === 'started' ? <div className="w-1 h-1 bg-white rounded-full animate-ping" /> : <Check size={10} className="text-white" />}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <h4 className={`font-black text-sm tracking-tight ${msg.callStatus === 'missed' ? 'text-red-400' : 'text-white'}`}>
                              {msg.text}
                            </h4>
                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-[0.1em] mt-0.5">
                              {msg.callStatus === 'missed' ? 'No Answer' : msg.callStatus === 'started' ? 'Connecting...' : `Duration: ${msg.duration || '00:00'}`}
                            </p>
                          </div>
                          <span className="text-[10px] text-gray-600 font-mono">{msg.time}</span>
                        </div>
                        
                        {msg.needsRating && (
                          <motion.button
                            whileHover={{ scale: 1.02, backgroundColor: 'rgba(147, 51, 234, 1)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowRatingModal(true)}
                            className="mt-3 w-full py-2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-purple-600/20"
                          >
                            Rate Session
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  ) : msg.isFile ? (
                    <div className={`flex items-end gap-2 max-w-[80%]`}>
                      {msg.sender === 'them' && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mb-5 overflow-hidden border border-white/10">
                          <AvatarIcon name={swapper.name} url={swapper.avatarUrl} className="w-full h-full" />
                        </div>
                      )}
                      <div className="relative group">
                        <SecureFileDownload
                          url={msg.fileUrl}
                          fileName={msg.text}
                          className={msg.sender === 'me' ? 'border-purple-500/30 bg-purple-600/10' : ''}
                        />
                        {msg.sender === 'me' && (
                          <div className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                              className="p-1 text-gray-500 hover:text-white"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {activeMenuId === msg.id && (
                              <div className="absolute bottom-full mb-2 left-0 bg-[#1a1a24] border border-white/10 rounded-xl py-2 shadow-2xl z-50 min-w-[100px] overflow-hidden">
                                <button 
                                  onClick={() => handleUnsend(msg.id)}
                                  className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <Trash2 size={12} /> Unsend
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : msg.isVoice ? (
                    <div className={`flex items-end gap-2 max-w-[80%]`}>
                      {msg.sender === 'them' && (
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mb-5 overflow-hidden border border-white/10">
                          <AvatarIcon name={swapper.name} url={swapper.avatarUrl} className="w-full h-full" />
                        </div>
                      )}
                      <div className="relative group">
                        <SecureAudio
                          url={msg.fileUrl}
                          className={msg.sender === 'me' ? 'border-purple-500/30 bg-purple-600/10' : ''}
                        />
                        {msg.sender === 'me' && (
                          <div className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                            <button 
                              onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                              className="p-1 text-gray-500 hover:text-white"
                            >
                              <MoreVertical size={16} />
                            </button>
                            {activeMenuId === msg.id && (
                              <div className="absolute bottom-full mb-2 left-0 bg-[#1a1a24] border border-white/10 rounded-xl py-2 shadow-2xl z-50 min-w-[100px] overflow-hidden">
                                <button 
                                  onClick={() => handleUnsend(msg.id)}
                                  className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                >
                                  <Trash2 size={12} /> Unsend
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-end gap-2 max-w-[90%] sm:max-w-[80%]">
                        {msg.sender === 'them' && (
                          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 mb-5 overflow-hidden border border-white/10 hidden sm:flex">
                            <AvatarIcon name={swapper.name} url={swapper.avatarUrl} className="w-full h-full" />
                          </div>
                        )}
                        <div className={`group relative p-4 rounded-2xl text-sm ${msg.sender === 'me'
                          ? 'bg-purple-600 text-white rounded-br-sm'
                          : 'bg-white/10 text-gray-200 border border-white/5 rounded-bl-sm'
                          }`}>
                          {editingMessageId === msg.id ? (
                            <div className="flex flex-col gap-2 min-w-[200px]">
                              <textarea 
                                value={editValue} 
                                onChange={(e) => setEditValue(e.target.value)}
                                className="bg-black/20 border border-white/10 rounded-lg p-2 text-white text-sm focus:outline-none w-full"
                                rows={2}
                                autoFocus
                              />
                              <div className="flex justify-end gap-2">
                                <button onClick={() => setEditingMessageId(null)} className="p-1 text-gray-300 hover:text-white" title="Cancel"><X size={16}/></button>
                                <button onClick={() => handleEdit(msg.id)} className="p-1 text-emerald-400 hover:text-emerald-300" title="Save"><Check size={16}/></button>
                              </div>
                            </div>
                          ) : (
                            <>
                              {msg.text}
                              {msg.isEdited && <span className="text-[10px] opacity-50 ml-2">(edited)</span>}
                              {(msg.sender === 'me' || (isAdminChat && msg.id.toString().startsWith('ai_'))) && (
                                <div className="absolute top-1/2 -translate-y-1/2 -left-8 opacity-0 group-hover:opacity-100 transition-opacity flex items-center">
                                  <button 
                                    onClick={() => setActiveMenuId(activeMenuId === msg.id ? null : msg.id)}
                                    className="p-1 text-gray-500 hover:text-white"
                                  >
                                    <MoreVertical size={16} />
                                  </button>
                                  {activeMenuId === msg.id && (
                                    <div className="absolute bottom-full mb-2 left-0 bg-[#1a1a24] border border-white/10 rounded-xl py-2 shadow-2xl z-50 min-w-[100px] overflow-hidden">
                                      {msg.sender === 'me' && (
                                        <button 
                                          onClick={() => {
                                            setEditingMessageId(msg.id);
                                            setEditValue(msg.text);
                                            setActiveMenuId(null);
                                          }}
                                          className="w-full px-4 py-2 text-left text-xs text-gray-300 hover:bg-white/5 flex items-center gap-2"
                                        >
                                          <Edit2 size={12} /> Edit
                                        </button>
                                      )}
                                      <button 
                                        onClick={() => handleUnsend(msg.id)}
                                        className="w-full px-4 py-2 text-left text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                                      >
                                        <Trash2 size={12} /> {isAdminChat && msg.id.toString().startsWith('ai_') ? 'Delete AI Reply' : 'Unsend'}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <span className={`text-[10px] text-gray-500 mt-1 ${msg.sender === 'me' ? 'mr-2' : 'ml-2 sm:ml-11'}`}>
                        {msg.time}
                      </span>
                    </>
                  )}
                </div>
              ))}
              <div ref={endOfMessagesRef} />
            </div>

            {/* AI Suggestions Row */}
            <AnimatePresence>
              {aiSuggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="px-4 py-2 flex flex-wrap gap-2 bg-purple-600/5 border-t border-purple-500/10"
                >
                  {aiSuggestions.map((suggestion, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setNewMessage(suggestion);
                        setAiSuggestions([]);
                      }}
                      className="text-[10px] sm:text-xs bg-white/5 border border-white/10 hover:border-purple-500/50 hover:bg-purple-600/10 text-gray-300 hover:text-white px-3 py-1.5 rounded-full transition-all"
                    >
                      {suggestion}
                    </motion.button>
                  ))}
                  <button 
                    onClick={() => setAiSuggestions([])}
                    className="p-1.5 text-gray-500 hover:text-white ml-auto"
                  >
                    <X size={12} />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-3 sm:p-4 border-t border-white/10 bg-black/40 shrink-0">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <form onSubmit={handleSend} className="flex items-center gap-2 sm:gap-3 relative">
                {isRecordingVoice ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 bg-purple-600/10 border border-purple-500/30 rounded-xl px-4 py-2 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full bg-red-500 ${!isPausedVoice ? 'animate-pulse' : 'opacity-50'}`} />
                      <span className="text-white font-mono text-sm">{formatVoiceTime(voiceDuration)}</span>
                      <span className="text-gray-400 text-xs">{isPausedVoice ? 'Recording paused' : 'Recording...'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setIsPausedVoice(!isPausedVoice)}
                        className="p-2 text-purple-400 hover:text-purple-300 transition-colors"
                      >
                        {isPausedVoice ? <Mic className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelVoice}
                        className="p-2 text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={handleSendVoice}
                        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg"
                      >
                        <Check className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl hover:bg-white/10 flex items-center justify-center text-gray-400"
                    >
                      <Paperclip className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={handleFetchAiSuggestions}
                      disabled={isAiLoading || messages.length === 0}
                      className={`w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl flex items-center justify-center transition-all ${
                        isAiLoading ? 'animate-pulse text-purple-500' : 'text-purple-400 hover:bg-purple-500/10'
                      }`}
                      title="AI Smart Replies"
                    >
                      {isAiLoading ? <RefreshCw className="w-3.5 h-3.5 sm:w-5 h-5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 sm:w-5 h-5" />}
                    </motion.button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="flex-1 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 text-sm text-white focus:outline-none focus:border-purple-500/50 transition-all"
                    />
                    {newMessage.trim() ? (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="gradient-btn px-3 sm:px-6 py-2 sm:py-3 rounded-lg sm:rounded-xl text-white font-semibold shadow-lg transition-all flex items-center gap-2"
                      >
                        <span className="hidden sm:inline">Send</span>
                        <Send className="w-4 h-4" />
                      </motion.button>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        type="button"
                        onClick={startRecording}
                        className="w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-purple-400 hover:bg-white/10 transition-all"
                      >
                        <Mic className="w-3.5 h-3.5 sm:w-5 h-5" />
                      </motion.button>
                    )}
                  </>
                )}
              </form>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {showRatingModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <div className="relative">
              <button
                onClick={() => setShowRatingModal(false)}
                className="absolute -top-12 right-0 text-white/50 hover:text-white"
              >
                Skip for now
              </button>
              <StarRating />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setShowConfirmDelete(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#13131d] border border-white/10 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            >
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
                <Trash2 className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="text-white font-bold text-lg mb-1">Delete Conversation?</h3>
              <p className="text-gray-400 text-sm mb-6">All messages with {swapper?.name?.split(' ')[0]} will be permanently deleted. This cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-gray-300 text-sm font-semibold hover:bg-white/5 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearChat}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-500 transition-all shadow-lg shadow-red-600/20"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
