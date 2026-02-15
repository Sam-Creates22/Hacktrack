// ============================================
// HackTrack - Landing Page
// ============================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Calendar, 
  Bot, 
  CheckSquare, 
  Bell, 
  Shield, 
  Users, 
  Zap,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Extraction',
      description: 'Upload hackathon brochures and let AI automatically extract event details, dates, and requirements.',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Bot,
      title: 'Smart Assistant',
      description: 'Get personalized hackathon preparation plans, team building tips, and technical guidance.',
      color: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Calendar,
      title: 'Calendar Sync',
      description: 'Seamlessly sync events with Google Calendar and never miss important deadlines.',
      color: 'from-cyan-500 to-blue-500',
    },
    {
      icon: CheckSquare,
      title: 'Task Manager',
      description: 'Organize your preparation tasks with priorities, deadlines, and progress tracking.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Bell,
      title: 'Smart Reminders',
      description: 'Get notified about upcoming events, deadlines, and preparation milestones.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Role-based access control with admin approval for a trusted community.',
      color: 'from-red-500 to-pink-500',
    },
  ];

  const stats = [
    { value: '500+', label: 'Hackathons Tracked' },
    { value: '1000+', label: 'Active Users' },
    { value: '50+', label: 'Universities' },
    { value: '95%', label: 'Success Rate' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] overflow-hidden">
      {/* Animated Background */}
      <div className="animated-bg" />
      <div className="grid-pattern" />

      {/* Navigation */}
      <nav className="relative z-10 px-6 py-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              HackTrack
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="ghost" className="text-slate-300 hover:text-white">
                Login
              </Button>
            </Link>
            <Link to="/request-access">
              <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                Request Access
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32 lg:px-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-sm text-indigo-300">AI-Powered Hackathon Management</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight">
            <span className="text-white">Master Your</span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Hackathon Journey
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
            The ultimate AI-powered platform for managing hackathon events, schedules, 
            tasks, and team collaboration. Built for the modern hacker.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/request-access">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg px-8 py-6"
              >
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/login">
              <Button 
                variant="outline" 
                size="lg"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 text-lg px-8 py-6"
              >
                Already Have Access?
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16 lg:px-12 border-y border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-slate-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Everything You Need to{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Succeed
              </span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Powerful features designed to help you track, prepare, and win hackathons.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group glass-card p-8 hover:scale-[1.02] transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:shadow-lg group-hover:shadow-indigo-500/25 transition-shadow`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative z-10 px-6 py-20 lg:py-32 lg:px-12 bg-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              How It{' '}
              <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Works
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '01', title: 'Request Access', desc: 'Submit your access request to join the community' },
              { step: '02', title: 'Get Approved', desc: 'Admin reviews and approves your request' },
              { step: '03', title: 'Upload Events', desc: 'Use AI to extract event details from brochures' },
              { step: '04', title: 'Stay Organized', desc: 'Track tasks, sync calendar, and get reminders' },
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-6xl font-bold text-slate-800 mb-4">{item.step}</div>
                <h3 className="text-xl font-semibold text-white mb-2">{item.title}</h3>
                <p className="text-slate-400">{item.desc}</p>
                {index < 3 && (
                  <ChevronRight className="hidden md:block absolute top-1/2 -right-4 w-8 h-8 text-slate-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20 lg:py-32 lg:px-12">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass-card p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-purple-500/10" />
            <div className="relative z-10">
              <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
                Ready to Hack Your Way to Success?
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Join our community of hackers and start tracking your hackathon journey today.
              </p>
              <Link to="/request-access">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-lg px-8 py-6"
                >
                  Request Access Now
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 lg:px-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">H</span>
              </div>
              <span className="text-lg font-bold text-white">HackTrack</span>
            </div>
            <p className="text-slate-500 text-sm">
              © 2025 HackTrack. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">
                Login
              </Link>
              <Link to="/request-access" className="text-slate-400 hover:text-white text-sm transition-colors">
                Request Access
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
