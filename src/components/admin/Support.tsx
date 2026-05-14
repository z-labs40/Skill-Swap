import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MessageSquare, User, CheckCircle2, Send, Search, ArrowLeft, Check, CheckCheck, Edit2, Trash2, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { adminService } from '../../services/adminService';

export function Support() {
  const [messages, setMessages] = useState<any[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showChatOnMobile, setShowChatOnMobile] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const data = await adminService.getSupportMessages();
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch support messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedEmail, messages]);

  const emails = useMemo(() => {
    return Array.from(new Set(messages.map(m => m.user_email)))
      .sort((a, b) => {
        const lastA = [...messages].filter(m => m.user_email === a).reverse()[0];
        const lastB = [...messages].filter(m => m.user_email === b).reverse()[0];
        return new Date(lastB.timestamp).getTime() - new Date(lastA.timestamp).getTime();
      });
  }, [messages]);

  const filteredEmails = emails.filter((email: string) => 
    email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!selectedEmail && filteredEmails.length > 0) {
      setSelectedEmail(filteredEmails[0]);
    }
  }, [filteredEmails, selectedEmail]);

  const selectedMessages = messages
    .filter(m => m.user_email === selectedEmail)
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedEmail) return;

    const latestMessage = [...selectedMessages].reverse().find(m => m.status === 'pending');
    const messageToReply = latestMessage || [...selectedMessages].reverse()[0];

    if (messageToReply) {
      try {
        // Add a temporary local message for immediate feedback
        const tempId = `temp_${Date.now()}`;
        const tempMsg = {
          id: tempId,
          user_email: selectedEmail,
          message: replyText,
          status: 'sending', // Temporary status for single tick
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [tempMsg, ...prev]);
        setReplyText('');

        await adminService.replyToSupportMessage(messageToReply.id, replyText);
        fetchMessages();
      } catch (error) {
        console.error('Failed to send reply:', error);
      }
    }
  };

  const handleEditMessage = async (id: string) => {
    if (!editingText.trim()) return;
    try {
      await adminService.updateSupportMessage(id, editingText);
      setEditingId(null);
      fetchMessages();
    } catch (error) {
      console.error('Failed to edit message:', error);
    }
  };

  const handleDeleteMessage = async (id: string, permanent = false) => {
    try {
      if (permanent) {
        await adminService.permanentlyDeleteSupportMessage(id);
      } else {
        await adminService.deleteSupportMessage(id);
      }
      setActiveMenuId(null);
      fetchMessages();
    } catch (error) {
      console.error('Failed to delete message:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center h-[calc(100vh-120px)] animate-pulse">
        <div className="text-gray-500 font-black uppercase tracking-widest text-sm">Loading Conversations...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 sm:p-6 lg:p-8 bg-[#050505] overflow-hidden h-[calc(100dvh-64px)] sm:h-full lg:max-h-[calc(100vh-100px)]">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
        }
        .custom-scrollbar {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}</style>
      <div className="mb-4 sm:mb-6 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-black text-white mb-1 tracking-tight">Support Center</h1>
        <p className="text-gray-500 text-xs sm:text-sm font-medium">Manage user conversations through the integrated backend.</p>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Sidebar: Message List */}
        <div className={`w-full lg:w-80 flex flex-col bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-300 ${showChatOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          <div className="p-4 border-b border-white/5 bg-white/[0.02]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-xs text-white focus:outline-none focus:border-purple-500/50 transition-all"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
            {filteredEmails.length > 0 ? filteredEmails.map((email: string) => {
              const userMsgs = messages.filter(m => m.user_email === email);
              const lastMsg = userMsgs[userMsgs.length - 1];
              const isSelected = selectedEmail === email;
              const hasUnreplied = userMsgs.some(m => m.status === 'pending');

              return (
                <button
                  key={email}
                  onClick={() => {
                    setSelectedEmail(email);
                    setShowChatOnMobile(true);
                  }}
                  className={`w-full text-left p-4 rounded-2xl mb-2 transition-all group ${
                    isSelected ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'hover:bg-white/5 text-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-xs font-bold truncate pr-2 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                      {email || "Guest User"}
                    </span>
                    {hasUnreplied && !isSelected && (
                      <span className="w-2 h-2 bg-purple-500 rounded-full animate-pulse shrink-0 mt-1" />
                    )}
                  </div>
                  <p className={`text-[10px] line-clamp-1 opacity-60 font-medium`}>
                    {lastMsg.message}
                  </p>
                </button>
              );
            }) : (
              <div className="text-center py-20 opacity-30">
                <MessageSquare className="mx-auto mb-3" size={32} />
                <p className="text-xs font-bold uppercase tracking-widest">No active chats</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-300 ${!showChatOnMobile ? 'hidden lg:flex' : 'flex'}`}>
          {selectedEmail ? (
            <>
              {/* Chat Header */}
              <div className="p-3 sm:p-6 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2 sm:gap-4 overflow-hidden">
                  <button 
                    onClick={() => setShowChatOnMobile(false)}
                    className="p-1.5 -ml-1 rounded-xl hover:bg-white/5 text-gray-400 lg:hidden"
                  >
                    <ArrowLeft size={18} />
                  </button>
                  <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-purple-400">
                    <User size={18} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-black text-white text-xs sm:text-base truncate">{selectedEmail}</h3>
                    <p className="text-[8px] sm:text-[10px] text-gray-500 font-bold uppercase tracking-widest">Live Session</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar bg-[#0a0a0f]">
                {selectedMessages.map((msg, i) => (
                  <motion.div
                    key={msg.id || i}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className={`flex ${msg.id?.toString().startsWith('reply_') || msg.status === 'sending' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl relative group transition-all ${
                      msg.id?.toString().startsWith('reply_') || msg.status === 'sending'
                        ? 'bg-purple-600 text-white rounded-tr-none shadow-lg shadow-purple-900/20' 
                        : 'bg-white/5 text-gray-200 rounded-tl-none border border-white/5'
                    } ${msg.status === 'unsent' ? 'opacity-40 grayscale-[0.5]' : ''}`}>
                      {editingId === msg.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="bg-white/10 border border-white/20 rounded-xl p-2 text-white text-sm focus:outline-none min-h-[60px]"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2">
                            <button onClick={() => setEditingId(null)} className="p-1 hover:bg-white/10 rounded-lg"><X size={14} /></button>
                            <button onClick={() => handleEditMessage(msg.id)} className="p-1 bg-white/20 hover:bg-white/30 rounded-lg font-bold text-[10px] px-2">SAVE</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <p className={`text-sm sm:text-base leading-relaxed ${msg.status === 'unsent' ? 'italic' : ''}`}>
                            {msg.message}
                          </p>
                          
                          {/* WhatsApp Style Menu for Admin Replies */}
                          {(msg.status === 'replied' || msg.status === 'unsent') && (
                            <div className="absolute -left-8 top-1/2 -translate-y-1/2 flex items-center">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === msg.id ? null : msg.id);
                                }}
                                className="p-1.5 rounded-full hover:bg-white/10 text-gray-500 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                              >
                                <MessageSquare size={14} className="rotate-90" />
                              </button>

                              {activeMenuId === msg.id && (
                                <motion.div 
                                  initial={{ opacity: 0, scale: 0.9, x: -10 }}
                                  animate={{ opacity: 1, scale: 1, x: 0 }}
                                  className="absolute right-full mr-2 z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl p-1.5 shadow-2xl min-w-[150px] backdrop-blur-xl"
                                >
                                  {msg.status !== 'unsent' && (
                                    <button 
                                      onClick={() => {
                                        setEditingId(msg.id);
                                        setEditingText(msg.message);
                                        setActiveMenuId(null);
                                      }}
                                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-xl text-xs text-gray-300 hover:text-white transition-all"
                                    >
                                      <Edit2 size={14} /> Edit
                                    </button>
                                  )}
                                  
                                  <button 
                                    onClick={() => handleDeleteMessage(msg.id, msg.status === 'unsent')}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-500/10 rounded-xl text-xs text-red-400 transition-all"
                                  >
                                    <Trash2 size={14} /> 
                                    {msg.status === 'unsent' ? 'Delete Permanently' : 'Unsend'}
                                  </button>
                                </motion.div>
                              )}
                            </div>
                          )}

                          <div className={`flex items-center gap-2 mt-2 ${msg.status === 'replied' || msg.status === 'sending' ? 'justify-end' : 'justify-start'}`}>
                            <span className="text-[9px] opacity-60 font-bold">
                              {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            {(msg.status === 'replied' || msg.status === 'sending') && (
                              <div className="flex items-center">
                                {msg.status === 'sending' ? (
                                  <Check size={14} className="text-gray-400" />
                                ) : (
                                  <CheckCheck size={14} className="text-blue-400" />
                                )}
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-3 sm:p-6 border-t border-white/5 bg-white/[0.02]">
                <form onSubmit={handleSendReply} className="relative flex items-center gap-2 sm:gap-3">
                  <input 
                    type="text"
                    placeholder="Type your reply here..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-3 sm:py-4 text-white text-xs sm:text-sm focus:outline-none focus:border-purple-500/50 transition-all placeholder:text-gray-600"
                  />
                  <button 
                    type="submit"
                    className="p-3 sm:p-4 bg-purple-600 hover:bg-purple-500 text-white rounded-xl sm:rounded-2xl transition-all shadow-lg shadow-purple-900/20 flex-shrink-0"
                  >
                    <Send size={16} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 opacity-40">
              <div className="w-20 h-20 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-6">
                <MessageSquare size={32} className="text-gray-400" />
              </div>
              <h3 className="text-xl font-black text-white mb-2">Select a Conversation</h3>
              <p className="text-gray-500 max-w-[240px] text-sm">Pick a user from the sidebar to start resolving their support ticket.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
