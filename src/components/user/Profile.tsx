import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShieldBan, Trash2, User, Star, CheckCircle2, Send, GraduationCap, Search, MessageCircle, AlertTriangle, X, Check, RotateCcw } from 'lucide-react';
import { Swapper } from '../../types';
import { getAuthState } from '../../lib/auth';
import { useSwappers } from '../../hooks/useSwappers';
import { socketService } from '../../services/socketService';
import { useAuth } from '../../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

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

export function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = getAuthState();
  const { swappers, loading, updateSwapperStatus } = useSwappers();

  // Find swapper from fetched array
  const fetchedSwapper = swappers.find(s => s.id === id);
  // Keep local state for immediate UI updates
  const [localSwapper, setLocalSwapper] = useState<Swapper | undefined>(undefined);

  // Sync local state when fetched swapper changes
  React.useEffect(() => {
    if (fetchedSwapper) {
      setLocalSwapper(fetchedSwapper);
    }
  }, [fetchedSwapper]);

  const swapper = localSwapper || fetchedSwapper;
  const [isRequestSent, setIsRequestSent] = useState(!!localStorage.getItem(`request_${id}`));
  const isAccepted = !!localStorage.getItem(`accepted_${id}`);

  const { auth: currentUser } = useAuth();
  const [isPartnerOnline, setIsPartnerOnline] = useState(false);

  useEffect(() => {
    if (currentUser.id && id) {
      socketService.connect(currentUser.id);

      const handleOnline = (userId: string) => {
        if (userId === id) setIsPartnerOnline(true);
      };

      const handleOffline = (userId: string) => {
        if (userId === id) setIsPartnerOnline(false);
      };

      const handleInitialOnline = (userIds: string[]) => {
        if (userIds.includes(id)) setIsPartnerOnline(true);
      };

      socketService.on('user_online', handleOnline);
      socketService.on('user_offline', handleOffline);
      socketService.on('get_online_users', handleInitialOnline);

      return () => {
        socketService.off('user_online');
        socketService.off('user_offline');
        socketService.off('get_online_users');
      };
    }
  }, [currentUser.id, id]);

  // Report State
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportDetails, setReportDetails] = useState("");
  const [isReportSubmitted, setIsReportSubmitted] = useState(false);

  // Admin Action State
  const [isAdminActionModalOpen, setIsAdminActionModalOpen] = useState(false);
  const [adminActionType, setAdminActionType] = useState<'suspend' | 'delete' | 'restore'>('suspend');

  const reportReasons = [
    "Inappropriate Content",
    "Spam or Fraud",
    "Harassment or Abuse",
    "Fake Profile",
    "Other"
  ];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-white">Loading profile...</div>;
  }

  if (!swapper) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h2 className="text-2xl font-bold mb-2">User not found</h2>
          <button onClick={() => navigate('/dashboard')} className="text-purple-400 hover:underline">Return to Dashboard</button>
        </div>
      </div>
    );
  }

  const handleReport = () => {
    if (!reportReason) return;
    setIsReportSubmitted(true);
    setTimeout(() => {
      setIsReportModalOpen(false);
      setIsReportSubmitted(false);
      setReportReason("");
      setReportDetails("");
    }, 2000);
  };

  const handleAdminAction = async () => {
    let newStatus: 'active' | 'suspended' | 'deleted' = 'active';
    if (adminActionType === 'suspend') newStatus = 'suspended';
    else if (adminActionType === 'delete') newStatus = 'deleted';
    else if (adminActionType === 'restore') newStatus = 'active';

    if (id) {
      await updateSwapperStatus(id, newStatus);
      setLocalSwapper(prev => prev ? { ...prev, status: newStatus } : prev);
    }

    setIsAdminActionModalOpen(false);

    if (newStatus === 'deleted') {
      setTimeout(() => navigate('/admin/users'), 1500);
    }
  };

  return (
    <div className="min-h-screen hero-bg grid-overlay text-white pb-12">
      {/* Dashboard Navbar */}
      <nav className="navbar h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img
            src="/logo.png"
            alt="SkillBridge Logo"
            className="h-12 w-auto object-contain logo-blend"
          />
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate('/explore')}
            className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            Explore
          </button>
          <button
            onClick={() => navigate('/messages')}
            className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all"
          >
            Messages
          </button>
        </div>
      </nav>

      {/* Profile Banner */}
      <div className={`h-64 w-full relative overflow-hidden transition-all duration-700 ${swapper.status === 'suspended' ? 'bg-orange-900/60' :
          swapper.status === 'deleted' ? 'bg-red-900/60' :
            'bg-gradient-to-r from-purple-900/60 to-blue-900/60'
        }`}>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
        {swapper.status !== 'active' && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={`px-8 py-3 rounded-2xl font-black text-2xl uppercase tracking-[0.3em] backdrop-blur-md border animate-pulse ${swapper.status === 'suspended' ? 'bg-orange-500/20 border-orange-500/40 text-orange-400' : 'bg-red-500/20 border-red-500/40 text-red-400'
              }`}>
              Account {swapper.status}
            </div>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-6 relative -mt-20">

        {/* Profile Card Header */}
        <div className={`stat-card p-8 border shadow-2xl flex flex-col md:flex-row gap-8 items-start fade-in-1 transition-all ${swapper.status === 'suspended' ? 'border-orange-500/30' :
            swapper.status === 'deleted' ? 'border-red-500/30 opacity-50' :
              'border-white/10'
          }`}>
          <div className="relative group">
            <div className={`w-32 h-32 rounded-3xl bg-white/5 flex items-center justify-center text-6xl shadow-xl border-4 shrink-0 overflow-hidden relative transition-all ${swapper.status === 'suspended' ? 'border-orange-500/50' :
                swapper.status === 'deleted' ? 'border-red-500/50' :
                  'border-[#120B2E]'
              }`}>
              {swapper.avatarUrl ? (
                <img src={swapper.avatarUrl} alt="Avatar" className={`w-full h-full object-cover ${swapper.status !== 'active' ? 'grayscale' : ''}`} />
              ) : (
                <div className={`flex items-center justify-center w-full h-full bg-purple-600/10 text-purple-400`}>
                  <User className="w-16 h-16" />
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 mt-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl font-black text-white">{swapper.name}</h1>
                  {swapper.status !== 'active' && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${swapper.status === 'suspended' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                      {swapper.status}
                    </span>
                  )}
                </div>
                <p className="text-gray-400 font-medium mt-1">Skill Swapper & Enthusiast</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="flex items-center gap-1.5 text-yellow-400 bg-yellow-400/5 px-3 py-1 rounded-lg text-sm font-bold border border-yellow-400/10">
                    <Star className="w-3.5 h-3.5 fill-yellow-400" /> {swapper.rating}
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-lg border border-white/10 bg-white/5 text-sm font-bold">
                    <span className={`w-2 h-2 rounded-full ${isPartnerOnline ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse' : 'bg-gray-500'}`}></span>
                    <span className={isPartnerOnline ? 'text-green-400' : 'text-gray-400'}>
                      {isPartnerOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <div className="text-sm font-black text-green-400 bg-green-400/5 px-3 py-1 rounded-lg border border-green-400/10">
                    {swapper.match}% Match
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  {role !== 'admin' && swapper.status === 'active' && (
                    <>
                      {isAccepted ? (
                        <button
                          onClick={() => navigate(`/user/messages/${swapper.id}`)}
                          className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <MessageCircle className="w-5 h-5" /> Message
                        </button>
                      ) : isRequestSent ? (
                        <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-8 py-3 flex items-center justify-center gap-2 text-green-400 font-bold">
                          <CheckCircle2 className="w-5 h-5" />
                          <span>Swap Request Sent</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            localStorage.setItem(`request_${swapper.id}`, 'true');
                            setIsRequestSent(true);
                          }}
                          className="gradient-btn px-8 py-3 rounded-xl text-white font-bold shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
                        >
                          <Send className="w-4 h-4" /> Send Swap Request
                        </button>
                      )}
                    </>
                  )}
                  {role !== 'admin' && (
                    <button
                      onClick={() => setIsReportModalOpen(true)}
                      className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all font-bold flex items-center justify-center gap-2"
                      title="Report User"
                    >
                      <AlertTriangle size={18} /> Report
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {/* Skills Offered */}
          <div className="stat-card p-8 border border-white/10 fade-in-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/20">
                <GraduationCap className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Skills I Can Teach</h2>
            </div>
            <div className="space-y-4">
              {swapper.offers.map((skill: string, i: number) => (
                <div key={i} className="glass p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all flex items-center justify-between">
                  <span className="font-semibold text-white">{skill}</span>
                  <span className="text-xs text-purple-400 font-medium px-2 py-1 bg-purple-500/10 rounded-full">Expert</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills Sought */}
          <div className="stat-card p-8 border border-white/10 fade-in-3">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20">
                <Search className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold">Skills I Want to Learn</h2>
            </div>
            <div className="space-y-4">
              {swapper.seeks.map((skill: string, i: number) => (
                <div key={i} className="glass p-4 rounded-xl border border-white/5 hover:border-blue-500/30 transition-all flex items-center justify-between">
                  <span className="font-semibold text-white">{skill}</span>
                  <span className="text-xs text-blue-400 font-medium px-2 py-1 bg-blue-500/10 rounded-full">Beginner</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bio / About */}
        <div className="stat-card p-8 border border-white/10 mt-6 fade-in-4">
          <h2 className="text-xl font-bold mb-4">About Me</h2>
          <p className="text-gray-400 leading-relaxed">
            Hi! I'm {swapper.name.split(' ')[0]}. I'm really passionate about sharing knowledge and learning new things.
            My primary expertise is in {swapper.offers[0]}, and I'm currently looking for someone who can guide me through {swapper.seeks[0]}.
            I'm available on weekends for 1-hour sessions. Let's swap skills and grow together!
          </p>
        </div>

        {/* Premium Rating Section - NEW */}
        <div className="mt-8 fade-in-5 flex justify-center">
          <StarRating
            onRate={(val) => {
              console.log(`User rated ${swapper.name}: ${val}`);
              // In a real app, this would sync with a backend
            }}
          />
        </div>

        {/* Admin Controls (Only visible to admins) */}
        {role === 'admin' && (
          <div className="stat-card p-8 border border-red-500/20 mt-6 fade-in-5 bg-red-500/5">
            <h2 className="text-xl font-bold text-red-400 mb-4 flex items-center gap-2">
              <ShieldBan size={24} /> Administrative Actions
            </h2>
            <p className="text-gray-400 mb-6 text-sm">Use these controls to manage the user's access to the platform. These actions will immediately affect the user.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              {swapper.status === 'active' ? (
                <button
                  onClick={() => { setAdminActionType('suspend'); setIsAdminActionModalOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/20 transition-all font-bold"
                >
                  <ShieldBan size={18} /> Suspend User
                </button>
              ) : (
                <button
                  onClick={() => { setAdminActionType('restore'); setIsAdminActionModalOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 transition-all font-bold"
                >
                  <RotateCcw size={18} /> Restore Account
                </button>
              )}

              {swapper.status !== 'deleted' && (
                <button
                  onClick={() => { setAdminActionType('delete'); setIsAdminActionModalOpen(true); }}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all font-bold"
                >
                  <Trash2 size={18} /> Delete Account
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Admin Action Modal */}
      <AnimatePresence>
        {isAdminActionModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsAdminActionModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-sm bg-[#120B2E] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl p-8 text-center">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border ${adminActionType === 'suspend' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                  adminActionType === 'delete' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                    'bg-green-500/10 border-green-500/20 text-green-400'
                }`}>
                {adminActionType === 'suspend' ? <ShieldBan size={40} /> :
                  adminActionType === 'delete' ? <Trash2 size={40} /> :
                    <RotateCcw size={40} />}
              </div>
              <h3 className="text-2xl font-black text-white mb-2 capitalize">{adminActionType} User?</h3>
              <p className="text-gray-400 text-sm mb-8">
                Are you sure you want to {adminActionType} <span className="text-white font-bold">{swapper.name}</span>?
                {adminActionType === 'delete' ? " This action is permanent." : " This can be reversed later."}
              </p>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => setIsAdminActionModalOpen(false)} className="py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white/10 transition-all">Cancel</button>
                <button onClick={handleAdminAction} className={`py-3 rounded-xl font-black text-white shadow-lg transition-all ${adminActionType === 'suspend' ? 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/20' :
                    adminActionType === 'delete' ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' :
                      'bg-green-600 hover:bg-green-500 shadow-green-500/20'
                  }`}>Confirm</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Report User Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsReportModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative w-full max-w-md bg-[#120B2E] border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-black text-white">Report User</h3>
                  <button onClick={() => setIsReportModalOpen(false)} className="text-gray-500 hover:text-white transition-colors"><X size={24} /></button>
                </div>
                {isReportSubmitted ? (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/20"><Check className="text-green-500" size={40} /></div>
                    <h4 className="text-xl font-bold text-white mb-2">Report Submitted</h4>
                    <p className="text-gray-400 text-sm">Thank you for helping us keep SkillBridge safe.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-gray-400 text-sm mb-6">Select a reason for reporting <span className="text-white font-bold">{swapper.name}</span>.</p>
                    <div className="space-y-3 mb-6">
                      {reportReasons.map(reason => (
                        <button key={reason} onClick={() => setReportReason(reason)} className={`w-full text-left px-5 py-3.5 rounded-xl border transition-all text-sm font-bold flex items-center justify-between ${reportReason === reason ? 'bg-purple-600 border-purple-500 text-white' : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'}`}>
                          {reason}{reportReason === reason && <Check size={18} />}
                        </button>
                      ))}
                    </div>
                    {reportReason === "Other" && (
                      <textarea value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} placeholder="Please provide more details..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-purple-500/50 mb-6 min-h-[100px]" />
                    )}
                    <button onClick={handleReport} disabled={!reportReason} className="w-full gradient-btn py-4 rounded-xl font-black text-white shadow-lg shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-widest">Submit Report</button>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
