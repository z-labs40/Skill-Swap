import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Users, 
  BarChart3, 
  ShieldCheck, 
  MessageSquare, 
  Settings, 
  LogOut, 
  LayoutDashboard,
  Layout,
  Compass,
  User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { logoutUser } from '../../../lib/auth';


interface SidebarProps {
  activeTab: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ activeTab, isOpen, onClose }: SidebarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear all auth data using the central utility
    logoutUser();
    // Redirect to landing page
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'User Management', icon: Users, path: '/admin/users' },
    { name: 'Skill Analytics', icon: BarChart3, path: '/admin/analytics' },
    { name: 'Messages & Support', icon: MessageSquare, path: '/admin/support' },
    { name: 'Profile', icon: User, path: '/admin/profile' },
  ];


  return (
    <aside className={`w-64 border-r border-white/5 bg-black/20 backdrop-blur-xl flex flex-col fixed inset-y-0 z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Logo */}
      <div className="h-20 border-b border-white/5 bg-gradient-to-b from-purple-600/5 to-transparent flex items-center justify-between px-6">
        <img 
          src="/logo.png" 
          alt="SkillBridge Logo" 
          className="h-12 w-auto object-contain" 
        />
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-gray-500 hover:text-white"
        >
          ✕
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = activeTab === item.name;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`relative group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? 'text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {/* Active Background Glow */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-indigo-600/10 border border-purple-500/30 rounded-2xl shadow-[0_0_20px_rgba(147,51,234,0.1)]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </AnimatePresence>

              {/* Active Left Indicator */}
              {isActive && (
                <motion.div 
                  layoutId="indicator"
                  className="absolute left-0 w-1 h-6 bg-purple-500 rounded-r-full shadow-[0_0_10px_rgba(168,85,247,0.8)]"
                />
              )}

              {/* Icon & Label */}
              <div className={`relative flex items-center gap-3 ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform duration-300`}>
                <item.icon size={20} className={`${isActive ? 'text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]' : 'text-gray-600 group-hover:text-purple-400'} transition-colors`} />
                <span>{item.name}</span>
              </div>
            </Link>
          );
        })}

        <div className="pt-6 mt-6 border-t border-white/5 space-y-2">
          <Link
            to="/landing"
            className="group flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-semibold text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all duration-300"
          >
            <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
              <Layout size={18} />
            </div>
            <span>View Live Site</span>
          </Link>
        </div>
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="group w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-300"
        >
          <div className="p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-colors">
            <LogOut size={18} />
          </div>
          <span>Security Logout</span>
        </button>
      </div>
    </aside>
  );
}
