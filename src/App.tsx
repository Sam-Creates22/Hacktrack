// ============================================
// HackTrack - Main Application
// ============================================

import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/hooks/useAuth';
import { NotificationsProvider } from '@/hooks/useNotifications';
import { Toaster } from '@/components/ui/sonner';

// Pages
import LandingPage from '@/pages/LandingPage';
import LoginPage from '@/pages/LoginPage';
import RequestAccessPage from '@/pages/RequestAccessPage';
import ProfileSetupPage from '@/pages/ProfileSetupPage';
import DashboardPage from '@/pages/DashboardPage';
import EventsPage from '@/pages/EventsPage';
import EventDetailPage from '@/pages/EventDetailPage';
import UploadEventPage from '@/pages/UploadEventPage';
import TasksPage from '@/pages/TasksPage';
import AIAssistantPage from '@/pages/AIAssistantPage';
import CalendarPage from '@/pages/CalendarPage';
import RemindersPage from '@/pages/RemindersPage';
import ProfilePage from '@/pages/ProfilePage';
import AdminDashboardPage from '@/pages/AdminDashboardPage';
import UserManagementPage from '@/pages/UserManagementPage';
import EventApprovalsPage from '@/pages/EventApprovalsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import NotFoundPage from '@/pages/NotFoundPage';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRoute from '@/components/AdminRoute';
import Layout from '@/components/Layout';

// Styles
import './App.css';

function App() {
  return (
    <AuthProvider>
      <NotificationsProvider>
        <HashRouter>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/request-access" element={<RequestAccessPage />} />

            {/* Protected Routes with Layout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                {/* Profile Setup (First Login) */}
                <Route path="/profile-setup" element={<ProfileSetupPage />} />
                
                {/* Main Dashboard */}
                <Route path="/dashboard" element={<DashboardPage />} />
                
                {/* Events */}
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/events/upload" element={<UploadEventPage />} />
                
                {/* Tasks */}
                <Route path="/tasks" element={<TasksPage />} />
                
                {/* AI Assistant */}
                <Route path="/ai-assistant" element={<AIAssistantPage />} />
                
                {/* Calendar */}
                <Route path="/calendar" element={<CalendarPage />} />
                
                {/* Reminders */}
                <Route path="/reminders" element={<RemindersPage />} />
                
                {/* Profile */}
                <Route path="/profile" element={<ProfilePage />} />
                
                {/* Notifications */}
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>
            </Route>

            {/* Admin Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<Layout />}>
                <Route path="/admin" element={<AdminDashboardPage />} />
                <Route path="/admin/users" element={<UserManagementPage />} />
                <Route path="/admin/events" element={<EventApprovalsPage />} />
              </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </HashRouter>
        <Toaster position="top-right" richColors />
      </NotificationsProvider>
    </AuthProvider>
  );
}

export default App;
