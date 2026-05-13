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
  Phone,
  PhoneOff, 
  Maximize2,
  Minimize2,
  Circle,
  Square,
  User,
  Terminal,
  Code2,
  Palette,
  BarChart,
  Music,
  X
} from 'lucide-react';

const AvatarIcon = ({ name, className = "w-6 h-6" }: { name: string; className?: string }) => {
  const icons: Record<string, any> = { User, Terminal, Code2, Palette, BarChart, Music };
  const Icon = icons[name] || User;
  return <Icon className={className} />;
};

interface VoiceCallProps {
  swapper: any;
  onClose: (duration?: string) => void;
  isIncoming?: boolean;
  incomingSignal?: any;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
}

export function VoiceCall({ swapper, onClose, isIncoming = false, incomingSignal, isMinimized, onMinimize, onExpand }: VoiceCallProps) {
  const { auth } = useAuth();
  const { showToast } = useToast();
  const { isInitiating } = useCall();
  const [isMuted, setIsMuted] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const myAudio = useRef<HTMLAudioElement | null>(null);
  const userAudio = useRef<HTMLAudioElement | null>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const outgoingToneRef = useRef<HTMLAudioElement | null>(null);
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

    console.log(`[Voice][${isIncoming ? 'Receiver' : 'Caller'}] Mounted. User:`, swapper.name);

    if (!isIncoming) {
      outgoingToneRef.current = new Audio('/music/call-tone.mp3');
      outgoingToneRef.current.loop = true;
      outgoingToneRef.current.play().catch((err: any) => console.error("Tone failed:", err));
    }

    navigator.mediaDevices.getUserMedia({ audio: true }).then((currentStream) => {
      console.log(`[Voice][${isIncoming ? 'Receiver' : 'Caller'}] Mic captured.`);
      setStream(currentStream);
      if (myAudio.current) {
        myAudio.current.srcObject = currentStream;
      }

      if (!isIncoming) {
        callUser(currentStream);
      }
      // If isIncoming, we WAIT for user to click "Answer" button
    }).catch(err => {
      console.error("Mic error:", err);
      showToast("Could not access microphone.", "error");
      onClose();
    });

    socketService.on('call_accepted', (signal: any) => {
      if (mounted.current) {
        console.log("[Voice][Caller] call_accepted received.");
        setCallAccepted(true);
        if (connectionRef.current && !connectionRef.current.destroyed) {
          try {
            connectionRef.current.signal(signal);
          } catch (err) {
            console.error("Signal error:", err);
          }
        } else {
          acceptedSignalBuffer.current = signal;
        }
      }
    });

    socketService.on('ice_candidate', (candidate: any) => {
      if (mounted.current) {
        if (connectionRef.current && !connectionRef.current.destroyed) {
          try {
            connectionRef.current.signal(candidate);
          } catch (err) {
            console.error("ICE error:", err);
          }
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
      if (outgoingToneRef.current) {
        outgoingToneRef.current.pause();
      }
      connectionRef.current?.destroy();
      hasStarted.current = false;
    };
  }, []);

  const callUser = (currentStream: MediaStream) => {
    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream: currentStream,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    });

    peer.on('signal', (data) => {
      if (!auth.id) return;
      if (data.type === 'offer') {
        console.log("[Voice][Caller] Offer generated.");
        socketService.emit('call_user', {
          userToCall: swapper.id,
          signalData: data,
          from: auth.id,
          name: auth.name || 'User',
          callType: 'voice'
        });
      } else if ('candidate' in data) {
        socketService.emit('ice_candidate', { to: swapper.id, candidate: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log("[Voice][Caller] Remote stream received.");
      if (userAudio.current) {
        userAudio.current.srcObject = remoteStream;
      }
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('connect', () => {
      console.log("[Voice][Caller] Connected!");
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('error', (err) => {
      console.error("[Voice][Caller] Peer error:", err);
      onClose();
    });

    connectionRef.current = peer;

    if (acceptedSignalBuffer.current) {
      peer.signal(acceptedSignalBuffer.current);
      acceptedSignalBuffer.current = null;
    }
    candidatesBuffer.current.forEach(c => peer.signal(c));
    candidatesBuffer.current = [];
  };

  const { acceptCall } = useCall();

  const answerCall = (currentStream?: MediaStream) => {
    const mediaStream = currentStream || stream;
    if (!mediaStream) return;

    console.log("[Voice][Receiver] Answering...");
    acceptCall(); // This stops the global ringtone
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream: mediaStream,
      config: {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      }
    });

    peer.on('signal', (data) => {
      if (data.type === 'answer') {
        console.log("[Voice][Receiver] Answer generated.");
        socketService.emit('answer_call', { signal: data, to: swapper.id });
      } else if ('candidate' in data) {
        socketService.emit('ice_candidate', { to: swapper.id, candidate: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log("[Voice][Receiver] Remote stream received.");
      if (userAudio.current) {
        userAudio.current.srcObject = remoteStream;
      }
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('connect', () => {
      console.log("[Voice][Receiver] Connected!");
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('error', (err) => {
      console.error("[Voice][Receiver] Peer error:", err);
      onClose();
    });

    connectionRef.current = peer;

    if (incomingSignal) {
      console.log("[Voice][Receiver] Applying offer.");
      peer.signal(incomingSignal);
    }
    candidatesBuffer.current.forEach(c => peer.signal(c));
    candidatesBuffer.current = [];
  };

  useEffect(() => {
    let timer: any;
    if (isConnected) {
      if (outgoingToneRef.current) outgoingToneRef.current.pause();
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

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleEndCall = () => {
    onClose(isConnected ? formatTime(seconds) : undefined);
  };

  return (
    <div className={`absolute inset-0 bg-[#0a0a0c] z-50 flex flex-col overflow-hidden transition-all duration-500 ${isMinimized ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'}`}>
      {/* Header */}
      <div className="absolute top-0 inset-x-0 p-8 flex items-center justify-between z-30">
        <div className="flex items-center gap-3 px-4 py-2 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-white/50 font-black uppercase tracking-[0.3em]">End-to-End Encrypted</span>
        </div>
        <button onClick={onMinimize} className="p-4 rounded-2xl bg-white/5 text-white/50 hover:text-white transition-all flex items-center gap-2 group">
          <Minimize2 size={20} className="group-hover:scale-110 transition-transform" />
          <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">Minimize Call</span>
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative p-6">
        <div className="relative z-10 flex flex-col items-center">
          <div className="w-48 h-48 rounded-[4rem] bg-gradient-to-br from-white/10 to-white/5 p-1 border border-white/10 relative shadow-2xl flex items-center justify-center overflow-hidden">
            <AvatarIcon name={swapper.avatar || 'U'} className="w-20 h-20 text-purple-500/80" />
          </div>
          <div className="mt-10 text-center">
            <h2 className="text-6xl font-black text-white mb-4 tracking-tighter">{swapper.name}</h2>
            <div className="text-5xl font-mono text-white tracking-tighter font-black">
              {isConnected ? formatTime(seconds) : isIncoming ? 'Incoming Call...' : 'Calling...'}
            </div>
          </div>
        </div>
        <audio ref={myAudio} autoPlay muted />
        <audio ref={userAudio} autoPlay />
      </div>

      <div className="h-48 flex items-center justify-center relative z-20">
        {!isConnected && isIncoming ? (
          <div className="flex items-center gap-12 bg-white/5 backdrop-blur-3xl p-8 rounded-[3.5rem] border border-white/10 shadow-2xl">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => answerCall()}
              className="w-24 h-24 rounded-[2.5rem] bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 relative"
            >
              <div className="absolute inset-0 rounded-[2.5rem] bg-emerald-500 animate-ping opacity-20" />
              <Phone size={36} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onClose()}
              className="w-24 h-24 rounded-[2.5rem] bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40"
            >
              <PhoneOff size={36} />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-8 bg-white/5 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 shadow-2xl">
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} 
              onClick={() => {
                if (stream) stream.getAudioTracks()[0].enabled = isMuted;
                setIsMuted(!isMuted);
              }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center ${isMuted ? 'bg-red-500' : 'bg-white/10'}`}
            >
              {isMuted ? <MicOff /> : <Mic />}
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
              onClick={() => setShowConfirm(true)}
              className="w-20 h-20 rounded-[2.2rem] bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/40"
            >
              <PhoneOff size={32} />
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-xs w-full bg-[#121214] border border-white/10 rounded-[3rem] p-10 shadow-2xl text-center">
              <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">End Call?</h3>
              <div className="flex flex-col gap-4 mt-8">
                <button onClick={handleEndCall} className="w-full py-4 rounded-2xl bg-red-600 text-white font-black uppercase tracking-widest text-xs">End Call</button>
                <button onClick={() => setShowConfirm(false)} className="w-full py-4 rounded-2xl bg-white/5 text-white/60 font-black uppercase tracking-widest text-xs">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
