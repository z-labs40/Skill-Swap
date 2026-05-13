import React from 'react';
import { SecureImage } from './SecureImage';
import { 
  User,
  Terminal,
  Code2,
  Palette,
  BarChart,
  Music,
  MessageSquare
} from 'lucide-react';

export const AvatarIcon = ({ name, url, className = "w-6 h-6" }: { name: string; url?: string; className?: string }) => {
  if (url) {
    return <SecureImage url={url} alt={name} className={`${className} object-cover rounded-full`} />;
  }
  const icons: Record<string, any> = {
    'Coding': Code2,
    'Design': Palette,
    'Marketing': BarChart,
    'Music': Music,
    'General': User,
    'Chat': MessageSquare,
    'System': Terminal
  };
  const Icon = icons[name] || User;
  return <Icon className={className} />;
};
