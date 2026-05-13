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
  Terminal,
  Code2,
  Palette,
  BarChart,
  Music
} from 'lucide-react';

const AvatarIcon = ({ name, className = "w-6 h-6" }: { name: string; className?: string }) => {
  const icons: Record<string, any> = { User, Terminal, Code2, Palette, BarChart, Music };
  const Icon = icons[name] || User;
  return <Icon className={className} />;
};

interface VideoCallProps {
  swapper: any;
  onClose: (duration?: string) => void;
  onToggleScreen?: () => void;
  isIncoming?: boolean;
  incomingSignal?: any;
  isMinimized?: boolean;
  onMinimize?: () => void;
  onExpand?: () => void;
}

export function VideoCall({ swapper, onClose, onToggleScreen, isIncoming = false, incomingSignal, isMinimized, onMinimize, onExpand }: VideoCallProps) {
  const { auth } = useAuth();
  const { showToast } = useToast();
  const { isInitiating } = useCall(); // Use global guard from context
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callAccepted, setCallAccepted] = useState(false);
  
  const myVideo = useRef<HTMLVideoElement | null>(null);
  const userVideo = useRef<HTMLVideoElement | null>(null);
  const connectionRef = useRef<Peer.Instance | null>(null);
  const outgoingToneRef = useRef<HTMLAudioElement | null>(null);
  const hasStarted = useRef(false);
  const mounted = useRef(true);
  const isConnectedRef = useRef(false);
  const secondsRef = useRef(0);

  // Buffers for signaling
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
    if (isIncoming && isInitiating.current) return; // Guard for receiver re-mount
    
    hasStarted.current = true;
    if (isIncoming) isInitiating.current = true; // Mark as initiating for receiver too

    console.log(`[${isIncoming ? 'Receiver' : 'Caller'}] Component Mounted. Swapper:`, swapper.name);

    if (!isIncoming) {
      outgoingToneRef.current = new Audio('/music/call-tone.mp3');
      outgoingToneRef.current.loop = true;
      outgoingToneRef.current.play().catch((err: any) => console.error("Outgoing tone failed:", err));
    }

    // Capture camera and microphone with more flexible constraints
    const constraints = {
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: 'user'
      },
      audio: true
    };

    console.log(`[Video][${isIncoming ? 'Receiver' : 'Caller'}] Requesting media...`);
    
    navigator.mediaDevices.getUserMedia(constraints).then((currentStream) => {
      console.log(`[Video][${isIncoming ? 'Receiver' : 'Caller'}] Media stream captured.`);
      
      // Ensure audio track is enabled on start
      if (currentStream.getAudioTracks().length > 0) {
        currentStream.getAudioTracks()[0].enabled = true;
      }

      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }

      if (!isIncoming) {
        callUser(currentStream);
      }
    }).catch(err => {
      console.error("[Video] getUserMedia error:", err);
      
      // Detailed error analysis for the user
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        showToast("Camera or Microphone permission denied.", "error");
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        showToast("No camera or microphone found on this device.", "error");
      } else {
        showToast("Could not access camera or microphone.", "error");
      }
      
      onClose();
    });

    // Listen for accepted call (For Caller)
    socketService.on('call_accepted', (signal: any) => {
      if (mounted.current) {
        console.log("[Caller] call_accepted received from server.");
        setCallAccepted(true);
        if (connectionRef.current && !connectionRef.current.destroyed) {
          console.log("[Caller] Applying answer signal to peer...");
          try {
            connectionRef.current.signal(signal);
          } catch (err) {
            console.error("[Caller] Signal error (accepted):", err);
          }
        } else {
          console.log("[Caller] Buffering answer signal (peer not ready).");
          acceptedSignalBuffer.current = signal;
        }
      }
    });

    // Listen for ICE candidates (Both)
    socketService.on('ice_candidate', (candidate: any) => {
      if (mounted.current) {
        if (connectionRef.current && !connectionRef.current.destroyed) {
          try {
            connectionRef.current.signal(candidate);
          } catch (err) {
            console.error(`[${isIncoming ? 'Receiver' : 'Caller'}] Signal error (ICE):`, err);
          }
        } else {
          candidatesBuffer.current.push(candidate);
        }
      }
    });

    socketService.on('call_ended', () => {
      if (mounted.current) {
        console.log("Remote user ended the call signal received.");
        onClose(isConnectedRef.current ? formatTime(secondsRef.current) : undefined);
      }
    });

    return () => {
      console.log(`[${isIncoming ? 'Receiver' : 'Caller'}] Cleaning up...`);
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
    console.log("[Caller] Creating Peer instance (Initiator)...");
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
        console.log("[Caller] Offer signal generated. Emitting call_user.");
        socketService.emit('call_user', {
          userToCall: swapper.id,
          signalData: data,
          from: auth.id,
          name: auth.name || 'User',
          callType: 'video'
        });
      } else if ('candidate' in data) {
        socketService.emit('ice_candidate', { to: swapper.id, candidate: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log("[Caller] Remote stream received!");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('connect', () => {
      console.log("[Caller] WebRTC Connected Event Fired!");
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('error', (err) => {
      console.error("[Caller] WebRTC Error:", err);
      onClose();
    });

    connectionRef.current = peer;

    // Apply buffered signals if any (unlikely for caller but for safety)
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

    console.log("[Receiver] Creating Peer instance (Answerer)...");
    acceptCall(); // Stops the ringtone
    setCallAccepted(true);
    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream: mediaStream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:stun1.l.google.com:19302' },
        ]
      }
    });

    peer.on('signal', (data) => {
      if (data.type === 'answer') {
        console.log("[Receiver] Answer signal generated. Emitting answer_call.");
        socketService.emit('answer_call', { signal: data, to: swapper.id });
      } else if ('candidate' in data) {
        socketService.emit('ice_candidate', { to: swapper.id, candidate: data });
      }
    });

    peer.on('stream', (remoteStream) => {
      console.log("[Receiver] Remote stream received!");
      if (userVideo.current) {
        userVideo.current.srcObject = remoteStream;
      }
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('connect', () => {
      console.log("[Receiver] WebRTC Connected Event Fired!");
      setIsConnected(true);
      isConnectedRef.current = true;
    });

    peer.on('error', (err) => {
      console.error("[Receiver] WebRTC Error:", err);
      onClose();
    });

    connectionRef.current = peer;

    // CRITICAL: Apply the initial offer from caller
    if (incomingSignal) {
      console.log("[Receiver] Applying initial offer signal to peer...");
      try {
        peer.signal(incomingSignal);
      } catch (err) {
        console.error("[Receiver] Signal error (answer init):", err);
      }
    }

    // Apply buffered candidates
    console.log(`[Receiver] Applying ${candidatesBuffer.current.length} buffered candidates.`);
    candidatesBuffer.current.forEach(c => peer.signal(c));
    candidatesBuffer.current = [];
  };

  useEffect(() => {
    let timer: any;
    if (isConnected) {
      if (outgoingToneRef.current) {
        outgoingToneRef.current.pause();
      }
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
    <div className={`absolute inset-0 bg-black z-50 flex flex-col fade-in-1 overflow-hidden transition-all duration-500 ${isMinimized ? 'opacity-0 pointer-events-none translate-y-10' : 'opacity-100'}`}>
      {/* Remote Video Feed */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <video
          playsInline
          ref={userVideo}
          autoPlay
          className={`w-full h-full object-cover transition-all duration-1000 ${isConnected ? 'opacity-100' : 'opacity-0 scale-110 blur-xl'}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60" />
      </div>

      {/* Header Overlay */}
      <div className="p-4 sm:p-6 flex justify-between items-center absolute top-0 left-0 right-0 z-30">
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-white font-black text-lg tracking-tight">{swapper.name}</h2>
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`} />
            <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest">
              {isConnected ? formatTime(seconds) : callAccepted ? 'Connecting...' : 'Ringing...'}
            </span>
          </div>
        </div>
        <button className="text-white/50 hover:text-white flex items-center gap-2 bg-black/20 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10" onClick={() => onMinimize?.()}>
          <Minimize2 className="w-4 h-4" /> Minimize
        </button>
      </div>

      {/* Overlay Body */}
      <div className="flex-1 relative flex items-center justify-center p-6 z-10">
        {!isConnected && (
          <div className="flex flex-col items-center relative z-10">
            <div className="relative mb-8">
              <div className="w-40 h-40 rounded-[3rem] bg-gradient-to-br from-purple-600/20 to-blue-600/20 p-1 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center justify-center overflow-hidden">
                <AvatarIcon name={swapper?.name || 'User'} className="w-20 h-20 text-purple-400" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tighter drop-shadow-2xl text-center px-4">{swapper.name}</h2>
          </div>
        )}

        <div className={`absolute bottom-32 right-12 w-48 h-32 bg-gray-900 rounded-2xl border border-white/20 shadow-2xl overflow-hidden transition-all duration-500 z-30 ${stream ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <video playsInline muted ref={myVideo} autoPlay className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Footer Controls */}
      <div className="h-32 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center gap-6 pb-4 z-40">
        {!isConnected && isIncoming ? (
          <div className="flex items-center gap-12 bg-white/5 backdrop-blur-3xl p-6 rounded-[3rem] border border-white/10 shadow-2xl">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => answerCall()}
              className="w-20 h-20 rounded-3xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/40 relative"
            >
              <div className="absolute inset-0 rounded-3xl bg-emerald-500 animate-ping opacity-20" />
              <Video size={28} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onClose()}
              className="w-20 h-20 rounded-3xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/40"
            >
              <PhoneOff size={28} />
            </motion.button>
          </div>
        ) : (
          <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <motion.button 
              whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (stream) stream.getAudioTracks()[0].enabled = isMuted;
                setIsMuted(!isMuted);
              }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${isMuted ? 'bg-red-500' : 'bg-white/10'}`}
            >
              {isMuted ? <MicOff /> : <Mic />}
            </motion.button>
            
            <motion.button 
              whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (stream) stream.getVideoTracks()[0].enabled = !isCameraOn;
                setIsCameraOn(!isCameraOn);
              }}
              className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${!isCameraOn ? 'bg-red-500' : 'bg-white/10'}`}
            >
              {isCameraOn ? <Video /> : <VideoOff />}
            </motion.button>

            {onToggleScreen && (
              <motion.button 
                whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.9 }}
                onClick={onToggleScreen}
                className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-gray-300 hover:bg-purple-600 transition-all"
                title="Share Screen"
              >
                <Monitor size={20} />
              </motion.button>
            )}
  
            <motion.button 
              whileHover={{ scale: 1.1, y: -5 }} whileTap={{ scale: 0.9 }}
              onClick={() => setShowConfirm(true)}
              className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center text-white"
            >
              <PhoneOff />
            </motion.button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="max-w-xs w-full bg-gray-900 border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
              <h3 className="text-xl font-bold text-white mb-2">End Call?</h3>
              <div className="flex flex-col gap-3 mt-6">
                <button onClick={handleEndCall} className="w-full py-3.5 rounded-2xl bg-red-600 text-white font-bold">End Call</button>
                <button onClick={() => setShowConfirm(false)} className="w-full py-3.5 rounded-2xl bg-white/5 text-gray-300 font-bold">Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
