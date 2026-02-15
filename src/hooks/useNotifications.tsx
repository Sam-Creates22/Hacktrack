// ============================================
// HackTrack - Notifications Hook
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { Notification } from '@/types';
import { Database } from '@/services/database';
import { useAuth } from './useAuth';

// ============================================
// Notifications Context Types
// ============================================

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  
  // Actions
  fetchNotifications: () => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
}

// ============================================
// Create Context
// ============================================

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

// ============================================
// Notifications Provider
// ============================================

interface NotificationsProviderProps {
  children: ReactNode;
}

export const NotificationsProvider: React.FC<NotificationsProviderProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = useCallback(() => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    try {
      const userNotifications = Database.Notification.getByUser(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated, fetchNotifications]);

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, fetchNotifications]);

  // Mark notification as read
  const markAsRead = useCallback((id: string) => {
    Database.Notification.markAsRead(id);
    fetchNotifications();
  }, [fetchNotifications]);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    if (!user) return;
    Database.Notification.markAllAsRead(user.id);
    fetchNotifications();
  }, [user, fetchNotifications]);

  // Delete notification
  const deleteNotification = useCallback((id: string) => {
    Database.Notification.delete(id);
    fetchNotifications();
  }, [fetchNotifications]);

  // Add notification (for testing/admin)
  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    Database.Notification.create(notification);
    fetchNotifications();
  }, [fetchNotifications]);

  // Calculate unread count
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const value: NotificationsContextType = {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
};

// ============================================
// Use Notifications Hook
// ============================================

export const useNotifications = (): NotificationsContextType => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};

export default useNotifications;
