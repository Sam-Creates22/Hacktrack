// ============================================
// HackTrack - Notifications Page
// ============================================

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  CheckCircle, 
  User, 
  Calendar, 
  FileText, 
  AlertCircle,
  Trash2,
  CheckCheck,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const NotificationsPage: React.FC = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'user_approved':
        return <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><User className="w-5 h-5 text-green-400" /></div>;
      case 'user_rejected':
        return <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><User className="w-5 h-5 text-red-400" /></div>;
      case 'event_uploaded':
        return <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center"><FileText className="w-5 h-5 text-blue-400" /></div>;
      case 'event_approved':
        return <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center"><Calendar className="w-5 h-5 text-green-400" /></div>;
      case 'event_rejected':
        return <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center"><Calendar className="w-5 h-5 text-red-400" /></div>;
      case 'reminder':
        return <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-400" /></div>;
      default:
        return <div className="w-10 h-10 rounded-full bg-slate-500/20 flex items-center justify-center"><Bell className="w-5 h-5 text-slate-400" /></div>;
    }
  };

  const getNotificationLink = (notification: any) => {
    switch (notification.type) {
      case 'event_approved':
      case 'event_rejected':
        if (notification.data?.eventId) {
          return `/events/${notification.data.eventId}`;
        }
        return '/events';
      case 'event_uploaded':
        return '/admin/events';
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
          <p className="text-slate-400">
            Stay updated with your hackathon activities
          </p>
        </div>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            className="border-slate-700 text-slate-300"
          >
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-white">{notifications.length}</p>
            <p className="text-slate-400 text-sm">Total</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-indigo-400">{unreadCount}</p>
            <p className="text-slate-400 text-sm">Unread</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {notifications.filter(n => n.type === 'event_approved').length}
            </p>
            <p className="text-slate-400 text-sm">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">
              {notifications.filter(n => n.type === 'reminder').length}
            </p>
            <p className="text-slate-400 text-sm">Reminders</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-0">
          {notifications.length === 0 ? (
            <div className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No notifications yet</h3>
              <p className="text-slate-400">
                You'll receive notifications about events, reminders, and updates here.
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-slate-700">
                {notifications.map((notification) => {
                  const link = getNotificationLink(notification);
                  const content = (
                    <div
                      className={`p-4 flex items-start gap-4 hover:bg-slate-700/30 transition-colors ${
                        !notification.isRead ? 'bg-indigo-500/5' : ''
                      }`}
                    >
                      {getNotificationIcon(notification.type)}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h4 className={`font-medium ${!notification.isRead ? 'text-white' : 'text-slate-300'}`}>
                              {notification.title}
                            </h4>
                            <p className="text-slate-400 text-sm mt-1">
                              {notification.message}
                            </p>
                            <p className="text-slate-500 text-xs mt-2">
                              {new Date(notification.createdAt).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {!notification.isRead && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => markAsRead(notification.id)}
                                className="text-slate-400 hover:text-indigo-400"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteNotification(notification.id)}
                              className="text-slate-400 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-2" />
                      )}
                    </div>
                  );

                  return link ? (
                    <Link key={notification.id} to={link} onClick={() => !notification.isRead && markAsRead(notification.id)}>
                      {content}
                    </Link>
                  ) : (
                    <div key={notification.id}>{content}</div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationsPage;
