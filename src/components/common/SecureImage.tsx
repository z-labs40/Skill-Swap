import React, { useState, useEffect } from 'react';
import { decryptBuffer } from '../../utils/crypto';
import { User } from 'lucide-react';

interface SecureImageProps {
  url: string;
  alt?: string;
  className?: string;
  fallback?: React.ReactNode;
}

export const SecureImage: React.FC<SecureImageProps> = ({ url, alt, className, fallback }) => {
  const [decryptedUrl, setDecryptedUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;

    // If it's just an emoji or a single character placeholder, don't treat it as a URL
    if (url.length <= 4) {
      setDecryptedUrl(null);
      return;
    }

    // If it's a regular URL or base64, just use it
    if (!url.includes('cloudinary') || !url.includes('/raw/')) {
      setDecryptedUrl(url);
      return;
    }

    const loadEncryptedImage = async () => {
      try {
        const response = await fetch(url);
        const encryptedBuffer = await response.arrayBuffer();
        const decryptedBuffer = await decryptBuffer(encryptedBuffer);
        
        const blob = new Blob([decryptedBuffer]);
        const blobUrl = URL.createObjectURL(blob);
        setDecryptedUrl(blobUrl);
      } catch (err) {
        console.error('Failed to decrypt image:', err);
        setError(true);
      }
    };

    loadEncryptedImage();

    return () => {
      if (decryptedUrl && decryptedUrl.startsWith('blob:')) {
        URL.revokeObjectURL(decryptedUrl);
      }
    };
  }, [url]);

  // Render placeholder/fallback if error, no url, or it's a short string (emoji/char)
  if (error || !url || url.length <= 4) {
    return (
      <div className={`${className} bg-purple-600/10 text-purple-400 flex items-center justify-center font-bold`}>
        {url && url.length <= 4 ? url : (fallback || <User className="w-1/2 h-1/2" />)}
      </div>
    );
  }

  if (!decryptedUrl) {
    return <div className={`${className} animate-pulse bg-white/5`} />;
  }

  return <img src={decryptedUrl} alt={alt} className={className} />;
};
