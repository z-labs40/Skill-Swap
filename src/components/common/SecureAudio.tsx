import React, { useState, useEffect, useRef } from 'react';
import { decryptBuffer } from '../../utils/crypto';
import { Play, Pause, Loader2 } from 'lucide-react';

interface SecureAudioProps {
  url: string;
  className?: string;
}

export const SecureAudio: React.FC<SecureAudioProps> = ({ url, className = "" }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const fetchAndDecrypt = async () => {
      if (!url) return;
      setLoading(true);
      setError(false);
      try {
        const response = await fetch(url);
        const encryptedData = await response.arrayBuffer();
        const decryptedData = await decryptBuffer(encryptedData);
        
        const blob = new Blob([decryptedData], { type: 'audio/wav' });
        objectUrl = URL.createObjectURL(blob);
        setAudioUrl(objectUrl);
      } catch (err) {
        console.error('Failed to decrypt audio:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAndDecrypt();

    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [url]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-white/5 rounded-2xl border border-white/10 ${className}`}>
        <Loader2 className="w-5 h-5 animate-spin text-purple-400" />
        <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Decrypting Voice...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center gap-3 p-3 bg-red-500/10 rounded-2xl border border-red-500/20 ${className}`}>
        <span className="text-[10px] text-red-400 font-bold">Failed to load audio</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm ${className}`}>
      <audio 
        ref={audioRef} 
        src={audioUrl || ""} 
        onEnded={() => setIsPlaying(false)}
        className="hidden" 
      />
      <button 
        onClick={togglePlay}
        className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-500/20 hover:scale-105 active:scale-95 transition-all"
      >
        {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
      </button>
      <div className="flex-1 flex flex-col gap-1 min-w-[120px]">
        <div className="flex items-end gap-0.5 h-6">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i} 
              className={`w-1 rounded-full transition-all duration-300 ${isPlaying ? 'bg-purple-400 animate-pulse' : 'bg-white/20'}`} 
              style={{ 
                height: `${20 + Math.random() * 80}%`,
                animationDelay: `${i * 0.05}s`
              }}
            />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <span className="text-[8px] text-purple-400 font-bold uppercase tracking-widest">Encrypted Voice</span>
        </div>
      </div>
    </div>
  );
};
