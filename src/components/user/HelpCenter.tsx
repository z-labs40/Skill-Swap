import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, X, MessageCircle, Clock, Sparkles, ShieldCheck } from 'lucide-react';
import { sendSupportMessage, getSupportMessages } from '../../lib/contentService';
import { SupportMessage } from '../../types';

/**
 * HelpCenter Component - Premium Support UI with AI Integration
 */
export function HelpCenter({ userEmail }: { userEmail: string }) {
  const [isOpen, setIsOpen] = React.useState<boolean>(() => {
    return localStorage.getItem('support_chat_open') === 'true';
  });
  const [message, setMessage] = React.useState<string>('');
  const [messages, setMessages] = React.useState<SupportMessage[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = React.useState<number>(0);
  const chatEndRef = React.useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const allMessages = await getSupportMessages();
      if (!allMessages) return; // Do not clear messages on network error
      
      const filtered = allMessages
        .filter((m: any) => (m.user_email || m.userEmail) === userEmail)
        .map((m: any) => ({
          ...m,
          userEmail: m.user_email || m.userEmail
        }))
        .sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      setMessages(filtered);
    } catch (err) {
      console.error('Failed to fetch support messages', err);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchMessages();
    }
  }, [isOpen, userEmail, refreshTrigger]);

  React.useEffect(() => {
    const handleUpdate = () => setRefreshTrigger((prev: number) => prev + 1);
    window.addEventListener('focus', handleUpdate);
    const poll = setInterval(fetchMessages, 2000); // Faster polling (2s)
    return () => {
      window.removeEventListener('focus', handleUpdate);
      clearInterval(poll);
    };
  }, [isOpen, userEmail]);

  React.useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isOpen, messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    // Optimistic update
    const tempId = Date.now().toString();
    const optimisticMsg: SupportMessage = {
      id: tempId,
      userEmail,
      message,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    setMessages((prev: any[]) => [...prev, optimisticMsg]);
    setMessage('');
    
    await sendSupportMessage(userEmail, message);
    setRefreshTrigger((prev: number) => prev + 1);
  };

  const toggleOpen = (val: boolean) => {
    setIsOpen(val);
    localStorage.setItem('support_chat_open', val.toString());
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <motion.button 
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => toggleOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-tr from-purple-600 to-indigo-600 rounded-full shadow-[0_8px_32px_rgba(147,51,234,0.4)] flex items-center justify-center text-white z-[100] group overflow-hidden"
      >
        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        <MessageCircle size={24} className="relative z-10 transition-transform group-hover:rotate-12" />
      </motion.button>

      {/* Support Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-end justify-end p-4 sm:p-6 lg:p-8 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0, y: 100, scale: 0.9, rotate: -2 }}
              animate={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, y: 100, scale: 0.9 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="w-[calc(100vw-32px)] sm:w-[350px] lg:w-[380px] h-[75dvh] sm:h-[70vh] lg:h-[580px] max-h-[85vh] sm:max-h-[580px] bg-[#0d0d15]/95 backdrop-blur-2xl border border-white/10 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto overflow-hidden flex flex-col relative"
            >
              {/* Background Glow */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-600/20 blur-[100px] -z-10 pointer-events-none" />

              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-b border-white/10 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center shadow-lg border border-white/10 overflow-hidden">
                      <img src="/favicon.ico" alt="SkillBridge" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#0d0d15] shadow-lg shadow-green-500/20" />
                  </div>
                  <div>
                    <h3 className="text-white font-black tracking-tight text-lg">Support Agent</h3>
                    <div className="flex items-center gap-1.5">
                      <p className="text-purple-400 text-[10px] uppercase tracking-widest font-black">AI AND HUMAN POWERED</p>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => toggleOpen(false)} 
                  className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl text-white/50 hover:text-white transition-all active:scale-90"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Chat Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {isLoading && (
                  <div className="h-full flex flex-col items-center justify-center py-20">
                    <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin mb-4 shadow-lg shadow-purple-500/10" />
                    <p className="text-gray-400 text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">Initializing Terminal...</p>
                  </div>
                )}
                
                {!isLoading && messages.length === 0 && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center p-8 py-20"
                  >
                    <div className="w-20 h-20 bg-gradient-to-tr from-purple-600/10 to-indigo-600/10 rounded-3xl flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                      <Clock className="text-purple-500/50" size={40} />
                    </div>
                    <h4 className="text-white font-black text-xl mb-2">No History Yet</h4>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">How can our AI and human team help you today?</p>
                  </motion.div>
                )}

                {!isLoading && messages.length > 0 && messages.map((m: any) => (
                  <motion.div 
                    key={m.id} 
                    className="space-y-3"
                  >
                    {m.status === 'replied' || m.id.startsWith('ai_') || m.id.startsWith('reply_') ? (
                      <div className="flex flex-col items-start group">
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <ShieldCheck size={12} className="text-purple-400" />
                          <p className="text-purple-400 text-[10px] font-black uppercase tracking-widest">SkillBridge Assistant</p>
                        </div>
                        <div className="bg-white/5 border border-white/10 rounded-2xl rounded-tl-none p-3 max-w-[90%] shadow-xl relative overflow-hidden group-hover:border-purple-500/30 transition-colors">
                          <div className="absolute top-0 left-0 w-1 h-full bg-purple-600/50" />
                          <p className="text-gray-200 text-sm leading-relaxed font-medium">{m.message}</p>
                          <p className="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-widest flex items-center gap-1">
                            <Clock size={8} /> Just Now
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-end">
                        <div className="bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl rounded-tr-none p-3 max-w-[90%] shadow-lg shadow-purple-600/20">
                          <p className="text-white text-sm font-medium leading-relaxed">{m.message}</p>
                          <p className="text-[9px] text-white/50 mt-2 font-bold uppercase tracking-widest text-right">
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Footer */}
              <div className="p-4 bg-white/[0.02] border-t border-white/10 shrink-0">
                <form onSubmit={handleSend} className="relative group">
                  <input 
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Message SkillBridge..."
                    className="w-full bg-white/5 border border-white/10 rounded-[20px] py-4 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-purple-500/50 focus:bg-white/[0.08] transition-all placeholder:text-gray-600 shadow-2xl"
                  />
                  <motion.button 
                    whileHover={message.trim() ? { scale: 1.1, x: 2 } : {}}
                    whileTap={message.trim() ? { scale: 0.9 } : {}}
                    type="submit"
                    disabled={!message.trim()}
                    className={`absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                      message.trim() 
                        ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-[0_4px_15px_rgba(147,51,234,0.4)] opacity-100' 
                        : 'bg-white/5 text-white/20 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <Send size={18} className={message.trim() ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''} />
                  </motion.button>
                </form>
                <p className="text-center text-[9px] text-gray-600 mt-4 font-bold uppercase tracking-[0.2em]">
                  Encrypted AND Secured by SkillBridge
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
