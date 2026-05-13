import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { socketService } from '../services/socketService';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';
import { chatService } from '../services/chatService';
import { useToast } from './ToastContext';

interface CallContextType {
  callState: 'none' | 'voice' | 'video' | 'screen';
  incomingCall: any | null;
  activeSwapper: any | null;
  startCall: (swapper: any, type: 'voice' | 'video' | 'screen') => void;
  acceptCall: () => void;
  endCall: (duration?: string) => void;
  setIncomingCall: (call: any | null) => void;
  isInitiating: React.MutableRefObject<boolean>;
  isScreenSetupConfirmed: boolean;
  setScreenSetupConfirmed: (val: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (val: boolean) => void;
}

const CallContext = createContext<CallContextType | undefined>(undefined);

export function CallProvider({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth();
  const { showToast } = useToast();
  const [callState, setCallState] = useState<'none' | 'voice' | 'video' | 'screen'>('none');
  const [incomingCall, setIncomingCall] = useState<any | null>(null);
  const [activeSwapper, setActiveSwapper] = useState<any | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const checkConnection = () => {
      if (auth.id) {
        console.log('CallContext: Ensuring socket connection for:', auth.id);
        socketService.connect(auth.id);
      }
    };

    checkConnection();

    if (auth.id) {
      const handleIncomingCall = async (data: any) => {
        console.log('Incoming call received:', data);

        const initialSwapper = {
          id: data.from,
          name: data.name || 'Incoming Call',
          avatar: (data.name || 'U').charAt(0)
        };

        setIncomingCall({ ...data, swapper: initialSwapper });
        setActiveSwapper(initialSwapper);
        setCallState(data.callType);
        setIsAnswered(false);

        try {
          const profile = await userService.getProfile(data.from);
          if (profile) {
            const enrichedSwapper = {
              ...profile,
              id: data.from,
              avatarUrl: profile.avatar_url,
              avatar: profile.name?.charAt(0) || 'U'
            };
            setIncomingCall((prev: any) => prev ? { ...prev, swapper: enrichedSwapper } : null);
            setActiveSwapper(enrichedSwapper);
          }
        } catch (err) {
          console.error('Error enriching caller profile:', err);
        }
      };

      console.log('CallContext: Registering call_incoming listener for user:', auth.id);
      socketService.on('call_incoming', handleIncomingCall);

      return () => {
        socketService.off('call_incoming', handleIncomingCall);
      };
    }
  }, [auth.id]);

  useEffect(() => {
    let audio: HTMLAudioElement | null = null;

    // Play ringtone if there's an incoming call that hasn't been answered yet
    if (incomingCall && !isAnswered) {
      const ringtoneUrl = incomingCall.swapper?.ringtone_url || '/music/call-tone.mp3';
      audio = new Audio(ringtoneUrl);
      audio.loop = true;
      audio.play().catch(err => console.error("Ringtone play failed:", err));
    }

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, [incomingCall, isAnswered]);

  const isInitiating = useRef(false);

  const [isScreenSetupConfirmed, setScreenSetupConfirmed] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const startCall = (swapper: any, type: 'voice' | 'video' | 'screen') => {
    if (isInitiating.current) return;
    isInitiating.current = true;

    console.log('Starting call to:', swapper?.id, 'type:', type);
    if (!swapper) {
      console.error('No swapper provided to startCall');
      showToast("Cannot start call: Swapper profile not loaded", "error");
      isInitiating.current = false;
      return;
    }

    if (type === 'screen') {
      setScreenSetupConfirmed(false); // Always show setup for screen share
    }

    setActiveSwapper(swapper);
    setCallState(type);
    setIncomingCall(null);
    setIsAnswered(false); // Wait for remote to answer
  };

  const acceptCall = () => {
    console.log('Accepting incoming call from:', incomingCall?.from);
    if (incomingCall) {
      setActiveSwapper(incomingCall.swapper);
      setCallState(incomingCall.callType);
      setIsAnswered(true);
      if (incomingCall.callType === 'screen') {
        setScreenSetupConfirmed(true); // Receiver doesn't need setup
      }
    }
  };

  const endCall = async (duration?: string) => {
    if (callState === 'none') return; // Already ended

    console.log('Ending call. Duration:', duration);
    const targetId = activeSwapper?.id || incomingCall?.from;
    const currentCallState = callState;
    const currentIncomingCall = incomingCall; // Capture before reset

    // Reset state first to prevent loops
    setCallState('none');
    setIncomingCall(null);
    setActiveSwapper(null);
    setIsAnswered(false);
    isInitiating.current = false; // Reset initiation guard
    setScreenSetupConfirmed(false);
    setIsMinimized(false);

    if (targetId) {
      socketService.emit('end_call', { to: targetId });

      // Save call history
      if (auth.id && (currentCallState as any) !== 'none') {
        const typeLabel = (currentCallState as string).charAt(0).toUpperCase() + (currentCallState as string).slice(1);

        // Accurate identification of the person who INITIATED the call
        // If we are the receiver (incomingCall exists), the initiator is the person who called us.
        // If we are the caller (incomingCall is null), the initiator is US (auth.name).
        const initiatorName = currentIncomingCall ? (currentIncomingCall.name || 'User') : (auth.name || 'Caller');

        const historyMsg = duration
          ? `${typeLabel} Call from ${initiatorName} Ended`
          : `Missed ${typeLabel} Call from ${initiatorName}`;

        console.log('Saving call history message:', historyMsg);

        try {
          const savedMsg = await chatService.sendMessage(auth.id, targetId, historyMsg, 'call', duration);
          socketService.emit('send_private_message', {
            senderId: auth.id,
            receiverId: targetId,
            message: historyMsg,
            type: 'call',
            fileUrl: duration,
            timestamp: new Date().toISOString(),
            id: savedMsg.id
          });
        } catch (err) {
          console.error("Failed to save call history:", err);
        }
      }
    }
  };

  return (
    <CallContext.Provider value={{
      callState,
      incomingCall,
      activeSwapper,
      startCall,
      acceptCall,
      endCall,
      setIncomingCall,
      isInitiating,
      isScreenSetupConfirmed,
      setScreenSetupConfirmed,
      isMinimized,
      setIsMinimized
    }}>
      {children}
    </CallContext.Provider>
  );
}

export function useCall() {
  const context = useContext(CallContext);
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider');
  }
  return context;
}
