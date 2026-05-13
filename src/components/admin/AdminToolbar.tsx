import { Shield, X, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function AdminToolbar() {
  const navigate = useNavigate();

  return (
    <div className="fixed top-0 left-0 right-0 h-14 bg-gradient-to-r from-purple-700 to-indigo-900 z-[100] flex items-center justify-between px-3 md:px-6 shadow-2xl border-b border-white/10">
      <div className="flex items-center gap-2 md:gap-6">
        <button 
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest group shrink-0"
        >
          <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all">
            <ArrowLeft size={16} />
          </div>
          <span className="hidden sm:inline">Back to Dashboard</span>
        </button>

        <div className="h-8 w-[1px] bg-white/10 shrink-0" />

        <div className="flex items-center gap-2 md:gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center shadow-inner shrink-0">
            <Shield size={18} className="text-white fill-white/20" />
          </div>
          <div className="truncate">
            <span className="text-white text-[10px] md:text-[11px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] block leading-none mb-0.5 md:mb-1">Editor Active</span>
            <span className="hidden md:block text-purple-200 text-[10px] font-medium opacity-70 italic">Live Landing Page Management</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-6 shrink-0">
        <span className="hidden lg:inline text-white/40 text-[10px] font-medium italic">Changes are saved to database</span>
        <button 
          onClick={() => navigate('/admin')}
          className="bg-red-500 hover:bg-red-600 text-white text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 md:px-5 py-2 rounded-xl shadow-lg shadow-red-500/20 transition-all flex items-center gap-2 group"
        >
          <X size={14} className="group-hover:rotate-90 transition-transform" /> 
          <span className="hidden xs:inline">Close & Save</span>
          <span className="xs:hidden">Save</span>
        </button>
      </div>
    </div>
  );
}
