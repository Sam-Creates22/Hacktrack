// ============================================
// HackTrack - Events List Page
// ============================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import type { HackathonEvent } from '@/types';
import { 
  Calendar, 
  Plus, 
  Search, 
  Filter, 
  MapPin, 
  Users, 
  Clock,
  ChevronRight,
  Globe,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const EventsPage: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    if (user) {
      loadEvents();
    }
  }, [user]);

  const loadEvents = () => {
    if (!user) return;
    const allEvents = Database.Event.getVisibleToUser(user.id, user.role);
    setEvents(allEvents);
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'upcoming') {
      return matchesSearch && new Date(event.eventDate) > new Date();
    }
    if (activeTab === 'online') {
      return matchesSearch && event.isOnline;
    }
    if (activeTab === 'offline') {
      return matchesSearch && !event.isOnline;
    }
    if (activeTab === 'my-events') {
      return matchesSearch && event.createdBy === user?.id;
    }
    if (activeTab === 'pending' && isAdmin) {
      return matchesSearch && event.status === 'pending';
    }
    return matchesSearch;
  });

  const getDaysUntil = (date: Date) => {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getStatusBadge = (event: HackathonEvent) => {
    if (event.status === 'pending') {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending</Badge>;
    }
    if (event.status === 'approved' || event.status === 'published') {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>;
    }
    if (event.status === 'rejected') {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Hackathon Events</h1>
          <p className="text-slate-400">
            Discover and manage hackathon events
          </p>
        </div>
        <Link to="/events/upload">
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
            <Plus className="w-4 h-4 mr-2" />
            Upload Event
          </Button>
        </Link>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-slate-800/50 border border-slate-700 flex-wrap h-auto">
          <TabsTrigger value="all" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">All Events</TabsTrigger>
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Upcoming</TabsTrigger>
          <TabsTrigger value="online" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Online</TabsTrigger>
          <TabsTrigger value="offline" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">Offline</TabsTrigger>
          <TabsTrigger value="my-events" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">My Events</TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="pending" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
              Pending Approval
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredEvents.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No events found</h3>
                <p className="text-slate-400 mb-4">
                  {searchQuery ? 'Try adjusting your search' : 'Be the first to upload an event!'}
                </p>
                <Link to="/events/upload">
                  <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Upload Event
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event) => (
                <Link key={event.id} to={`/events/${event.id}`}>
                  <Card className="group bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] h-full">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          event.isOnline ? 'bg-cyan-500/20' : 'bg-purple-500/20'
                        }`}>
                          {event.isOnline ? (
                            <Globe className="w-6 h-6 text-cyan-400" />
                          ) : (
                            <Building className="w-6 h-6 text-purple-400" />
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          {getStatusBadge(event)}
                          <div className="w-10 h-10 rounded-lg bg-indigo-500/20 flex items-center justify-center">
                            <span className="text-indigo-400 font-bold text-sm">
                              {getDaysUntil(event.eventDate)}d
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Content */}
                      <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2 group-hover:text-indigo-400 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                        {event.description}
                      </p>

                      {/* Meta */}
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(event.eventDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-4 h-4" />
                          <span className="truncate">{event.isOnline ? 'Online Event' : event.venue}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-400">
                          <Users className="w-4 h-4" />
                          <span>{event.teamSize.min}-{event.teamSize.max} members</span>
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-slate-700 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-slate-400 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>
                            Reg. closes {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventsPage;
