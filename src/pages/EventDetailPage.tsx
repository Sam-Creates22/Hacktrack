// ============================================
// HackTrack - Event Detail Page
// ============================================

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import type { HackathonEvent } from '@/types';
import { 
  Calendar, 
  MapPin, 
  Users, 
  Clock, 
  ArrowLeft, 
  Edit, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Globe,
  Building,
  Link as LinkIcon,
  FileText,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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

const EventDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [event, setEvent] = useState<HackathonEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = () => {
    const foundEvent = Database.Event.getById(id!);
    if (foundEvent) {
      setEvent(foundEvent);
    }
    setIsLoading(false);
  };

  const handleApprove = () => {
    if (!event || !user) return;
    Database.Event.approve(event.id, user.id);
    toast.success('Event approved successfully');
    loadEvent();
  };

  const handleReject = () => {
    if (!event || !user) return;
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      Database.Event.reject(event.id, reason);
      toast.success('Event rejected');
      loadEvent();
    }
  };

  const handleDelete = () => {
    if (!event) return;
    Database.Event.delete(event.id);
    toast.success('Event deleted successfully');
    navigate('/events');
  };

  const handleAddToCalendar = () => {
    toast.info('Google Calendar integration coming soon!');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Event Not Found</h2>
        <p className="text-slate-400 mb-4">The event you're looking for doesn't exist.</p>
        <Link to="/events">
          <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Events
          </Button>
        </Link>
      </div>
    );
  }

  const canEdit = event.createdBy === user?.id || isAdmin;
  const canDelete = isAdmin;
  const canApprove = isAdmin && event.status === 'pending';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/events">
        <Button variant="ghost" className="text-slate-400 hover:text-white -ml-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Events
        </Button>
      </Link>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Badge 
              variant="outline" 
              className={event.isOnline ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}
            >
              {event.isOnline ? 'Online' : 'Offline'}
            </Badge>
            {event.status === 'pending' && (
              <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pending Approval</Badge>
            )}
            {event.status === 'approved' && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Approved</Badge>
            )}
            {event.status === 'rejected' && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rejected</Badge>
            )}
          </div>
          <h1 className="text-3xl font-bold text-white">{event.title}</h1>
        </div>

        <div className="flex items-center gap-2">
          {canApprove && (
            <>
              <Button 
                onClick={handleApprove}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve
              </Button>
              <Button 
                onClick={handleReject}
                variant="destructive"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject
              </Button>
            </>
          )}
          {canEdit && (
            <Button variant="outline" className="border-slate-700 text-slate-300">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          )}
          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
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
                  <AlertDialogCancel className="bg-slate-700 text-white hover:bg-slate-600">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                About This Event
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-300 whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>

          {/* Instructions */}
          {event.instructions && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-400" />
                  Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 whitespace-pre-wrap">{event.instructions}</p>
              </CardContent>
            </Card>
          )}

          {/* AI Extracted Data */}
          {event.extractedData && (
            <Card className="bg-gradient-to-r from-indigo-900/30 to-purple-900/30 border-indigo-500/30">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  AI Extracted Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {event.extractedData.eventName && (
                    <div>
                      <p className="text-slate-400 text-sm">Event Name</p>
                      <p className="text-white">{event.extractedData.eventName}</p>
                    </div>
                  )}
                  {event.extractedData.date && (
                    <div>
                      <p className="text-slate-400 text-sm">Date</p>
                      <p className="text-white">{event.extractedData.date}</p>
                    </div>
                  )}
                  {event.extractedData.time && (
                    <div>
                      <p className="text-slate-400 text-sm">Time</p>
                      <p className="text-white">{event.extractedData.time}</p>
                    </div>
                  )}
                  {event.extractedData.venue && (
                    <div>
                      <p className="text-slate-400 text-sm">Venue</p>
                      <p className="text-white">{event.extractedData.venue}</p>
                    </div>
                  )}
                  {event.extractedData.teamSize && (
                    <div>
                      <p className="text-slate-400 text-sm">Team Size</p>
                      <p className="text-white">{event.extractedData.teamSize}</p>
                    </div>
                  )}
                  {event.extractedData.registrationDeadline && (
                    <div>
                      <p className="text-slate-400 text-sm">Registration Deadline</p>
                      <p className="text-white">{event.extractedData.registrationDeadline}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Event Details */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-indigo-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-sm">Date</p>
                  <p className="text-white">
                    {new Date(event.eventDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  {event.endDate && (
                    <p className="text-slate-400 text-sm">
                      to {new Date(event.endDate).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  )}
                </div>
              </div>

              {event.startTime && (
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-indigo-400 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm">Time</p>
                    <p className="text-white">{event.startTime}</p>
                    {event.endTime && <p className="text-slate-400 text-sm">to {event.endTime}</p>}
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                {event.isOnline ? (
                  <>
                    <Globe className="w-5 h-5 text-cyan-400 mt-0.5" />
                    <div>
                      <p className="text-slate-400 text-sm">Location</p>
                      <p className="text-white">Online Event</p>
                      {event.onlineLink && (
                        <a 
                          href={event.onlineLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center gap-1 mt-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          Join Link
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <Building className="w-5 h-5 text-purple-400 mt-0.5" />
                    <div>
                      <p className="text-slate-400 text-sm">Venue</p>
                      <p className="text-white">{event.venue}</p>
                    </div>
                  </>
                )}
              </div>

              <Separator className="bg-slate-700" />

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-sm">Team Size</p>
                  <p className="text-white">{event.teamSize.min} - {event.teamSize.max} members</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-orange-400 mt-0.5" />
                <div>
                  <p className="text-slate-400 text-sm">Registration Deadline</p>
                  <p className="text-white">
                    {new Date(event.registrationDeadline).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4 space-y-3">
              <Button 
                onClick={handleAddToCalendar}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Add to Calendar
              </Button>
              <Link to="/tasks" className="block">
                <Button variant="outline" className="w-full border-slate-700 text-slate-300 hover:bg-slate-800">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Create Preparation Task
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
