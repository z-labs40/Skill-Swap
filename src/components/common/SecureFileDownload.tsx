import React, { useState } from 'react';
import { decryptBuffer } from '../../utils/crypto';
import { FileIcon, Download, Loader2 } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

interface SecureFileDownloadProps {
  url: string;
  fileName: string;
  className?: string;
}

export const SecureFileDownload: React.FC<SecureFileDownloadProps> = ({ url, fileName, className = "" }) => {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleDownload = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const response = await fetch(url);
      const encryptedData = await response.arrayBuffer();
      const decryptedData = await decryptBuffer(encryptedData);
      
      const blob = new Blob([decryptedData], { type: 'application/octet-stream' });
      const objectUrl = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error('Failed to decrypt and download file:', err);
      showToast('Failed to download secure file.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 w-64 backdrop-blur-sm ${className}`}>
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-purple-400 shrink-0">
        <FileIcon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-white font-bold text-sm truncate">{fileName}</h4>
        <p className="text-[10px] text-gray-500 uppercase tracking-widest">Encrypted File</p>
      </div>
      <button 
        onClick={handleDownload}
        disabled={loading}
        className="w-10 h-10 rounded-xl hover:bg-white/10 flex items-center justify-center text-gray-400 transition-all active:scale-95 disabled:opacity-50"
      >
        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
      </button>
    </div>
  );
};
