// ============================================
// HackTrack - Event Approvals Page
// ============================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import type { HackathonEvent } from '@/types';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  ArrowLeft,
  Clock,
  User,
  FileText,
  Globe,
  Building,
  Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const EventApprovalsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [pendingEvents, setPendingEvents] = useState<HackathonEvent[]>([]);
  const [approvedEvents, setApprovedEvents] = useState<HackathonEvent[]>([]);
  const [rejectedEvents, setRejectedEvents] = useState<HackathonEvent[]>([]);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = () => {
    const allEvents = Database.Event.getAll();
    setEvents(allEvents);
    setPendingEvents(allEvents.filter(e => e.status === 'pending'));
    setApprovedEvents(allEvents.filter(e => e.status === 'approved' || e.status === 'published'));
    setRejectedEvents(allEvents.filter(e => e.status === 'rejected'));
  };

  const handleApprove = (eventId: string) => {
    if (!user) return;
    Database.Event.approve(eventId, user.id);
    toast.success('Event approved successfully');
    loadEvents();
  };

  const handleReject = (eventId: string) => {
    if (!user) return;
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      Database.Event.reject(eventId, reason);
      toast.success('Event rejected');
      loadEvents();
    }
  };

  const handleDelete = (eventId: string) => {
    Database.Event.delete(eventId);
    toast.success('Event deleted');
    loadEvents();
  };

  const EventCard = ({ event, showActions = false }: { event: HackathonEvent; showActions?: boolean }) => {
    const creator = Database.User.getById(event.createdBy);
    
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                event.isOnline ? 'bg-cyan-500/20' : 'bg-purple-500/20'
              }`}>
                {event.isOnline ? (
                  <Globe className="w-6 h-6 text-cyan-400" />
                ) : (
                  <Building className="w-6 h-6 text-purple-400" />
                )}
              </div>
              <div>
                <Link to={`/events/${event.id}`}>
                  <h4 className="text-white font-medium hover:text-indigo-400 transition-colors">{event.title}</h4>
                </Link>
                <p className="text-slate-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(event.eventDate).toLocaleDateString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {creator?.email || 'Unknown'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Submitted {new Date(event.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {event.rejectionReason && (
                  <p className="text-red-400 text-sm mt-2">
                    Rejection reason: {event.rejectionReason}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link to={`/events/${event.id}`}>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                  <Eye className="w-4 h-4" />
                </Button>
              </Link>
              {showActions && (
                <>
                  <Button
                    onClick={() => handleApprove(event.id)}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={() => handleReject(event.id)}
                    variant="destructive"
                    size="sm"
                  >
                    <XCircle className="w-4 h-4 mr-1" />
                    Reject
                  </Button>
                </>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                    <FileText className="w-4 h-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-white">Delete Event</AlertDialogTitle>
                    <AlertDialogDescription className="text-slate-400">
                      Are you sure you want to delete this event? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="bg-slate-700 text-white">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(event.id)} className="bg-red-600 hover:bg-red-700">
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/admin">
          <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Event Approvals</h1>
          <p className="text-slate-400">
            Review and manage hackathon events
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendingEvents.length}</p>
            <p className="text-slate-400 text-sm">Pending</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-400">{approvedEvents.length}</p>
            <p className="text-slate-400 text-sm">Approved</p>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-red-400">{rejectedEvents.length}</p>
            <p className="text-slate-400 text-sm">Rejected</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pending">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="pending" className="data-[state=active]:bg-yellow-500 data-[state=active]:text-white">
            Pending ({pendingEvents.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="data-[state=active]:bg-green-500 data-[state=active]:text-white">
            Approved ({approvedEvents.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
            Rejected ({rejectedEvents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6 space-y-3">
          {pendingEvents.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <CheckCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No pending events</h3>
                <p className="text-slate-400">All events have been reviewed</p>
              </CardContent>
            </Card>
          ) : (
            pendingEvents.map(event => (
              <EventCard key={event.id} event={event} showActions />
            ))
          )}
        </TabsContent>

        <TabsContent value="approved" className="mt-6 space-y-3">
          {approvedEvents.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No approved events</h3>
                <p className="text-slate-400">Events will appear here after approval</p>
              </CardContent>
            </Card>
          ) : (
            approvedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6 space-y-3">
          {rejectedEvents.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No rejected events</h3>
                <p className="text-slate-400">Rejected events will appear here</p>
              </CardContent>
            </Card>
          ) : (
            rejectedEvents.map(event => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EventApprovalsPage;
