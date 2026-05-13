import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldBan, Trash2, AlertTriangle, CheckCircle2, RotateCcw, Clock, ChevronRight, ChevronDown } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Swapper } from '../../types';
import { useSwappers } from '../../hooks/useSwappers';

export function UserManagement() {
  const { swappers: users, loading, updateSwapperStatus } = useSwappers();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTab = queryParams.get('tab') || 'all';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [showScrollHint, setShowScrollHint] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 60) setShowScrollHint(false);
      else setShowScrollHint(true);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  React.useEffect(() => {
    const tab = queryParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [location.search]);

  const handleAction = async (userId: string, action: 'suspend' | 'delete' | 'restore') => {
    let newStatus: 'active' | 'suspended' | 'deleted' = 'active';
    if (action === 'suspend') newStatus = 'suspended';
    else if (action === 'delete') newStatus = 'deleted';
    else if (action === 'restore') newStatus = 'active';

    await updateSwapperStatus(userId, newStatus);
  };

  const filteredUsers = users.filter(user => {
    // Search logic
    const lowerQuery = searchQuery.toLowerCase();
    const matchName = user.name.toLowerCase().includes(lowerQuery);
    const matchOffers = user.offers.some((skill: string) => skill.toLowerCase().includes(lowerQuery));
    const matchSeeks = user.seeks.some((skill: string) => skill.toLowerCase().includes(lowerQuery));
    const matchesSearch = matchName || matchOffers || matchSeeks;

    // Tab logic
    let matchesTab = true;
    if (activeTab === "top_rated") {
      matchesTab = user.rating >= 4.8;
    } else if (activeTab === "new") {
      matchesTab = user.rating === 0 || user.match < 50;
    } else if (activeTab === "reported") {
      matchesTab = (user.reports || 0) > 0 && user.status === 'active';
    } else if (activeTab === "suspended") {
      matchesTab = user.status === 'suspended';
    } else if (activeTab === "appeals") {
      matchesTab = user.appealStatus === 'pending';
    } else if (activeTab === "deleted") {
      matchesTab = user.status === 'deleted';
    }

    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Skill Swappers</h1>
          <p className="text-gray-400 text-sm">Manage users, their offered skills, and moderation status on the platform.</p>
          {/* Scroll hint - hides on scroll */}
          <div className={`flex items-center gap-1 mt-3 text-gray-600 text-xs w-fit transition-all duration-500 ${showScrollHint ? 'opacity-100 animate-bounce' : 'opacity-0 pointer-events-none'}`}>
            <ChevronDown size={14} />
            <span>Scroll to see users</span>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#12121a] border border-white/5 rounded-3xl p-5 flex flex-col items-stretch gap-4 mb-8">
        <div className="relative">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
          {[
            { id: 'all', label: 'All Users', count: users.length },
            { id: 'top_rated', label: 'Top Rated', count: users.filter(u => u.rating >= 4.8).length },
            { id: 'reported', label: 'Reported', color: 'text-orange-400', count: users.filter(u => (u.reports || 0) > 0 && u.status === 'active').length },
            { id: 'appeals', label: 'Appeals', color: 'text-blue-400', count: users.filter(u => u.appealStatus === 'pending').length },
            { id: 'suspended', label: 'Suspended', color: 'text-amber-500', count: users.filter(u => u.status === 'suspended').length },
            { id: 'deleted', label: 'Deleted', color: 'text-red-500', count: users.filter(u => u.status === 'deleted').length }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all whitespace-nowrap flex items-center gap-2 ${activeTab === tab.id
                ? 'bg-white/10 text-white shadow-lg'
                : `text-gray-400 hover:text-white ${tab.color || ''}`
                }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${activeTab === tab.id ? 'bg-white text-black' : 'bg-white/10'}`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
          </div>
          {/* Right scroll arrow hint */}
          <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#12121a] to-transparent flex items-center justify-end pr-1">
            <ChevronRight size={16} className="text-gray-500 animate-pulse" />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/5 pt-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, skill, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-sm text-gray-300 focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
            />
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-black/40 border border-white/10 text-gray-400 hover:text-white transition-all text-sm">
              <Filter size={16} />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center text-gray-500">Loading users...</div>
        ) : filteredUsers.length > 0 ? (
          filteredUsers.map((user, index) => (
            <div
              key={user.id}
              className={`bg-white/5 p-6 flex flex-col h-full border rounded-3xl transition-all hover:-translate-y-1 ${user.status === 'suspended' ? 'border-amber-500/30' :
                user.status === 'deleted' ? 'border-red-500/30' :
                  'border-white/10 hover:border-purple-500/30'
                }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl shadow-inner border border-white/10 relative overflow-hidden">
                    {user.avatarUrl ? (
                      <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                    ) : (
                      user.avatar
                    )}
                    {user.status === 'suspended' && (
                      <div className="absolute inset-0 bg-amber-500/20 backdrop-blur-[1px] flex items-center justify-center">
                        <Clock size={20} className="text-amber-500" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{user.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-xs text-amber-400 font-bold">
                        <span>⭐</span> {user.rating > 0 ? user.rating.toFixed(1) : 'New'}
                      </div>
                      <span className="text-gray-600 text-xs">•</span>
                      <span className="text-xs text-gray-400 font-bold text-green-400">{user.match}% Match</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {(user.reports || 0) > 0 && (
                    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-2 ${(user.reports || 0) >= 10 ? 'bg-red-500/10 border-red-500/20 text-red-400 animate-pulse' : 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                      }`}>
                      <AlertTriangle size={10} />
                      {user.reports} Reports
                    </div>
                  )}
                </div>
              </div>

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-6">
                {user.status === 'active' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                )}
                {user.status === 'suspended' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-amber-500/10 border-amber-500/20 text-amber-400">
                    <Clock size={10} />
                    Suspended until {user.suspensionEndDate}
                  </span>
                )}
                {user.status === 'deleted' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-red-500/10 border-red-500/20 text-red-400">
                    <Trash2 size={10} />
                    Permanently Deleted
                  </span>
                )}
                {user.appealStatus === 'pending' && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border bg-blue-500/10 border-blue-500/20 text-blue-400 animate-pulse">
                    <ShieldBan size={10} />
                    Appeal Pending
                  </span>
                )}
              </div>

              {/* Appeal Message */}
              {user.appealMessage && (
                <div className="mb-6 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-blue-500" />
                  <p className="text-xs text-blue-400 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
                    Appeal Message:
                    <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-[8px]">New</span>
                  </p>
                  <p className="text-sm text-gray-300 italic">"{user.appealMessage}"</p>
                </div>
              )}

              {/* Skills */}
              <div className="space-y-5 flex-1">
                <div>
                  <div className="text-[10px] text-gray-500 mb-2 font-black uppercase tracking-[0.2em]">Offers</div>
                  <div className="flex flex-wrap gap-2">
                    {user.offers.map((skill: string) => (
                      <span key={skill} className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-gray-500 mb-2 font-black uppercase tracking-[0.2em]">Wants to Learn</div>
                  <div className="flex flex-wrap gap-2">
                    {user.seeks.map((skill: string) => (
                      <span key={skill} className="text-[11px] px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 pt-4 border-t border-white/5 grid grid-cols-2 gap-3">
                {user.status === 'active' ? (
                  <>
                    <button
                      onClick={() => handleAction(user.id, 'suspend')}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 text-xs font-bold transition-all border border-amber-500/20"
                    >
                      <Clock size={14} />
                      Suspend 10d
                    </button>
                    <button
                      onClick={() => handleAction(user.id, 'delete')}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-all border border-red-500/20"
                    >
                      <Trash2 size={14} />
                      Delete User
                    </button>
                  </>
                ) : user.status === 'suspended' ? (
                  <>
                    <button
                      onClick={() => handleAction(user.id, 'restore')}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-xs font-bold transition-all border border-emerald-500/20"
                    >
                      <RotateCcw size={14} />
                      Restore User
                    </button>
                    <button
                      onClick={() => handleAction(user.id, 'delete')}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-bold transition-all border border-red-500/20"
                    >
                      <Trash2 size={14} />
                      Delete User
                    </button>
                  </>
                ) : (
                  // Permanently deleted — cannot restore (hard deleted from DB)
                  <div className="col-span-2 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500/50 text-xs font-bold cursor-not-allowed">
                    <Trash2 size={14} />
                    Permanently Deleted — Cannot Restore
                  </div>
                )}
                <button
                  onClick={() => navigate(`/profile/${user.id}`)}
                  className="col-span-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/5 mt-1"
                >
                  View Full Audit Log
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 border-dashed rounded-3xl">
            <ShieldBan className="mx-auto text-gray-600 mb-4" size={48} />
            <h3 className="text-xl font-bold text-white mb-2">No users match these criteria</h3>
            <p className="text-gray-400">Everything looks clear in the {activeTab} section.</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-8 flex items-center justify-between">
        <p className="text-xs text-gray-500">Showing <span className="text-white font-medium">{filteredUsers.length}</span> results in <span className="text-white font-medium">{activeTab}</span></p>
        <div className="flex items-center gap-1">
          <button className="px-3 py-1.5 rounded-md border border-white/10 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all disabled:opacity-50">Prev</button>
          <button className="px-3 py-1.5 rounded-md bg-purple-600 text-xs font-bold text-white shadow-lg shadow-purple-500/20">1</button>
          <button className="px-3 py-1.5 rounded-md border border-white/10 text-xs font-medium text-gray-400 hover:bg-white/5 hover:text-white transition-all">Next</button>
        </div>
      </div>
    </div>
  );
}

