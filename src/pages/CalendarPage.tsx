// ============================================
// HackTrack - Calendar Page
// ============================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import type { HackathonEvent } from '@/types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Globe,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const CalendarPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      loadEvents();
      checkCalendarConnection();
    }
  }, [user]);

  const loadEvents = () => {
    if (!user) return;
    const allEvents = Database.Event.getVisibleToUser(user.id, user.role);
    const approvedEvents = allEvents.filter(e => e.status === 'approved' || e.status === 'published');
    setEvents(approvedEvents);
  };

  const checkCalendarConnection = () => {
    if (!user) return;
    const sync = Database.Calendar.getByUser(user.id);
    setIsConnected(sync?.isConnected || false);
  };

  const handleConnectGoogle = async () => {
    setIsConnecting(true);
    try {
      const result = await Database.Calendar.initiateGoogleAuth();
      if (result.success) {
        if (user) {
          Database.Calendar.createOrUpdate(user.id, { isConnected: true });
        }
        setIsConnected(true);
        toast.success('Successfully connected to Google Calendar!');
      } else {
        toast.error(result.error || 'Failed to connect');
      }
    } catch (error) {
      toast.error('An error occurred');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (!user) return;
    Database.Calendar.disconnect(user.id);
    setIsConnected(false);
    toast.success('Disconnected from Google Calendar');
  };

  // Calendar navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  // Get days in month
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  // Get events for a specific day
  const getEventsForDay = (day: number) => {
    const date = new Date(year, month, day);
    return events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate.getDate() === date.getDate() &&
             eventDate.getMonth() === date.getMonth() &&
             eventDate.getFullYear() === date.getFullYear();
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Calendar</h1>
          <p className="text-slate-400">
            View and manage your hackathon schedule
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isConnected ? (
            <Button
              variant="outline"
              onClick={handleDisconnect}
              className="border-green-500/30 text-green-400 hover:bg-green-500/10"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Google Connected
            </Button>
          ) : (
            <Button
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              {isConnecting ? (
                <>
                  <div className="w-4 h-4 mr-2 animate-spin border-2 border-white border-t-transparent rounded-full" />
                  Connecting...
                </>
              ) : (
                <>
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect Google Calendar
                </>
              )}
            </Button>
          )}
          <Link to="/events/upload">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Event
            </Button>
          </Link>
        </div>
      </div>

      {/* Calendar Card */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={prevMonth} className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setCurrentDate(new Date())}
                className="text-slate-400 hover:text-white"
              >
                Today
              </Button>
              <Button variant="ghost" size="icon" onClick={nextMonth} className="text-slate-400 hover:text-white">
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map(day => (
              <div key={day} className="text-center text-sm font-medium text-slate-500 py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty cells for days before the first day */}
            {Array.from({ length: firstDay }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {/* Days */}
            {Array.from({ length: daysInMonth }).map((_, dayIndex) => {
              const day = dayIndex + 1;
              const dayEvents = getEventsForDay(day);
              const isToday = new Date().getDate() === day && 
                             new Date().getMonth() === month && 
                             new Date().getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`aspect-square border border-slate-700/50 rounded-lg p-2 transition-colors hover:bg-slate-700/30 ${
                    isToday ? 'bg-indigo-500/10 border-indigo-500/30' : ''
                  }`}
                >
                  <div className={`text-sm font-medium mb-1 ${isToday ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {day}
                  </div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event, idx) => (
                      <Link key={event.id} to={`/events/${event.id}`}>
                        <div
                          className={`text-xs truncate px-1.5 py-0.5 rounded ${
                            event.isOnline 
                              ? 'bg-cyan-500/20 text-cyan-400' 
                              : 'bg-purple-500/20 text-purple-400'
                          }`}
                          title={event.title}
                        >
                          {event.title.slice(0, 15)}{event.title.length > 15 ? '...' : ''}
                        </div>
                      </Link>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-slate-500 px-1.5">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events List */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Upcoming Events</h3>
        <div className="space-y-3">
          {events
            .filter(e => new Date(e.eventDate) >= new Date())
            .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
            .slice(0, 5)
            .map(event => (
              <Link key={event.id} to={`/events/${event.id}`}>
                <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-colors">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      event.isOnline ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                    }`}>
                      {event.isOnline ? (
                        <Globe className="w-6 h-6 text-cyan-400" />
                      ) : (
                        <Building className="w-6 h-6 text-purple-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{event.title}</h4>
                      <p className="text-slate-400 text-sm">
                        {new Date(event.eventDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <Badge variant="outline" className={event.isOnline ? 'text-cyan-400 border-cyan-500/30' : 'text-purple-400 border-purple-500/30'}>
                      {event.isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          {events.filter(e => new Date(e.eventDate) >= new Date()).length === 0 && (
            <div className="text-center py-8">
              <CalendarIcon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500">No upcoming events</p>
              <Link to="/events/upload">
                <Button variant="link" className="text-indigo-400 mt-2">
                  Add an event
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage;
