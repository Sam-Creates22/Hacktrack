// ============================================
// HackTrack - Type Definitions
// ============================================

// User Roles
export type UserRole = 'main_admin' | 'admin' | 'user';

// User Status
export type UserStatus = 'pending' | 'approved' | 'rejected' | 'active' | 'inactive';

// Event Status
export type EventStatus = 'pending' | 'approved' | 'rejected' | 'published';

// Event Visibility
export type EventVisibility = 'private' | 'selected' | 'public';

// Task Priority
export type TaskPriority = 'low' | 'medium' | 'high';

// Task Status
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

// Notification Type
export type NotificationType = 
  | 'user_approved' 
  | 'user_rejected' 
  | 'event_uploaded' 
  | 'event_approved' 
  | 'event_rejected'
  | 'reminder'
  | 'system';

// ============================================
// User & Authentication Types
// ============================================

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
  isFirstLogin: boolean;
}

export interface PendingRequest {
  id: string;
  email: string;
  fullName: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: string;
  rejectionReason?: string;
}

export interface Profile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: Date;
  universityRollNumber: string;
  avatar?: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Event Types
// ============================================

export interface HackathonEvent {
  id: string;
  title: string;
  description: string;
  eventDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  venue?: string;
  isOnline: boolean;
  onlineLink?: string;
  registrationDeadline: Date;
  teamSize: {
    min: number;
    max: number;
  };
  instructions: string;
  brochureUrl?: string;
  extractedData?: ExtractedEventData;
  visibility: EventVisibility;
  selectedUsers?: string[]; // user IDs for private visibility
  status: EventStatus;
  createdBy: string; // user ID
  createdAt: Date;
  updatedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectionReason?: string;
}

export interface ExtractedEventData {
  eventName?: string;
  date?: string;
  time?: string;
  venue?: string;
  isOnline?: boolean;
  registrationDeadline?: string;
  teamSize?: string;
  instructions?: string;
  confidence: number;
}

export interface EventApproval {
  id: string;
  eventId: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: string;
  reviewedAt?: Date;
  comments?: string;
}

// ============================================
// Task Types
// ============================================

export interface Task {
  id: string;
  userId: string;
  eventId?: string; // optional link to event
  title: string;
  description?: string;
  deadline?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// ============================================
// Reminder Types
// ============================================

export interface Reminder {
  id: string;
  userId: string;
  eventId: string;
  daysBefore: number;
  hoursBefore: number;
  preparationAlert: boolean;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReminderNotification {
  id: string;
  reminderId: string;
  userId: string;
  eventId: string;
  type: 'browser' | 'in_app';
  title: string;
  message: string;
  isRead: boolean;
  sentAt: Date;
  readAt?: Date;
}

// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// ============================================
// AI Chat Types
// ============================================

export interface ChatMessage {
  id: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  context?: Record<string, any>;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Calendar Types
// ============================================

export interface CalendarSync {
  id: string;
  userId: string;
  googleCalendarId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
  isConnected: boolean;
  lastSyncedAt?: Date;
  syncEnabled: boolean;
}

export interface CalendarEvent {
  id: string;
  userId: string;
  hackathonEventId: string;
  googleEventId?: string;
  syncedAt?: Date;
}

// ============================================
// Activity Log Types
// ============================================

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  entityType: 'user' | 'event' | 'task' | 'system';
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// ============================================
// API Response Types
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// ============================================
// Form Types
// ============================================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface AccessRequestFormData {
  email: string;
  fullName: string;
  reason: string;
}

export interface ProfileFormData {
  fullName: string;
  email: string;
  mobileNumber: string;
  dateOfBirth: string;
  universityRollNumber: string;
  bio?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
}

export interface EventFormData {
  title: string;
  description: string;
  eventDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  venue?: string;
  isOnline: boolean;
  onlineLink?: string;
  registrationDeadline: string;
  teamSizeMin: number;
  teamSizeMax: number;
  instructions: string;
  visibility: EventVisibility;
  selectedUsers?: string[];
}

export interface TaskFormData {
  title: string;
  description?: string;
  deadline?: string;
  priority: TaskPriority;
  notes?: string;
  eventId?: string;
}

export interface ReminderFormData {
  eventId: string;
  daysBefore: number;
  hoursBefore: number;
  preparationAlert: boolean;
}

// ============================================
// UI Types
// ============================================

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  roles?: UserRole[];
}

export interface DashboardModule {
  id: string;
  title: string;
  description: string;
  icon: string;
  href: string;
  color: string;
  roles?: UserRole[];
}

export interface StatsCard {
  title: string;
  value: number | string;
  change?: number;
  icon: string;
  color: string;
}
