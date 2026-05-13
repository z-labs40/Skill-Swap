import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useCall } from '../../context/CallContext';
import { VoiceCall } from '../user/chat/VoiceCall';
import { VideoCall } from '../user/chat/VideoCall';
import { ScreenShare } from '../user/chat/ScreenShare';
import {
  Monitor,
  AppWindow,
  Square,
  Music,
  Maximize2,
  PhoneOff,
  Minimize2,
  X,
  Phone
} from 'lucide-react';

export function CallOverlay() {
  const {
    callState,
    incomingCall,
    activeSwapper,
    endCall,
    isScreenSetupConfirmed,
    setScreenSetupConfirmed,
    startCall,
    isMinimized,
    setIsMinimized
  } = useCall();

  // Guard for no call
  if (callState === 'none') return null;

  // Derive swapper info
  const swapper = activeSwapper || incomingCall?.swapper;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      <div className="pointer-events-auto h-full w-full relative">
        
        {/* Full Screen Call Views */}
        <AnimatePresence mode="wait">
          {!isMinimized && (
            <motion.div
              key={callState}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0"
            >
              {callState === 'voice' && (
                <VoiceCall
                  swapper={swapper}
                  isIncoming={!!incomingCall}
                  incomingSignal={incomingCall?.signal}
                  onClose={(duration) => endCall(duration)}
                  onMinimize={() => setIsMinimized(true)}
                  isMinimized={false}
                  onExpand={() => setIsMinimized(false)}
                />
              )}
              
              {callState === 'video' && (
                <VideoCall
                  swapper={swapper}
                  isIncoming={!!incomingCall}
                  incomingSignal={incomingCall?.signal}
                  onToggleScreen={() => {
                    if (activeSwapper) {
                      const currentSwapper = activeSwapper;
                      endCall();
                      setTimeout(() => {
                        setScreenSetupConfirmed(false);
                        startCall(currentSwapper, 'screen');
                      }, 100);
                    }
                  }}
                  onClose={(duration) => endCall(duration)}
                  onMinimize={() => setIsMinimized(true)}
                  isMinimized={false}
                  onExpand={() => setIsMinimized(false)}
                />
              )}

              {callState === 'screen' && (
                <>
                  {!isScreenSetupConfirmed ? (
                    <div className="fixed inset-0 bg-[#0a0a0c]/90 backdrop-blur-2xl flex items-center justify-center p-6 z-[10001]">
                      <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        className="max-w-2xl w-full bg-[#121214] border border-white/10 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
                      >
                        <div className="absolute top-0 right-0 p-8">
                          <button onClick={() => endCall()} className="text-gray-500 hover:text-white transition-colors">
                            <X size={24} />
                          </button>
                        </div>

                        <div className="flex flex-col items-center text-center mb-10">
                          <div className="w-20 h-20 bg-purple-600/20 rounded-3xl flex items-center justify-center mb-6 border border-purple-500/20 shadow-2xl shadow-purple-500/10">
                            <Monitor className="text-purple-400" size={40} />
                          </div>
                          <h2 className="text-4xl font-black text-white tracking-tighter mb-3">Screen Share Setup</h2>
                          <p className="text-gray-400 text-sm max-w-sm">Choose how you want to present your screen to {swapper?.name || 'the other person'}.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
                          {[
                            { icon: <Monitor />, label: 'Entire Screen', desc: 'Best for multiple windows' },
                            { icon: <AppWindow />, label: 'Application', desc: 'Share a specific app' },
                            { icon: <Square />, label: 'Browser Tab', desc: 'Highest quality for web' }
                          ].map((opt, i) => (
                            <motion.div
                              key={i}
                              whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                              className="p-6 rounded-3xl border border-white/5 bg-white/[0.02] flex flex-col items-center text-center group cursor-pointer transition-all"
                            >
                              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4 group-hover:text-purple-400 transition-colors text-gray-400">
                                {React.cloneElement(opt.icon as any, { size: 24 })}
                              </div>
                              <span className="text-white font-bold text-sm mb-1">{opt.label}</span>
                              <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{opt.desc}</span>
                            </motion.div>
                          ))}
                        </div>

                        <div className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 mb-10">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                              <Music size={20} />
                            </div>
                            <div className="text-left">
                              <p className="text-white font-bold text-xs">Share System Audio</p>
                              <p className="text-[10px] text-gray-500">Includes audio from your computer</p>
                            </div>
                          </div>
                          <div className="w-12 h-6 bg-purple-600 rounded-full p-1 flex justify-end cursor-pointer">
                            <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => endCall()}
                            className="flex-1 py-4 rounded-2xl bg-white/5 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => setScreenSetupConfirmed(true)}
                            className="flex-[2] py-4 rounded-2xl bg-purple-600 text-white font-black uppercase tracking-widest text-xs hover:bg-purple-700 transition-all shadow-xl shadow-purple-600/20"
                          >
                            Start Sharing
                          </button>
                        </div>
                      </motion.div>
                    </div>
                  ) : (
                    <ScreenShare 
                      swapper={swapper} 
                      onClose={(duration) => endCall(duration)}
                      onMinimize={() => setIsMinimized(true)}
                      isMinimized={isMinimized}
                      isIncoming={!!incomingCall}
                      incomingSignal={incomingCall?.signal}
                    />
                  )}
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Minimized Call Bar UI */}
        <AnimatePresence>
          {isMinimized && (swapper) && (
            <motion.div
              initial={{ y: 100, opacity: 0, scale: 0.8 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 100, opacity: 0, scale: 0.8 }}
              className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#121214]/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-3 shadow-2xl flex items-center gap-4 z-[10005] min-w-[340px] pointer-events-auto ring-1 ring-white/5"
            >
              <div className="flex items-center gap-3 flex-1 px-3 border-r border-white/5">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
                  <div className="text-white font-black text-sm">{(swapper?.name || 'U').charAt(0)}</div>
                </div>
                <div className="flex flex-col">
                  <span className="text-white text-[13px] font-black tracking-tight truncate max-w-[120px]">{swapper?.name || 'User'}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">{callState} Active</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 px-1">
                <button 
                  onClick={() => setIsMinimized(false)}
                  className="w-11 h-11 rounded-2xl bg-white/5 text-white/70 hover:text-white hover:bg-white/10 transition-all flex items-center justify-center group"
                  title="Full Screen"
                >
                  <Maximize2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                <button 
                  onClick={() => endCall()}
                  className="w-11 h-11 rounded-2xl bg-red-600 text-white hover:bg-red-700 transition-all shadow-lg shadow-red-600/30 flex items-center justify-center group"
                  title="End Call"
                >
                  <PhoneOff size={20} className="group-hover:rotate-12 transition-transform" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Global Loading Guard */}
        {!(swapper) && (
          <div className="fixed inset-0 bg-[#0a0a0c] flex items-center justify-center text-white z-[10000]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-6" />
              <p className="text-sm font-black uppercase tracking-[0.3em] text-white/40">Synchronizing Session</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
