// ============================================
// HackTrack - User Management Page
// ============================================

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import type { User, PendingRequest } from '@/types';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  Search, 
  Shield, 
  User as UserIcon,
  Crown,
  Trash2,
  ArrowLeft,
  Clock,
  Mail,
  UserCheck
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
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

const UserManagementPage: React.FC = () => {
  const { user: currentUser, isMainAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const allUsers = Database.User.getAll();
    const requests = Database.PendingRequest.getPending();
    setUsers(allUsers);
    setPendingRequests(requests);
  };

  const handleApproveRequest = (requestId: string) => {
    if (!currentUser) return;
    Database.PendingRequest.approve(requestId, currentUser.id);
    toast.success('User approved successfully');
    loadData();
  };

  const handleRejectRequest = (requestId: string) => {
    if (!currentUser) return;
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      Database.PendingRequest.reject(requestId, currentUser.id, reason);
      toast.success('Request rejected');
      loadData();
    }
  };

  const handleMakeAdmin = (userId: string) => {
    if (!isMainAdmin) {
      toast.error('Only main admin can perform this action');
      return;
    }
    Database.User.update(userId, { role: 'admin' });
    toast.success('User promoted to admin');
    loadData();
  };

  const handleRemoveAdmin = (userId: string) => {
    if (!isMainAdmin) {
      toast.error('Only main admin can perform this action');
      return;
    }
    Database.User.update(userId, { role: 'user' });
    toast.success('Admin privileges removed');
    loadData();
  };

  const handleDeleteUser = (userId: string) => {
    if (!isMainAdmin) {
      toast.error('Only main admin can delete users');
      return;
    }
    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }
    Database.User.delete(userId);
    toast.success('User deleted');
    loadData();
  };

  const filteredUsers = users.filter(u => 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'main_admin':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30"><Crown className="w-3 h-3 mr-1" /> Main Admin</Badge>;
      case 'admin':
        return <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30"><Shield className="w-3 h-3 mr-1" /> Admin</Badge>;
      default:
        return <Badge className="bg-indigo-500/20 text-indigo-400 border-indigo-500/30"><UserIcon className="w-3 h-3 mr-1" /> User</Badge>;
    }
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
          <h1 className="text-3xl font-bold text-white mb-2">User Management</h1>
          <p className="text-slate-400">
            Manage user access and permissions
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
        <Input
          placeholder="Search users by email..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 bg-slate-800/50 border-slate-700 text-white"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="users">
        <TabsList className="bg-slate-800/50 border border-slate-700">
          <TabsTrigger value="users" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            All Users ({users.length})
          </TabsTrigger>
          <TabsTrigger value="pending" className="data-[state=active]:bg-indigo-500 data-[state=active]:text-white">
            Pending Requests ({pendingRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-6">
          <div className="space-y-3">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                        <span className="text-white font-medium">{user.email[0].toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.email}</p>
                        <div className="flex items-center gap-2 mt-1">
                          {getRoleBadge(user.role)}
                          <span className="text-slate-500 text-sm">
                            Joined {new Date(user.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isMainAdmin && user.id !== currentUser?.id && user.role !== 'main_admin' && (
                        <>
                          {user.role === 'user' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMakeAdmin(user.id)}
                              className="border-purple-500/30 text-purple-400"
                            >
                              <Shield className="w-4 h-4 mr-1" />
                              Make Admin
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemoveAdmin(user.id)}
                              className="border-slate-600 text-slate-400"
                            >
                              <UserIcon className="w-4 h-4 mr-1" />
                              Remove Admin
                            </Button>
                          )}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-400">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-800 border-slate-700">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                                <AlertDialogDescription className="text-slate-400">
                                  Are you sure you want to delete this user? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="bg-slate-700 text-white">Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteUser(user.id)} className="bg-red-600 hover:bg-red-700">
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pending" className="mt-6">
          {pendingRequests.length === 0 ? (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-12 text-center">
                <UserCheck className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No pending requests</h3>
                <p className="text-slate-400">All access requests have been processed</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <Card key={request.id} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <Clock className="w-5 h-5 text-yellow-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{request.fullName}</p>
                          <p className="text-slate-400 text-sm flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {request.email}
                          </p>
                          <p className="text-slate-500 text-sm mt-1">
                            Reason: {request.reason}
                          </p>
                          <p className="text-slate-600 text-xs mt-1">
                            Requested {new Date(request.requestedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleApproveRequest(request.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          onClick={() => handleRejectRequest(request.id)}
                          variant="destructive"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagementPage;
