import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getAuthState } from '../../lib/auth';
import { HelpCenter } from './HelpCenter';
import { useSwappers } from '../../hooks/useSwappers';
import { userService } from '../../services/userService';
import { chatService } from '../../services/chatService';
import { socketService } from '../../services/socketService';
import { SecureImage } from '../common/SecureImage';
import { useToast } from '../../context/ToastContext';

export function Dashboard() {
  const { auth: currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { role } = currentUser;
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { swappers, loading } = useSwappers();
  const { showToast } = useToast();

  const [userData, setUserData] = useState<any>(null);
  const [userStats, setUserStats] = useState({ swaps: 0, rating: 0 });
  const [recentChats, setRecentChats] = useState<any[]>([]);
  const [incomingRequests, setIncomingRequests] = useState<any[]>([]);
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  const [sentDiscoveryRequests, setSentDiscoveryRequests] = useState<Record<string, boolean>>({});
  const [connectLoading, setConnectLoading] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentUser.id) {
      socketService.connect(currentUser.id);

      socketService.on('user_online', (userId: string) => {
        setOnlineUserIds(prev => new Set(prev).add(userId));
      });

      socketService.on('user_offline', (userId: string) => {
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      });

      socketService.on('get_online_users', (userIds: string[]) => {
        setOnlineUserIds(new Set(userIds));
      });
    }

    return () => {
      socketService.off('user_online');
      socketService.off('user_offline');
      socketService.off('get_online_users');
    };
  }, [currentUser.id]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser.id) return;
      try {
        // Fetch profile
        const profile = await userService.getProfile(currentUser.id);
        setUserData(profile);

        // Fetch stats
        const stats = await userService.getStats(currentUser.id);
        setUserStats(stats);

        // Fetch real incoming requests from backend
        const incoming = await userService.getIncomingRequests(currentUser.id);
        setIncomingRequests(incoming);

        // Fetch real sent requests from backend
        const sent = await userService.getSentRequests(currentUser.id);
        setSentRequests(sent);

        // Sync accepted status with localStorage for UI consistency across profile pages
        sent.forEach((r: any) => {
          if (r.status?.toLowerCase() === 'accepted') {
            localStorage.setItem(`accepted_${r.receiver_id}`, 'true');
          }
        });
        incoming.forEach((r: any) => {
          // Incoming requests shown in dashboard are pending, but if we have them, we can ensure request state
          localStorage.setItem(`request_${r.sender_id}`, 'true');
        });

        // Fetch conversations (already mapped to profiles and last messages by backend)
        const convos = await chatService.getConversations(currentUser.id);
        const chats = convos.map((partner: any) => {
          const isOnline = onlineUserIds.has(partner.id);
          const timeDisplay = isOnline ? "Online" : (partner.lastTimestamp ? new Date(partner.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Offline");
          
          return {
            id: partner.id,
            name: partner.name || "User",
            msg: partner.lastMessage || "No messages yet",
            time: timeDisplay,
            status: isOnline ? "online" : "offline",
            avatar: partner.name?.charAt(0) || "👤",
            avatarUrl: partner.avatar_url
          };
        });
        setRecentChats(chats);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchUserData();
  }, [currentUser.id, swappers, onlineUserIds]);

  // Admin should NEVER see the user dashboard — redirect to admin panel
  if (role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleAccept = async (request: any) => {
    try {
      await userService.acceptSwapRequest(request.id);
      
      // Set accepted state in localStorage for UI persistence
      localStorage.setItem(`accepted_${request.sender_id || request.id}`, 'true');
      
      // Update UI
      setIncomingRequests(prev => prev.filter(r => r.id !== request.id));
      setRecentChats(prev => [
        {
          id: request.sender_id || request.id,
          name: request.name,
          msg: "You accepted the request. Start swapping!",
          time: "Just now",
          status: "online",
          avatar: request.avatar,
          avatarUrl: request.avatarUrl
        },
        ...prev
      ]);
      
      showToast('Swap request accepted!', 'success');
      
      setTimeout(() => {
        navigate(`/user/messages/${request.sender_id || request.id}?accepted=true`);
      }, 1000);
    } catch (error) {
      console.error('Failed to accept request:', error);
      showToast('Failed to accept request. Please try again.', 'error');
    }
  };

  const userName = userData?.name || currentUser.name || currentUser.email || "User";
  const userEmail = userData?.email || currentUser.email || "";

  return (
    <div className="min-h-screen hero-bg grid-overlay text-white">
      {/* Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#0F0A25] flex flex-col items-center justify-center backdrop-blur-md"
          >
            <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-6"></div>
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-2xl font-black gradient-text uppercase tracking-widest"
            >
              Going to Message
            </motion.h2>
            <p className="text-gray-500 text-xs mt-2 uppercase tracking-widest font-bold">Please wait...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Floating Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] sm:hidden"
            />
            <div className="fixed top-[68px] right-4 z-[70] flex flex-col gap-2.5 sm:hidden">
              {[
                { label: 'Explore',  icon: '🔍', action: () => { setMobileMenuOpen(false); navigate('/user/explore'); }, color: 'border-purple-500/40 bg-purple-950/80 text-purple-200 hover:bg-purple-800/80' },
                { label: 'Messages', icon: '💬', action: () => { setMobileMenuOpen(false); setIsTransitioning(true); setTimeout(() => navigate('/user/messages'), 1200); }, color: 'border-blue-500/40 bg-blue-950/80 text-blue-200 hover:bg-blue-800/80' },
                { label: 'Logout',   icon: '🚪', action: () => { setMobileMenuOpen(false); handleLogout(); }, color: 'border-red-500/40 bg-red-950/80 text-red-300 hover:bg-red-800/80' },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: -10, x: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, x: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, x: 16, scale: 0.88 }}
                  transition={{ delay: i * 0.06, type: 'spring', damping: 22, stiffness: 320, mass: 0.7 }}
                  onClick={item.action}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-semibold backdrop-blur-xl transition-all duration-200 shadow-xl active:scale-95 hover:scale-105 ${item.color}`}
                  style={{ minWidth: '152px' }}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Dashboard Navbar */}
      <nav className="navbar h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        {/* Desktop: Logo left */}
        <div className="hidden sm:flex items-center cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="SkillBridge Logo" className="h-12 w-auto object-contain logo-blend" />
        </div>

        {/* Mobile: Logo + Name centered */}
        <div className="flex sm:hidden absolute left-1/2 -translate-x-1/2 items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <img src="/logo.png" alt="SkillBridge Logo" className="h-9 w-auto object-contain logo-blend" />
          <span className="text-white font-black text-sm tracking-wide">SkillBridge</span>
        </div>

        {/* Desktop: Nav buttons */}
        <div className="hidden sm:flex items-center space-x-3">
          <button onClick={() => navigate('/user/explore')} className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Explore</button>
          <button onClick={() => navigate('/user/messages')} className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Messages</button>
          <button onClick={handleLogout} className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Logout</button>
        </div>

        {/* Mobile: Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="sm:hidden ml-auto flex flex-col gap-1.5 p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
        >
          <span className="block w-5 h-0.5 bg-white rounded"></span>
          <span className="block w-5 h-0.5 bg-white rounded"></span>
          <span className="block w-5 h-0.5 bg-white rounded"></span>
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="login-card rounded-3xl p-6 sm:p-8 mb-12 fade-in-1">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
            <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center text-4xl shadow-lg shrink-0 overflow-hidden border border-white/10">
              {userData?.avatar_url ? (
                <SecureImage 
                  url={userData.avatar_url} 
                  alt={userName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center">
                  {userName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="flex-1 w-full">
              <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-black mb-1">Welcome back, <span className="gradient-text">{userName}</span>!</h1>
                  <p className="text-gray-400 text-sm sm:text-base">Manage your skills and sessions from your dashboard.</p>
                </div>
                <button
                  onClick={() => navigate('/my-profile')}
                  className="w-full sm:w-auto px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all uppercase tracking-widest"
                >
                  Edit Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-8">

            {/* Incoming Swap Requests Section */}
            <div className="stat-card p-6 sm:p-8 fade-in-2">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                Incoming Requests <span className="w-5 h-5 bg-purple-500 text-[10px] flex items-center justify-center rounded-full">{incomingRequests.length}</span>
              </h2>
              <div className="space-y-4">
                {incomingRequests.length > 0 ? incomingRequests.map((request) => (
                  <div key={request.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 glass rounded-2xl border border-white/10 hover:border-purple-500/20 transition-all gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl shadow-inner overflow-hidden border border-white/5">
                        <SecureImage 
                          url={request.avatarUrl || request.avatar} 
                          alt={request.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-white font-bold">{request.name}</div>
                          <div className="flex items-center gap-1.5 text-[10px] text-yellow-400 bg-yellow-400/5 px-2 py-0.5 rounded border border-yellow-400/10 font-bold">
                            <span className="text-xs">★</span> {request.rating}
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-0.5">Wants to learn <span className="text-purple-400 font-semibold">{request.skill}</span></p>
                        <p className="text-xs text-gray-400">Offers <span className="text-blue-400 font-semibold">{request.offer}</span></p>
                      </div>
                    </div>
                    <div className="flex gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => navigate(`/profile/${request.sender_id || request.id}`)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-bold rounded-xl border border-white/10 transition-all"
                      >
                        View
                      </button>
                      <button
                        onClick={() => handleAccept(request)}
                        className="flex-1 sm:flex-none px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition-all shadow-lg"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-500 text-center py-4 italic">No incoming requests</p>
                )}
              </div>
            </div>

            {/* Sent Requests Section */}
            <div className="stat-card p-6 sm:p-8 fade-in-2.5">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                My Sent Requests <span className="w-5 h-5 bg-blue-500 text-[10px] flex items-center justify-center rounded-full">{sentRequests.length}</span>
              </h2>
              <div className="space-y-4">
                {sentRequests.length > 0 ? sentRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-center sm:justify-between p-4 glass rounded-2xl border border-white/10 opacity-80 hover:opacity-100 transition-all flex-wrap gap-4">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-xl overflow-hidden shadow-inner">
                        <SecureImage 
                          url={req.avatarUrl || req.avatar} 
                          alt={req.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{req.name}</div>
                        <div className="text-[10px] text-gray-400">Requested to learn: <span className="text-purple-400 font-medium">{req.skill}</span></div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => navigate(`/profile/${req.receiver_id || req.id}`)}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-tighter transition-all"
                      >
                        View Profile
                      </button>
                      <span className="text-[10px] px-2.5 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 uppercase tracking-widest font-bold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                        {req.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8 bg-white/5 rounded-2xl border border-dashed border-white/10">
                    <p className="text-gray-500 text-sm italic">You haven't sent any swap requests yet.</p>
                    <button
                      onClick={() => navigate('/explore')}
                      className="mt-4 px-6 py-2 bg-purple-600/20 text-purple-400 text-xs font-bold rounded-xl border border-purple-500/30 hover:bg-purple-600/30 transition-all"
                    >
                      Browse Skills
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Matches Section */}
            <div className="stat-card p-6 sm:p-8 fade-in-3">
              <h2 className="text-xl font-bold mb-6">Discovery Matches</h2>
              <div className="space-y-4">
                {loading ? <p className="text-gray-500">Loading matches...</p> : swappers.slice(0, 2).map((match) => (
                  <div key={match.id} className="flex flex-col sm:flex-row items-center sm:items-center justify-between p-5 glass rounded-2xl border border-white/10 hover:bg-white/5 transition-all gap-4">
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl overflow-hidden shrink-0 border border-white/5">
                        <SecureImage 
                          url={match.avatarUrl || match.avatar} 
                          alt={match.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-bold">{match.name}</div>
                        <div className="text-xs text-gray-400">Wants to learn: <span className="text-purple-400 font-semibold">{match.seeks[0]}</span></div>
                      </div>
                      {/* Show match % next to name on mobile if needed, or keep at bottom */}
                      <div className="sm:hidden text-sm font-bold text-green-400">{match.match}%</div>
                    </div>
                    
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                      <div className="hidden sm:block text-sm font-bold text-green-400">{match.match}% Match</div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => navigate(`/profile/${match.id}`)}
                          className="text-xs text-gray-400 hover:text-white transition-colors font-bold uppercase tracking-widest"
                        >
                          Profile
                        </button>
                        {localStorage.getItem(`request_${match.id}`) || sentDiscoveryRequests[match.id] ? (
                          <span className="text-[10px] px-3 py-1.5 bg-green-500/10 text-green-400 border border-green-500/20 rounded-lg font-bold">
                            Sent ✓
                          </span>
                        ) : (
                          <button
                            onClick={async () => {
                              if (!currentUser.id) return;
                                setConnectLoading(match.id);
                                try {
                                  const skillToLearn = match.offers[0] || 'skills';
                                  await userService.sendSwapRequest(currentUser.id, match.id, skillToLearn);
                                  setSentDiscoveryRequests(prev => ({ ...prev, [match.id]: true }));
                                  localStorage.setItem(`request_${match.id}`, 'true');
                                  showToast('Swap request sent!', 'success');
                                } catch (err) {
                                  console.error('Failed to connect:', err);
                                  showToast('Failed to send request.', 'error');
                                } finally {
                                setConnectLoading(null);
                              }
                            }}
                            disabled={connectLoading === match.id}
                            className="text-[10px] text-purple-400 hover:text-purple-300 font-black uppercase tracking-widest bg-purple-500/5 px-4 py-1.5 rounded-lg border border-purple-500/10 hover:bg-purple-500/10 transition-all disabled:opacity-50"
                          >
                            {connectLoading === match.id ? "..." : "Connect"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Sidebar */}
          <div className="space-y-8 h-fit sticky top-24 fade-in-4">

            {/* Recent Chats Section */}
            <div className="stat-card p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Chats</h2>
                <span className="text-[10px] text-gray-500 font-black uppercase tracking-widest bg-white/5 px-2 py-1 rounded border border-white/5">
                  {recentChats.length}
                </span>
              </div>

              {/* Sidebar Search Filter */}
              <div className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search chats..."
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30 text-[10px]">🔍</span>
              </div>

              <div className="space-y-4">
                {recentChats
                  .filter(chat =>
                    chat.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                    chat.msg.toLowerCase().includes(chatSearchQuery.toLowerCase())
                  )
                  .map((chat) => (
                    <div
                      key={chat.id}
                      onClick={() => navigate(`/user/messages/${chat.id}`)}
                      className="flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl transition-all cursor-pointer border border-transparent hover:border-white/5"
                    >
                      <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden shadow-lg">
                          <SecureImage 
                            url={chat.avatarUrl || chat.avatar} 
                            alt={chat.name} 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#120B2E] ${chat.status === 'online' ? 'bg-green-500' : 'bg-gray-500'}`} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="text-sm font-bold text-white truncate">{chat.name}</span>
                          <span className={`text-[10px] font-black uppercase tracking-tighter ${chat.status === 'online' ? 'text-green-400' : 'text-gray-500'}`}>
                            {chat.time}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400 truncate">{chat.msg}</p>
                      </div>
                    </div>
                  ))}
                {recentChats.filter(chat =>
                  chat.name.toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
                  chat.msg.toLowerCase().includes(chatSearchQuery.toLowerCase())
                ).length === 0 && (
                    <div className="text-center py-6">
                      <p className="text-gray-500 text-xs italic">No chats found</p>
                    </div>
                  )}
              </div>
              <button
                onClick={() => {
                  setIsTransitioning(true);
                  setTimeout(() => {
                    navigate('/user/messages');
                  }, 1200);
                }}
                className="w-full mt-6 py-3.5 rounded-xl border border-white/10 bg-white/5 text-[10px] font-black text-gray-400 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all uppercase tracking-widest shadow-lg flex items-center justify-center gap-2"
              >
                View All Messages
              </button>
            </div>

            {/* Stats Summary */}
            <div className="stat-card p-6 bg-gradient-to-br from-purple-600/10 to-blue-600/10">
              <h3 className="text-sm font-bold text-gray-300 mb-4 uppercase tracking-widest">Skill Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="text-xl font-black text-white">{userStats.swaps}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Swaps</div>
                </div>
                <div className="p-3 bg-white/5 rounded-xl border border-white/10 text-center">
                  <div className="text-xl font-black text-white">{userStats.rating.toFixed(1)}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Rating</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </main>
      <HelpCenter userEmail={userEmail} />
    </div>
  );
}
