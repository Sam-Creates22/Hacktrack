// ============================================
// HackTrack - Reminders Page
// ============================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import type { HackathonEvent, Reminder } from '@/types';
import { 
  Bell, 
  Plus, 
  Trash2, 
  Clock, 
  Calendar,
  CheckCircle,
  AlertCircle,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

const RemindersPage: React.FC = () => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [browserNotifications, setBrowserNotifications] = useState(false);
  
  const [formData, setFormData] = useState({
    eventId: '',
    daysBefore: 1,
    hoursBefore: 0,
    preparationAlert: true,
  });

  useEffect(() => {
    if (user) {
      loadReminders();
      loadEvents();
      checkNotificationPermission();
    }
  }, [user]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setBrowserNotifications(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setBrowserNotifications(permission === 'granted');
      if (permission === 'granted') {
        toast.success('Browser notifications enabled!');
      }
    }
  };

  const loadReminders = () => {
    if (!user) return;
    const userReminders = Database.Reminder.getByUser(user.id);
    setReminders(userReminders);
  };

  const loadEvents = () => {
    if (!user) return;
    const allEvents = Database.Event.getVisibleToUser(user.id, user.role);
    const upcomingEvents = allEvents.filter(e => new Date(e.eventDate) > new Date());
    setEvents(upcomingEvents);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!formData.eventId) {
      toast.error('Please select an event');
      return;
    }

    Database.Reminder.create({
      userId: user.id,
      eventId: formData.eventId,
      daysBefore: formData.daysBefore,
      hoursBefore: formData.hoursBefore,
      preparationAlert: formData.preparationAlert,
      isEnabled: true,
    });

    toast.success('Reminder created successfully');
    setIsDialogOpen(false);
    resetForm();
    loadReminders();
  };

  const handleDelete = (reminderId: string) => {
    Database.Reminder.delete(reminderId);
    toast.success('Reminder deleted');
    loadReminders();
  };

  const toggleReminder = (reminder: Reminder) => {
    Database.Reminder.update(reminder.id, { isEnabled: !reminder.isEnabled });
    loadReminders();
    toast.success(reminder.isEnabled ? 'Reminder disabled' : 'Reminder enabled');
  };

  const resetForm = () => {
    setFormData({
      eventId: '',
      daysBefore: 1,
      hoursBefore: 0,
      preparationAlert: true,
    });
  };

  const getEventById = (eventId: string) => {
    return events.find(e => e.id === eventId) || Database.Event.getById(eventId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Smart Reminders</h1>
          <p className="text-slate-400">
            Never miss important hackathon deadlines
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!browserNotifications && (
            <Button
              variant="outline"
              onClick={requestNotificationPermission}
              className="border-slate-700 text-slate-300"
            >
              <Bell className="w-4 h-4 mr-2" />
              Enable Notifications
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600">
                <Plus className="w-4 h-4 mr-2" />
                New Reminder
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Reminder</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Select Event</Label>
                  <Select
                    value={formData.eventId}
                    onValueChange={(value) => setFormData({ ...formData, eventId: value })}
                  >
                    <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                      <SelectValue placeholder="Choose an event" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.title} - {new Date(event.eventDate).toLocaleDateString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Days Before</Label>
                    <Select
                      value={formData.daysBefore.toString()}
                      onValueChange={(value) => setFormData({ ...formData, daysBefore: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="0">Same day</SelectItem>
                        <SelectItem value="1">1 day</SelectItem>
                        <SelectItem value="2">2 days</SelectItem>
                        <SelectItem value="3">3 days</SelectItem>
                        <SelectItem value="7">1 week</SelectItem>
                        <SelectItem value="14">2 weeks</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Hours Before</Label>
                    <Select
                      value={formData.hoursBefore.toString()}
                      onValueChange={(value) => setFormData({ ...formData, hoursBefore: parseInt(value) })}
                    >
                      <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        <SelectItem value="0">At event time</SelectItem>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="6">6 hours</SelectItem>
                        <SelectItem value="12">12 hours</SelectItem>
                        <SelectItem value="24">24 hours</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/50">
                  <div>
                    <p className="text-white font-medium">Preparation Alert</p>
                    <p className="text-slate-400 text-sm">Get reminded about preparation tasks</p>
                  </div>
                  <Switch
                    checked={formData.preparationAlert}
                    onCheckedChange={(checked) => setFormData({ ...formData, preparationAlert: checked })}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-700 text-slate-300"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-indigo-500 to-purple-600">
                    Create Reminder
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Browser Notification Status */}
      <Card className={`border ${browserNotifications ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
        <CardContent className="p-4 flex items-center gap-4">
          {browserNotifications ? (
            <>
              <CheckCircle className="w-6 h-6 text-green-400" />
              <div>
                <p className="text-green-400 font-medium">Browser notifications are enabled</p>
                <p className="text-slate-400 text-sm">You'll receive reminders even when not on the site</p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="w-6 h-6 text-yellow-400" />
              <div className="flex-1">
                <p className="text-yellow-400 font-medium">Browser notifications are disabled</p>
                <p className="text-slate-400 text-sm">Enable notifications to get reminded even when not on the site</p>
              </div>
              <Button
                onClick={requestNotificationPermission}
                variant="outline"
                className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
              >
                Enable
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {/* Reminders List */}
      <div className="space-y-3">
        {reminders.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No reminders yet</h3>
              <p className="text-slate-400 mb-4">
                Create reminders for your upcoming hackathons
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Reminder
              </Button>
            </CardContent>
          </Card>
        ) : (
          reminders.map((reminder) => {
            const event = getEventById(reminder.eventId);
            if (!event) return null;

            return (
              <Card key={reminder.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                      <Bell className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/events/${event.id}`}>
                        <h4 className="text-white font-medium hover:text-indigo-400 transition-colors">
                          {event.title}
                        </h4>
                      </Link>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(event.eventDate).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {reminder.daysBefore > 0 && `${reminder.daysBefore} days `}
                          {reminder.hoursBefore > 0 && `${reminder.hoursBefore} hours`} before
                        </span>
                        {reminder.preparationAlert && (
                          <span className="text-indigo-400">+ prep alert</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={reminder.isEnabled}
                        onCheckedChange={() => toggleReminder(reminder)}
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(reminder.id)}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Quick Tips */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-indigo-400" />
            Reminder Tips
          </h3>
          <ul className="space-y-2 text-slate-400">
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              Set reminders 1-2 days before registration deadlines
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              Enable preparation alerts to stay on track with your tasks
            </li>
            <li className="flex items-start gap-2">
              <ChevronRight className="w-4 h-4 text-indigo-400 mt-0.5 flex-shrink-0" />
              Enable browser notifications for reminders even when you're offline
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default RemindersPage;
