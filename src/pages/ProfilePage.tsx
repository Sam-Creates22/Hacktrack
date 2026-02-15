// ============================================
// HackTrack - Profile Page
// ============================================

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Database } from '@/services/database';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Hash, 
  Github, 
  Linkedin, 
  Globe,
  Edit,
  Save,
  X,
  Camera,
  Award,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';

const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: profile?.fullName || '',
    mobileNumber: profile?.mobileNumber || '',
    dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
    universityRollNumber: profile?.universityRollNumber || '',
    bio: profile?.bio || '',
    githubUrl: profile?.githubUrl || '',
    linkedinUrl: profile?.linkedinUrl || '',
    portfolioUrl: profile?.portfolioUrl || '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    const result = await updateProfile({
      ...formData,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
    });

    if (result.success) {
      toast.success('Profile updated successfully');
      setIsEditing(false);
    } else {
      toast.error(result.error || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile?.fullName || '',
      mobileNumber: profile?.mobileNumber || '',
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      universityRollNumber: profile?.universityRollNumber || '',
      bio: profile?.bio || '',
      githubUrl: profile?.githubUrl || '',
      linkedinUrl: profile?.linkedinUrl || '',
      portfolioUrl: profile?.portfolioUrl || '',
    });
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'main_admin': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'admin': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      default: return 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30';
    }
  };

  // Get user stats
  const userStats = user ? {
    events: Database.Event.getByUser(user.id).length,
    tasks: Database.Task.getByUser(user.id).length,
    completedTasks: Database.Task.getByUser(user.id).filter(t => t.status === 'completed').length,
  } : { events: 0, tasks: 0, completedTasks: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Profile</h1>
          <p className="text-slate-400">
            Manage your personal information and settings
          </p>
        </div>
        {!isEditing ? (
          <Button 
            onClick={() => setIsEditing(true)}
            className="bg-gradient-to-r from-indigo-500 to-purple-600"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={handleCancel}
              className="border-slate-700 text-slate-300"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-gradient-to-r from-indigo-500 to-purple-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <Avatar className="w-24 h-24 mx-auto">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-3xl">
                    {profile?.fullName ? getInitials(profile.fullName) : 'U'}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center hover:bg-indigo-600 transition-colors">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              
              <h2 className="text-xl font-semibold text-white mb-1">
                {profile?.fullName || 'User'}
              </h2>
              <p className="text-slate-400 text-sm mb-3">{user?.email}</p>
              <Badge variant="outline" className={getRoleBadgeColor(user?.role || '')}>
                {user?.role === 'main_admin' ? 'Main Admin' : user?.role === 'admin' ? 'Admin' : 'User'}
              </Badge>

              {profile?.bio && (
                <p className="text-slate-400 text-sm mt-4">{profile.bio}</p>
              )}

              <Separator className="my-6 bg-slate-700" />

              {/* Social Links */}
              <div className="flex justify-center gap-3">
                {profile?.githubUrl && (
                  <a 
                    href={profile.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Github className="w-5 h-5" />
                  </a>
                )}
                {profile?.linkedinUrl && (
                  <a 
                    href={profile.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Linkedin className="w-5 h-5" />
                  </a>
                )}
                {profile?.portfolioUrl && (
                  <a 
                    href={profile.portfolioUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-lg bg-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="bg-slate-800/50 border-slate-700 mt-4">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-400" />
                Your Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Events Created</span>
                <span className="text-white font-semibold">{userStats.events}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Total Tasks</span>
                <span className="text-white font-semibold">{userStats.tasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Completed Tasks</span>
                <span className="text-green-400 font-semibold">{userStats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Completion Rate</span>
                <span className="text-indigo-400 font-semibold">
                  {userStats.tasks > 0 ? Math.round((userStats.completedTasks / userStats.tasks) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-400 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Full Name
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  ) : (
                    <p className="text-white">{profile?.fullName || 'Not set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    Email Address
                  </Label>
                  <p className="text-white">{user?.email}</p>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400 flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    Mobile Number
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  ) : (
                    <p className="text-white">{profile?.mobileNumber || 'Not set'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-400 flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date of Birth
                  </Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  ) : (
                    <p className="text-white">
                      {profile?.dateOfBirth 
                        ? new Date(profile.dateOfBirth).toLocaleDateString('en-US', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Not set'}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-slate-400 flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    University Roll Number
                  </Label>
                  {isEditing ? (
                    <Input
                      value={formData.universityRollNumber}
                      onChange={(e) => handleChange('universityRollNumber', e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white"
                    />
                  ) : (
                    <p className="text-white">{profile?.universityRollNumber || 'Not set'}</p>
                  )}
                </div>
              </div>

              <Separator className="bg-slate-700" />

              {/* Bio */}
              <div className="space-y-2">
                <Label className="text-slate-400">Bio</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.bio}
                    onChange={(e) => handleChange('bio', e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="bg-slate-800/50 border-slate-700 text-white min-h-[100px]"
                  />
                ) : (
                  <p className="text-white">{profile?.bio || 'No bio added yet.'}</p>
                )}
              </div>

              <Separator className="bg-slate-700" />

              {/* Social Links */}
              <div>
                <Label className="text-slate-400 mb-3 block">Social Links</Label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-slate-500 text-sm flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.githubUrl}
                        onChange={(e) => handleChange('githubUrl', e.target.value)}
                        placeholder="github.com/username"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    ) : (
                      <p className="text-white text-sm truncate">
                        {profile?.githubUrl || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 text-sm flex items-center gap-2">
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.linkedinUrl}
                        onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                        placeholder="linkedin.com/in/username"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    ) : (
                      <p className="text-white text-sm truncate">
                        {profile?.linkedinUrl || 'Not set'}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-500 text-sm flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Portfolio
                    </Label>
                    {isEditing ? (
                      <Input
                        value={formData.portfolioUrl}
                        onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                        placeholder="yourportfolio.com"
                        className="bg-slate-800/50 border-slate-700 text-white"
                      />
                    ) : (
                      <p className="text-white text-sm truncate">
                        {profile?.portfolioUrl || 'Not set'}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Account Info */}
          <Card className="bg-slate-800/50 border-slate-700 mt-4">
            <CardHeader>
              <CardTitle className="text-white text-lg">Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm">Member Since</p>
                  <p className="text-white">
                    {user?.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Last Login</p>
                  <p className="text-white">
                    {user?.lastLoginAt 
                      ? new Date(user.lastLoginAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Account Status</p>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
