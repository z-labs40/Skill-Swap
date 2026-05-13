import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Peer from 'simple-peer';
import { socketService } from '../../../services/socketService';
import { useAuth } from '../../../hooks/useAuth';
import { useCall } from '../../../context/CallContext';
import { useToast } from '../../../context/ToastContext';
import { 
  Mic, 
  MicOff,
  Video, 
  VideoOff,
  Monitor, 
  PhoneOff, 
  Maximize2,
  Minimize2,
  Circle,
  Square,
  User,
  X
} from 'lucide-react';

const AvatarIcon = ({ name, className = "w-6 h-6" }: { name: string; className?: string }) => {
  return <div className={`flex items-center justify-center rounded-full bg-purple-500/10 ${className}`}><User size={24} /></div>;
};

interface ScreenShareProps {
  swapper: any;
  onClose: (duration?: string) => void;
  onToggleVideo?: () => void;
  onMinimize?: () => void;
  isMinimized?: boolean;
  isIncoming?: boolean;
  incomingSignal?: any;
}

export function ScreenShare({ 
  swapper, 
  onClose, 
  onToggleVideo, 
  onMinimize, 
  isMinimized,
  isIncoming = false,
  incomingSignal 
}: ScreenShareProps) {
  const { auth } = useAuth();
  const { showToast } = useToast();
  const { isInitiating } = useCall();
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const hasStarted = useRef(false);
  const mounted = useRef(true);
  const isConnectedRef = useRef(false);
  const secondsRef = useRef(0);
  const candidatesBuffer = useRef<any[]>([]);
  const acceptedSignalBuffer = useRef<any | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (hasStarted.current) return;
    if (isIncoming && isInitiating.current) return;
    
    hasStarted.current = true;
    if (isIncoming) isInitiating.current = true;

    console.log(`[Screen][${isIncoming ? 'Receiver' : 'Caller'}] Mounted. Swapper:`, swapper?.name);

    if (!isIncoming) {
      // Capture both Screen and Microphone for Sender
      const startSenderStream = async () => {
        try {
          // 1. Capture Screen
          const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
            video: true, 
            audio: true // System audio
          });
          
          // 2. Capture Microphone
          let micStream: MediaStream | null = null;
          try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          } catch (micErr) {
            console.warn("Microphone access denied for screen share, continuing with screen only.", micErr);
          }

          // 3. Combine Tracks
          const tracks = [...screenStream.getTracks()];
          if (micStream) {
            tracks.push(...micStream.getAudioTracks());
          }
          
          const combinedStream = new MediaStream(tracks);
          
          console.log("[Screen][Sender] Combined stream captured.");
          setStream(combinedStream);
          if (videoRef.current) {
            videoRef.current.srcObject = combinedStream;
          }

          screenStream.getVideoTracks()[0].onended = () => {
            handleEndCall();
          };

          callUser(combinedStream);
        } catch (err) {
          console.error("Screen capture failed:", err);
          showToast("Screen sharing permission denied or failed.", "error");
          onClose();
        }
      };

      startSenderStream();
    }

    // Listen for accepted call (For Sender)
    socketService.on('call_accepted', (signal: any) => {
      if (mounted.current) {
        setCallAccepted(true);
        if (connectionRef.current && !connectionRef.current.destroyed) {
          connectionRef.current.signal(signal);
        } else {
          acceptedSignalBuffer.current = signal;
        }
      }
    });

    // Listen for ICE candidates
    socketService.on('ice_candidate', (candidate: any) => {
      if (mounted.current) {
        if (connectionRef.current && !connectionRef.current.destroyed) {
          try { connectionRef.current.signal(candidate); } catch(e) {}
        } else {
          candidatesBuffer.current.push(candidate);
        }
      }
    });

    socketService.on('call_ended', () => {
      if (mounted.current) {
        onClose(isConnectedRef.current ? formatTime(secondsRef.current) : undefined);
      }
    });

    return () => {
      socketService.off('call_accepted');
      socketService.off('ice_candidate');
      socketService.off('call_ended');
      stream?.getTracks().forEach(track => track.stop());
      connectionRef.current?.destroy();
      hasStarted.current = false;
    };
  }, []);

  useEffect(() => {
    let timer: any;
    if (isConnected) {
      timer = setInterval(() => {
        setSeconds(prev => {
          const next = prev + 1;
          secondsRef.current = next;
          return next;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isConnected]);

  const callUser = (currentStream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream: currentStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', (data) => {
      if (!auth.id) return;
      if (data.type === 'offer') {
        socketService.emit('call_user', {
          userToCall: swapper.id,
          signalData: data,
          from: auth.id,
          name: auth.name || 'User',
          callType: 'screen'
        });
      } else if ('candidate' in data) {
        socketService.emit('ice_candidate', { to: swapper.id, candidate: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      // For screen share, usually sender doesn't see remote stream unless it's bidirectional
      // But we set it for symmetry
    });

    peer.on('connect', () => {
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('error', (err) => {
      console.error("[Screen][Sender] WebRTC Error:", err);
      onClose();
    });

    connectionRef.current = peer;
  };

  const { acceptCall } = useCall();

  const answerCall = () => {
    console.log("[Screen][Receiver] Initializing answer...");
    acceptCall();
    setCallAccepted(true);
    
    const peer = new Peer({
      initiator: false,
      trickle: true,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', (data) => {
      if (data.type === 'answer') {
        socketService.emit('answer_call', { signal: data, to: swapper.id });
      } else if ('candidate' in data) {
        socketService.emit('ice_candidate', { to: swapper.id, candidate: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log("[Screen][Receiver] Received remote screen stream!");
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('error', (err) => {
      console.error("[Screen][Receiver] WebRTC Error:", err);
      onClose();
    });

    connectionRef.current = peer;

    // Apply the initial offer from caller IMMEDIATELY
    if (incomingSignal) {
      console.log("[Screen][Receiver] Applying initial offer signal to peer...");
      try {
        peer.signal(incomingSignal);
      } catch (err) {
        console.error("[Screen][Receiver] Signal error (answer init):", err);
      }
    }

    // Apply buffered candidates
    if (candidatesBuffer.current.length > 0) {
      console.log(`[Screen][Receiver] Applying ${candidatesBuffer.current.length} buffered candidates.`);
      candidatesBuffer.current.forEach(c => {
        try { peer.signal(c); } catch(e) {}
      });
      candidatesBuffer.current = [];
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onClose(isConnected ? formatTime(seconds) : undefined);
  };

  return (
    <div className={`absolute inset-0 bg-[#0a0a0c] z-50 flex flex-col transition-all duration-500 ${isMinimized ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'}`}>
      
      {/* Header (Status Bar) */}
      <AnimatePresence>
        {isConnected && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 20, opacity: 1 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-4 bg-[#121214]/90 backdrop-blur-2xl border border-white/10 px-6 py-3 rounded-[2rem] shadow-2xl"
          >
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
              <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">
                {isIncoming ? `${swapper?.name} is presenting` : 'You are sharing your screen'}
              </span>
            </div>
            <div className="w-px h-4 bg-white/10" />
            <button 
              onClick={handleEndCall}
              className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-xl transition-all shadow-lg shadow-red-600/20"
            >
              {isIncoming ? 'Stop Viewing' : 'Stop Sharing'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 flex justify-between items-center absolute top-0 left-0 right-0 z-30 bg-gradient-to-b from-black/80 to-transparent">
        <div className="text-white font-bold flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
          {isConnected ? 'Live Presentation' : isIncoming && !callAccepted ? 'Incoming Screen Share...' : 'Initializing Stream...'}
          {isConnected && <span className="text-gray-400 ml-2 font-mono font-normal tracking-wider">{formatTime(seconds)}</span>}
        </div>

        <div className="flex items-center gap-3">
          <button className="text-white/50 hover:text-white flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 transition-all" onClick={onMinimize}>
            <Minimize2 size={16} /> <span className="text-[10px] font-black uppercase tracking-widest">Minimize</span>
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 relative flex items-center justify-center p-6 mt-16">
        <div className="w-full h-full max-w-6xl aspect-video border border-white/10 rounded-[2.5rem] bg-black overflow-hidden flex flex-col shadow-2xl relative">
          
          {/* Receiver Answer State */}
          {isIncoming && !callAccepted && (
             <div className="absolute inset-0 bg-[#0a0a0c] z-50 flex flex-col items-center justify-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                   <div className="w-32 h-32 rounded-[3rem] bg-purple-600/20 flex items-center justify-center mx-auto mb-8 border border-purple-500/20">
                      <Monitor className="text-purple-400" size={48} />
                   </div>
                   <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">{swapper?.name}</h2>
                   <p className="text-gray-500 text-sm font-bold uppercase tracking-[0.2em] mb-12">Is sharing their screen</p>
                   <div className="flex items-center gap-6">
                      <button onClick={answerCall} className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20 hover:scale-105 transition-all">
                         <Monitor size={32} />
                      </button>
                      <button onClick={() => onClose()} className="w-20 h-20 rounded-3xl bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-600/20 hover:scale-105 transition-all">
                         <PhoneOff size={32} />
                      </button>
                   </div>
                </motion.div>
             </div>
          )}

          {!isConnected && callAccepted && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-xl z-20 flex flex-col items-center justify-center">
              <div className="w-16 h-16 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mb-6" />
              <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px]">Connecting to presentation...</p>
            </div>
          )}
          
          <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted={!isIncoming} // Mute sender to prevent feedback, but allow receiver to hear
              className="w-full h-full object-contain" 
            />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-purple-500/5 to-transparent opacity-50" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="h-32 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-6 pb-4">
        <div className="flex items-center gap-4 bg-[#121214]/80 backdrop-blur-2xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
          <motion.button 
            whileHover={{ y: -5 }} 
            onClick={() => {
              if (stream) {
                stream.getAudioTracks().forEach(track => {
                  track.enabled = isMuted;
                });
              }
              setIsMuted(!isMuted);
            }}
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-white/5 text-white/50'}`}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </motion.button>
          
          <div className="flex flex-col items-center gap-1">
            <motion.button className={`w-14 h-14 rounded-2xl ${isIncoming ? 'bg-white/5 text-white/50' : 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'} flex items-center justify-center transition-all`}>
              <Monitor size={20} />
            </motion.button>
          </div>

          <motion.button 
            whileHover={{ y: -5 }}
            onClick={() => setShowConfirm(true)} 
            className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20"
          >
            <PhoneOff size={20} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-xs w-full bg-[#121214] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl text-center">
              <h3 className="text-xl font-bold text-white mb-6 tracking-tighter">End Presentation?</h3>
              <div className="flex flex-col gap-3">
                <button onClick={handleEndCall} className="w-full py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-xs">Yes, End Session</button>
                <button onClick={() => setShowConfirm(false)} className="w-full py-4 rounded-2xl bg-white/5 text-gray-300 font-black uppercase tracking-widest text-xs">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
