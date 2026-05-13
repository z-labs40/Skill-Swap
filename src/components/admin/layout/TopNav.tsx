import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  LayoutDashboard, 
  Users, 
  BarChart3, 
  MessageSquare, 
  User, 
  Settings,
  Menu
} from 'lucide-react';

interface TopNavProps {
  activeTab: string;
  onMenuClick: () => void;
}

export function TopNav({ activeTab, onMenuClick }: TopNavProps) {
  const navigate = useNavigate();

  return (
    <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 sm:px-8 bg-black/20 backdrop-blur-md sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 text-gray-500 hover:text-white mr-1"
        >
          <Menu size={20} />
        </button>
        <div className="hidden sm:flex w-10 h-10 bg-purple-600/10 rounded-xl items-center justify-center border border-purple-500/20 text-purple-400">
          {activeTab === 'Dashboard' && <LayoutDashboard size={20} />}
          {activeTab === 'User Management' && <Users size={20} />}
          {activeTab === 'Skill Analytics' && <BarChart3 size={20} />}
          {activeTab === 'Messages & Support' && <MessageSquare size={20} />}
          {activeTab === 'Profile' && <User size={20} />}
          {activeTab === 'Settings' && <Settings size={20} />}
        </div>
        <div>
          <h1 className="text-white font-bold text-lg leading-tight tracking-tight">{activeTab}</h1>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/admin/support')}
          className="p-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-gray-400 hover:text-white transition-all relative"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-purple-500 rounded-full border border-[#0a0a0b]" />
        </button>

        <div className="flex items-center gap-3 pl-4 border-l border-white/10">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white">Admin User</p>
            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase">SkillBridge Official</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center font-bold text-white text-sm shadow-lg shadow-purple-500/20">
            AD
          </div>
        </div>
      </div>
    </header>
  );
}
