import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { getAuthState } from '../lib/auth';
import { socketService } from '../services/socketService';

export function useSwappers() {
  const [swappers, setSwappers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSwappers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { id: currentUserId } = getAuthState();
      const data = await adminService.getAllUsers();
      
      // Filter out the current user and map backend profiles to frontend format
      const mappedData = data
        .filter((u: any) => u.id !== currentUserId)
        .map((u: any) => ({
          ...u,
          avatar: u.name.charAt(0),
          avatarUrl: u.avatar_url,
          offers: u.offers || [],
          seeks: u.seeks || [],
          match: Math.floor(Math.random() * 100), // Random match for UI
          rating: u.rating || 0,
          reports: u.reports || 0,
          status: u.status || 'active',
          isOnline: false // Initial state, will be updated by socket
        }));
      setSwappers(mappedData);
    } catch (err: any) {
      console.error('Failed to load swappers:', err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSwappers();
  }, [loadSwappers]);

  // Real-time Online Status Sync
  useEffect(() => {
    const handleUserOnline = (userId: string) => {
      console.log(`Socket: User ${userId} is ONLINE`);
      setSwappers(prev => prev.map(s => s.id === userId ? { ...s, isOnline: true } : s));
    };

    const handleUserOffline = (userId: string) => {
      console.log(`Socket: User ${userId} is OFFLINE`);
      setSwappers(prev => prev.map(s => s.id === userId ? { ...s, isOnline: false } : s));
    };

    const handleInitialOnlineUsers = (onlineIds: string[]) => {
      console.log('Socket: Initial online users list received:', onlineIds);
      setSwappers(prev => prev.map(s => ({
        ...s,
        isOnline: onlineIds.includes(s.id)
      })));
    };

    socketService.on('user_online', handleUserOnline);
    socketService.on('user_offline', handleUserOffline);
    socketService.on('get_online_users', handleInitialOnlineUsers);

    return () => {
      socketService.off('user_online', handleUserOnline);
      socketService.off('user_offline', handleUserOffline);
      socketService.off('get_online_users', handleInitialOnlineUsers);
    };
  }, []);

  const updateSwapperStatus = async (id: string, status: 'active' | 'suspended' | 'deleted') => {
    try {
      await adminService.updateUserStatus(id, status);
      setSwappers(prev => prev.map(s => s.id === id ? { ...s, status } : s));
      return { success: true };
    } catch (err: any) {
      console.error('Failed to update status:', err);
      return { success: false, error: err.message };
    }
  };

  return { swappers, loading, error, reload: loadSwappers, updateSwapperStatus };
}


