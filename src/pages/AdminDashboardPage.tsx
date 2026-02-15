// ============================================
// HackTrack - Admin Dashboard Page
// ============================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  CheckSquare, 
  Bell, 
  Shield, 
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

const AdminDashboardPage: React.FC = () => {
  const { user, isMainAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingRequests: 0,
    totalEvents: 0,
    pendingEvents: 0,
    totalTasks: 0,
    recentActivities: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    const users = Database.User.getAll();
    const pendingRequests = Database.PendingRequest.getPending();
    const events = Database.Event.getAll();
    const pendingEvents = Database.Event.getPending();
    const tasks = Database.Task.getAll();
    const activities = Database.ActivityLog.getRecent(10);

    setStats({
      totalUsers: users.length,
      pendingRequests: pendingRequests.length,
      totalEvents: events.length,
      pendingEvents: pendingEvents.length,
      totalTasks: tasks.length,
      recentActivities: activities.length,
    });
  };

  const recentActivities = Database.ActivityLog.getRecent(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
          <p className="text-slate-400">
            Manage users, events, and monitor platform activity
          </p>
        </div>
        {isMainAdmin && (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/30 px-4 py-2">
            <Shield className="w-4 h-4 mr-2" />
            Main Admin
          </Badge>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Users</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalUsers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                <Users className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Requests</p>
                <p className="text-3xl font-bold text-yellow-400 mt-1">{stats.pendingRequests}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
            </div>
            {stats.pendingRequests > 0 && (
              <Link to="/admin/users">
                <Button variant="link" className="text-yellow-400 p-0 h-auto mt-2">
                  Review requests <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Events</p>
                <p className="text-3xl font-bold text-white mt-1">{stats.totalEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Pending Events</p>
                <p className="text-3xl font-bold text-orange-400 mt-1">{stats.pendingEvents}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-400" />
              </div>
            </div>
            {stats.pendingEvents > 0 && (
              <Link to="/admin/events">
                <Button variant="link" className="text-orange-400 p-0 h-auto mt-2">
                  Review events <ArrowRight className="w-3 h-3 ml-1" />
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Link to="/admin/users">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-colors group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/30 transition-colors">
                  <Users className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">User Management</h3>
                  <p className="text-slate-400 text-sm">Approve or reject access requests</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all ml-auto" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/admin/events">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-colors group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Event Approvals</h3>
                  <p className="text-slate-400 text-sm">Review and approve events</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all ml-auto" />
              </CardContent>
            </Card>
          </Link>

          <Link to="/events/upload">
            <Card className="bg-slate-800/50 border-slate-700 hover:border-indigo-500/50 transition-colors group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-white font-medium">Upload Event</h3>
                  <p className="text-slate-400 text-sm">Add a new hackathon event</p>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities.length === 0 ? (
              <p className="text-slate-500 text-center py-4">No recent activity</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm capitalize">{activity.action.replace('_', ' ')}</p>
                      <p className="text-slate-500 text-xs">
                        {new Date(activity.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-400" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Database</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Authentication</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">AI Services</span>
              </div>
              <Badge className="bg-green-500/20 text-green-400">Operational</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Google Calendar</span>
              </div>
              <Badge className="bg-yellow-500/20 text-yellow-400">Beta</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
