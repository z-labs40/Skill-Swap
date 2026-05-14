import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { getAuthState } from '../../lib/auth';
import { useSwappers } from '../../hooks/useSwappers';
import { SecureImage } from '../common/SecureImage';
import { chatService } from '../../services/chatService';
import { userService } from '../../services/userService';
import { useToast } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

export function Explore() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sentRequestsLocal, setSentRequestsLocal] = useState<Record<string, boolean>>({});
  const [requestLoading, setRequestLoading] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { role } = getAuthState();
  const { showToast } = useToast();
  const { swappers, loading, error } = useSwappers();

  // Admin should not access user explore page
  if (role === 'admin') {
    return <Navigate to="/admin/users" replace />;
  }

  // Global Search Logic: filters by name, offers array, or seeks array
  const filteredSwappers = swappers.filter(swapper => {
    const lowerQuery = searchQuery.toLowerCase();
    const matchName = swapper.name.toLowerCase().includes(lowerQuery);
    const matchOffers = swapper.offers.some((skill: string) => skill.toLowerCase().includes(lowerQuery));
    const matchSeeks = swapper.seeks.some((skill: string) => skill.toLowerCase().includes(lowerQuery));
    return matchName || matchOffers || matchSeeks;
  });

  return (
    <div className="min-h-screen hero-bg grid-overlay text-white">
      {/* Mobile Floating Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-[60] sm:hidden bg-black/40 backdrop-blur-sm"
            />
            <div className="fixed top-[68px] right-4 z-[70] flex flex-col gap-2.5 sm:hidden">
              {[
                { label: 'Dashboard', icon: '📊', action: () => { setMobileMenuOpen(false); navigate('/user/dashboard'); }, color: 'border-purple-500/40 bg-purple-950/80 text-purple-200' },
                { label: 'Messages',  icon: '💬', action: () => { setMobileMenuOpen(false); navigate('/user/messages'); }, color: 'border-blue-500/40 bg-blue-950/80 text-blue-200' },
                { label: 'My Profile', icon: '👤', action: () => { setMobileMenuOpen(false); navigate('/user/my-profile'); }, color: 'border-emerald-500/40 bg-emerald-950/80 text-emerald-200' },
              ].map((item, i) => (
                <motion.button
                  key={item.label}
                  initial={{ opacity: 0, y: -10, x: 20 }}
                  animate={{ opacity: 1, y: 0, x: 0 }}
                  exit={{ opacity: 0, y: -8, x: 16 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={item.action}
                  className={`flex items-center gap-3 px-5 py-3 rounded-2xl border text-sm font-semibold backdrop-blur-xl transition-all shadow-xl ${item.color}`}
                  style={{ minWidth: '152px' }}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
            </div>
          </>
        )}
      </AnimatePresence>

      <nav className="navbar h-16 flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center cursor-pointer" onClick={() => navigate('/dashboard')}>
          <img src="/logo.png" alt="SkillBridge Logo" className="h-10 sm:h-12 w-auto object-contain logo-blend" />
          <span className="sm:hidden text-white font-black text-sm tracking-wide ml-2">SkillBridge</span>
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center space-x-3">
          <button onClick={() => navigate('/user/dashboard')} className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Dashboard</button>
          <button onClick={() => navigate('/user/messages')} className="px-5 py-2 text-sm font-medium text-gray-300 border border-white/10 rounded-xl hover:bg-white/10 transition-all">Messages</button>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="sm:hidden flex flex-col gap-1.5 p-2 rounded-lg bg-white/5 border border-white/10"
        >
          <span className="block w-5 h-0.5 bg-white rounded"></span>
          <span className="block w-5 h-0.5 bg-white rounded"></span>
          <span className="block w-5 h-0.5 bg-white rounded"></span>
        </button>
      </nav>

      <div className="pt-12 pb-12 px-6 max-w-7xl mx-auto">

        {/* Header & Search */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-12 fade-in-1">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black mb-2">Explore <span className="gradient-text">Swappers</span></h1>
            <p className="text-gray-400">Find the perfect match for your skill exchange journey.</p>
          </div>

          <div className="w-full md:w-96 relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            <input
              type="text"
              placeholder="Search by name, skill, or role..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white focus:outline-none focus:border-purple-500/50 transition-all shadow-lg"
            />
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-20 text-center text-white">Loading swappers...</div>
          ) : error ? (
            <div className="col-span-full py-20 text-center text-red-500">{error}</div>
          ) : filteredSwappers.length > 0 ? (
            filteredSwappers.map((swapper, index) => (
              <div
                key={swapper.id}
                className="stat-card p-6 flex flex-col h-full border border-white/10 hover:border-purple-500/30 transition-all hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner overflow-hidden border border-white/10 relative">
                      <SecureImage 
                        url={swapper.avatarUrl || swapper.avatar} 
                        alt={swapper.name} 
                        className="w-full h-full object-cover" 
                      />
                      {swapper.isOnline && (
                        <div className="absolute top-1 right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#12121a] animate-pulse z-10" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{swapper.name}</h3>
                        {swapper.isOnline && (
                          <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Online</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-yellow-400">
                        <span>⭐</span> {swapper.rating}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-green-400">{swapper.match}%</div>
                    <div className="text-[10px] text-gray-500 uppercase tracking-wider">Match</div>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">CAN TEACH</div>
                    <div className="flex flex-wrap gap-2">
                      {swapper.offers.map((skill: string) => (
                        <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 border border-purple-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-2 font-medium">WANTS TO LEARN</div>
                    <div className="flex flex-wrap gap-2">
                      {swapper.seeks.map((skill: string) => (
                        <span key={skill} className="text-xs px-2.5 py-1 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/20">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/profile/${swapper.id}`)}
                    className="py-2.5 rounded-xl border border-white/10 hover:bg-white/5 text-sm font-semibold transition-all"
                  >
                    View Profile
                  </button>
                  {localStorage.getItem(`request_${swapper.id}`) || sentRequestsLocal[swapper.id] ? (
                    <button
                      disabled
                      className="py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-semibold cursor-default flex items-center justify-center gap-2"
                    >
                      <span>Sent ✓</span>
                    </button>
                  ) : (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        const { id: currentUserId } = getAuthState();
                        if (!currentUserId) return;
                        
                         setRequestLoading(swapper.id);
                        try {
                          const skillToLearn = swapper.offers[0] || 'your skills';
                          await userService.sendSwapRequest(currentUserId, swapper.id, skillToLearn);
                          setSentRequestsLocal(prev => ({ ...prev, [swapper.id]: true }));
                          localStorage.setItem(`request_${swapper.id}`, 'true');
                          showToast('Swap request sent! Waiting for acceptance.', 'success');
                        } catch (err) {
                          console.error('Failed to send swap request:', err);
                          showToast('Failed to send request. Please try again.', 'error');
                        } finally {
                          setRequestLoading(null);
                        }
                      }}
                      disabled={requestLoading === swapper.id}
                      className="py-2.5 rounded-xl gradient-btn text-white text-sm font-semibold shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {requestLoading === swapper.id ? (
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      ) : (
                        "Request Swap"
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <div className="text-4xl mb-4">🕵️‍♂️</div>
              <h3 className="text-xl font-bold text-white mb-2">No swappers found</h3>
              <p className="text-gray-400">Try adjusting your search criteria to find the right match.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
