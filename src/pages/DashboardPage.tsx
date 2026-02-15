// ============================================
// HackTrack - Main Dashboard Page
// ============================================

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import type { HackathonEvent, Task, Notification } from '@/types';
import { 
  Sparkles, 
  Calendar, 
  Upload, 
  CheckSquare, 
  Bot, 
  Bell, 
  Clock,
  ArrowRight,
  TrendingUp,
  Users,
  Trophy,
  Target
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

const DashboardPage: React.FC = () => {
  const { user, profile, isAdmin } = useAuth();
  const [upcomingEvents, setUpcomingEvents] = useState<HackathonEvent[]>([]);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({
    totalEvents: 0,
    pendingTasks: 0,
    completedTasks: 0,
    upcomingEvents: 0,
  });

  useEffect(() => {
    if (user) {
      // Load events
      const events = Database.Event.getVisibleToUser(user.id, user.role);
      const upcoming = events
        .filter(e => new Date(e.eventDate) > new Date())
        .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
        .slice(0, 5);
      setUpcomingEvents(upcoming);

      // Load tasks
      const tasks = Database.Task.getByUser(user.id);
      const pending = tasks
        .filter(t => t.status !== 'completed')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        .slice(0, 5);
      setRecentTasks(pending);

      // Calculate stats
      const taskStats = Database.Task.getStats(user.id);
      setStats({
        totalEvents: events.length,
        pendingTasks: taskStats.pending + taskStats.inProgress,
        completedTasks: taskStats.completed,
        upcomingEvents: upcoming.length,
      });
    }
  }, [user]);

  const modules = [
    {
      id: 'smart-upload',
      title: 'Smart Upload',
      description: 'Upload hackathon brochures and let AI extract event details automatically.',
      icon: Upload,
      href: '/events/upload',
      color: 'from-purple-500 to-pink-500',
      stats: 'AI-Powered',
    },
    {
      id: 'ai-assistant',
      title: 'AI Assistant',
      description: 'Get personalized guidance, preparation plans, and answers to your questions.',
      icon: Bot,
      href: '/ai-assistant',
      color: 'from-indigo-500 to-purple-500',
      stats: '24/7 Available',
    },
    {
      id: 'calendar-sync',
      title: 'Calendar Sync',
      description: 'Sync events with Google Calendar and detect schedule conflicts.',
      icon: Calendar,
      href: '/calendar',
      color: 'from-cyan-500 to-blue-500',
      stats: 'Google Integration',
    },
    {
      id: 'task-manager',
      title: 'Task Manager',
      description: 'Organize your preparation tasks with priorities and deadlines.',
      icon: CheckSquare,
      href: '/tasks',
      color: 'from-green-500 to-emerald-500',
      stats: `${stats.pendingTasks} Pending`,
    },
    {
      id: 'smart-reminders',
      title: 'Smart Reminders',
      description: 'Never miss important deadlines with customizable reminders.',
      icon: Bell,
      href: '/reminders',
      color: 'from-orange-500 to-red-500',
      stats: 'Active',
    },
    {
      id: 'profile',
      title: 'Profile',
      description: 'Manage your profile, skills, and social links.',
      icon: Users,
      href: '/profile',
      color: 'from-pink-500 to-rose-500',
      stats: 'Edit',
    },
  ];

  const getDaysUntil = (date: Date) => {
    const days = Math.ceil((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Welcome back,{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              {profile?.fullName?.split(' ')[0] || 'Hacker'}
            </span>
            !
          </h1>
          <p className="text-slate-400">
            Here's what's happening with your hackathon journey.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/events/upload">
            <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Event
            </Button>
          </Link>
          <Link to="/ai-assistant">
            <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Bot className="w-4 h-4 mr-2" />
              Ask AI
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Upcoming</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.upcomingEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Tasks</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.pendingTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-orange-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Completed</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.completedTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Dashboard Modules */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Access</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {modules.map((module) => (
            <Link key={module.id} to={module.href}>
              <Card className="group bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-all duration-300 hover:scale-[1.02] h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${module.color} flex items-center justify-center group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-shadow`}>
                      <module.icon className="w-6 h-6 text-white" />
                    </div>
                    <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                      {module.stats}
                    </Badge>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
                  <p className="text-slate-400 text-sm">{module.description}</p>
                  <div className="mt-4 flex items-center text-indigo-400 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Open <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Upcoming Events */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-400" />
              Upcoming Events
            </CardTitle>
            <Link to="/events">
              <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No upcoming events</p>
                <Link to="/events/upload">
                  <Button variant="link" className="text-indigo-400 mt-2">
                    Upload an event
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Link key={event.id} to={`/events/${event.id}`}>
                    <div className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors">
                      <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-indigo-400 font-bold text-sm">
                          {getDaysUntil(event.eventDate)}d
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-white font-medium truncate">{event.title}</h4>
                        <p className="text-slate-400 text-sm">
                          {new Date(event.eventDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={event.isOnline ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' : 'bg-purple-500/20 text-purple-400 border-purple-500/30'}
                      >
                        {event.isOnline ? 'Online' : 'Offline'}
                      </Badge>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Tasks */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-green-400" />
              Pending Tasks
            </CardTitle>
            <Link to="/tasks">
              <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                View All <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentTasks.length === 0 ? (
              <div className="text-center py-8">
                <CheckSquare className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-500">No pending tasks</p>
                <Link to="/tasks">
                  <Button variant="link" className="text-indigo-400 mt-2">
                    Create a task
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/50">
                    <div className={`w-2 h-2 rounded-full ${
                      task.priority === 'high' ? 'bg-red-500' : 
                      task.priority === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-white font-medium truncate">{task.title}</h4>
                      {task.deadline && (
                        <p className="text-slate-400 text-sm">
                          Due {new Date(task.deadline).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline" className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* AI Assistant Promo */}
      <Card className="bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-indigo-500/30">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h3 className="text-xl font-semibold text-white mb-2">
                Need Help Preparing for Your Next Hackathon?
              </h3>
              <p className="text-slate-300">
                Our AI assistant can help you create preparation plans, answer technical questions, 
                and provide guidance on team building and project ideation.
              </p>
            </div>
            <Link to="/ai-assistant">
              <Button className="bg-white text-indigo-600 hover:bg-slate-100 flex-shrink-0">
                <Bot className="w-4 h-4 mr-2" />
                Chat with AI
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;
