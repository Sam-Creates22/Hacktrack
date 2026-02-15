// ============================================
// HackTrack - Profile Setup Page (First Login)
// ============================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, User, Mail, Phone, Calendar, Hash, Github, Linkedin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, completeProfile } = useAuth();
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: user?.email || '',
    mobileNumber: '',
    dateOfBirth: '',
    universityRollNumber: '',
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\+?[\d\s-]{10,}$/.test(formData.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid mobile number';
    }
    
    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    
    if (!formData.universityRollNumber.trim()) {
      newErrors.universityRollNumber = 'University roll number is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await completeProfile({
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth),
      });
      
      if (result.success) {
        toast.success('Profile completed successfully!');
        navigate('/dashboard');
      } else {
        toast.error(result.error || 'Failed to complete profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] py-12 px-4">
      {/* Animated Background */}
      <div className="animated-bg" />
      <div className="grid-pattern" />

      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Complete Your Profile</h1>
          <p className="text-slate-400">
            Please provide your details to get started with HackTrack
          </p>
        </div>

        {/* Form */}
        <div className="glass-card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Required Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-indigo-500 rounded-full"></span>
                Required Information
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-slate-300">
                    Full Name <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="fullName"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => handleChange('fullName', e.target.value)}
                      className={`pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 ${
                        errors.fullName ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.fullName && <p className="text-red-400 text-sm">{errors.fullName}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      disabled
                      className="pl-10 bg-slate-800/30 border-slate-700 text-slate-500"
                    />
                  </div>
                </div>

                {/* Mobile Number */}
                <div className="space-y-2">
                  <Label htmlFor="mobileNumber" className="text-slate-300">
                    Mobile Number <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="mobileNumber"
                      placeholder="+1 234 567 8900"
                      value={formData.mobileNumber}
                      onChange={(e) => handleChange('mobileNumber', e.target.value)}
                      className={`pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 ${
                        errors.mobileNumber ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.mobileNumber && <p className="text-red-400 text-sm">{errors.mobileNumber}</p>}
                </div>

                {/* Date of Birth */}
                <div className="space-y-2">
                  <Label htmlFor="dateOfBirth" className="text-slate-300">
                    Date of Birth <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                      className={`pl-10 bg-slate-800/50 border-slate-700 text-white focus:border-indigo-500 ${
                        errors.dateOfBirth ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.dateOfBirth && <p className="text-red-400 text-sm">{errors.dateOfBirth}</p>}
                </div>

                {/* University Roll Number */}
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="universityRollNumber" className="text-slate-300">
                    University Roll Number <span className="text-red-400">*</span>
                  </Label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="universityRollNumber"
                      placeholder="e.g., 2023CS001"
                      value={formData.universityRollNumber}
                      onChange={(e) => handleChange('universityRollNumber', e.target.value)}
                      className={`pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500 ${
                        errors.universityRollNumber ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.universityRollNumber && <p className="text-red-400 text-sm">{errors.universityRollNumber}</p>}
                </div>
              </div>
            </div>

            <div className="divider" />

            {/* Optional Fields */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <span className="w-1 h-5 bg-purple-500 rounded-full"></span>
                Additional Information (Optional)
              </h3>
              
              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio" className="text-slate-300">
                  Bio
                </Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself, your skills, and interests..."
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  className="min-h-[100px] bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                />
              </div>

              {/* Social Links */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="githubUrl" className="text-slate-300">
                    GitHub
                  </Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="githubUrl"
                      placeholder="github.com/username"
                      value={formData.githubUrl}
                      onChange={(e) => handleChange('githubUrl', e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="linkedinUrl" className="text-slate-300">
                    LinkedIn
                  </Label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="linkedinUrl"
                      placeholder="linkedin.com/in/username"
                      value={formData.linkedinUrl}
                      onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="portfolioUrl" className="text-slate-300">
                    Portfolio
                  </Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <Input
                      id="portfolioUrl"
                      placeholder="yourportfolio.com"
                      value={formData.portfolioUrl}
                      onChange={(e) => handleChange('portfolioUrl', e.target.value)}
                      className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white py-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Completing Profile...
                  </>
                ) : (
                  'Complete Profile'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfileSetupPage;
