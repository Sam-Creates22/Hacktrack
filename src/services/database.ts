// ============================================
// HackTrack - Mock Database Service
// Simulates backend functionality with localStorage
// ============================================

import type {
  User,
  PendingRequest,
  Profile,
  HackathonEvent,
  EventApproval,
  Task,
  Reminder,
  Notification,
  ChatMessage,
  ChatSession,
  CalendarSync,
  ActivityLog,
  UserRole,
  UserStatus,
  EventStatus,
  TaskStatus,
  NotificationType,
} from '@/types';

// ============================================
// Storage Keys
// ============================================

const STORAGE_KEYS = {
  USERS: 'hacktrack_users',
  PENDING_REQUESTS: 'hacktrack_pending_requests',
  PROFILES: 'hacktrack_profiles',
  EVENTS: 'hacktrack_events',
  EVENT_APPROVALS: 'hacktrack_event_approvals',
  TASKS: 'hacktrack_tasks',
  REMINDERS: 'hacktrack_reminders',
  NOTIFICATIONS: 'hacktrack_notifications',
  CHAT_SESSIONS: 'hacktrack_chat_sessions',
  CHAT_MESSAGES: 'hacktrack_chat_messages',
  CALENDAR_SYNC: 'hacktrack_calendar_sync',
  ACTIVITY_LOGS: 'hacktrack_activity_logs',
  CURRENT_USER: 'hacktrack_current_user',
  SESSION: 'hacktrack_session',
};

// ============================================
// Helper Functions
// ============================================

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const getStorageItem = <T>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

const setStorageItem = <T>(key: string, value: T): void => {
  localStorage.setItem(key, JSON.stringify(value));
};

const parseDate = (obj: any): any => {
  if (!obj) return obj;
  if (typeof obj !== 'object') return obj;
  
  const parsed = { ...obj };
  const dateFields = ['createdAt', 'updatedAt', 'lastLoginAt', 'requestedAt', 'reviewedAt', 
    'eventDate', 'endDate', 'registrationDeadline', 'approvedAt', 'deadline', 'completedAt',
    'sentAt', 'readAt', 'timestamp', 'tokenExpiry', 'lastSyncedAt', 'syncedAt', 'dateOfBirth'];
  
  dateFields.forEach(field => {
    if (parsed[field]) {
      parsed[field] = new Date(parsed[field]);
    }
  });
  
  return parsed;
};

// ============================================
// User Service
// ============================================

export const UserService = {
  getAll: (): User[] => {
    return getStorageItem<User[]>(STORAGE_KEYS.USERS, []).map(parseDate);
  },

  getById: (id: string): User | undefined => {
    return UserService.getAll().find(u => u.id === id);
  },

  getByEmail: (email: string): User | undefined => {
    return UserService.getAll().find(u => u.email.toLowerCase() === email.toLowerCase());
  },

  create: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): User => {
    const users = UserService.getAll();
    const newUser: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    users.push(newUser);
    setStorageItem(STORAGE_KEYS.USERS, users);
    return newUser;
  },

  update: (id: string, updates: Partial<User>): User | undefined => {
    const users = UserService.getAll();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    
    users[index] = { ...users[index], ...updates, updatedAt: new Date() };
    setStorageItem(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  delete: (id: string): boolean => {
    const users = UserService.getAll();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    setStorageItem(STORAGE_KEYS.USERS, filtered);
    return true;
  },

  // Initialize default admin
  initDefaultAdmin: (): void => {
    const users = UserService.getAll();
    if (users.length === 0) {
      UserService.create({
        email: 'admin@hacktrack.com',
        password: 'admin123', // In production, this would be hashed
        role: 'main_admin',
        status: 'active',
        isFirstLogin: false,
        lastLoginAt: new Date(),
      });
    }
  },
};

// ============================================
// Pending Request Service
// ============================================

export const PendingRequestService = {
  getAll: (): PendingRequest[] => {
    return getStorageItem<PendingRequest[]>(STORAGE_KEYS.PENDING_REQUESTS, []).map(parseDate);
  },

  getById: (id: string): PendingRequest | undefined => {
    return PendingRequestService.getAll().find(r => r.id === id);
  },

  getPending: (): PendingRequest[] => {
    return PendingRequestService.getAll().filter(r => r.status === 'pending');
  },

  create: (data: Omit<PendingRequest, 'id' | 'requestedAt' | 'status'>): PendingRequest => {
    const requests = PendingRequestService.getAll();
    const newRequest: PendingRequest = {
      ...data,
      id: generateId(),
      status: 'pending',
      requestedAt: new Date(),
    };
    requests.push(newRequest);
    setStorageItem(STORAGE_KEYS.PENDING_REQUESTS, requests);
    return newRequest;
  },

  update: (id: string, updates: Partial<PendingRequest>): PendingRequest | undefined => {
    const requests = PendingRequestService.getAll();
    const index = requests.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    requests[index] = { ...requests[index], ...updates };
    setStorageItem(STORAGE_KEYS.PENDING_REQUESTS, requests);
    return requests[index];
  },

  approve: (id: string, reviewedBy: string): { request: PendingRequest; user: User } | undefined => {
    const request = PendingRequestService.update(id, {
      status: 'approved',
      reviewedAt: new Date(),
      reviewedBy,
    });
    
    if (!request) return undefined;
    
    // Create user account
    const user = UserService.create({
      email: request.email,
      password: 'temp123', // Temporary password
      role: 'user',
      status: 'active',
      isFirstLogin: true,
    });
    
    // Create notification
    NotificationService.create({
      userId: user.id,
      type: 'user_approved',
      title: 'Access Approved',
      message: 'Your access request has been approved. Welcome to HackTrack!',
    });
    
    return { request, user };
  },

  reject: (id: string, reviewedBy: string, reason?: string): PendingRequest | undefined => {
    return PendingRequestService.update(id, {
      status: 'rejected',
      reviewedAt: new Date(),
      reviewedBy,
      rejectionReason: reason,
    });
  },
};

// ============================================
// Profile Service
// ============================================

export const ProfileService = {
  getAll: (): Profile[] => {
    return getStorageItem<Profile[]>(STORAGE_KEYS.PROFILES, []).map(parseDate);
  },

  getByUserId: (userId: string): Profile | undefined => {
    return ProfileService.getAll().find(p => p.userId === userId);
  },

  create: (data: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>): Profile => {
    const profiles = ProfileService.getAll();
    const newProfile: Profile = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    profiles.push(newProfile);
    setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    return newProfile;
  },

  update: (userId: string, updates: Partial<Profile>): Profile | undefined => {
    const profiles = ProfileService.getAll();
    const index = profiles.findIndex(p => p.userId === userId);
    if (index === -1) return undefined;
    
    profiles[index] = { ...profiles[index], ...updates, updatedAt: new Date() };
    setStorageItem(STORAGE_KEYS.PROFILES, profiles);
    return profiles[index];
  },

  hasCompletedProfile: (userId: string): boolean => {
    const profile = ProfileService.getByUserId(userId);
    return !!profile && !!profile.fullName && !!profile.mobileNumber && !!profile.universityRollNumber;
  },
};

// ============================================
// Event Service
// ============================================

export const EventService = {
  getAll: (): HackathonEvent[] => {
    return getStorageItem<HackathonEvent[]>(STORAGE_KEYS.EVENTS, []).map(parseDate);
  },

  getById: (id: string): HackathonEvent | undefined => {
    return EventService.getAll().find(e => e.id === id);
  },

  getByUser: (userId: string): HackathonEvent[] => {
    return EventService.getAll().filter(e => e.createdBy === userId);
  },

  getApproved: (): HackathonEvent[] => {
    return EventService.getAll().filter(e => e.status === 'approved' || e.status === 'published');
  },

  getPending: (): HackathonEvent[] => {
    return EventService.getAll().filter(e => e.status === 'pending');
  },

  getVisibleToUser: (userId: string, userRole: UserRole): HackathonEvent[] => {
    const allEvents = EventService.getAll();
    
    if (userRole === 'main_admin' || userRole === 'admin') {
      return allEvents;
    }
    
    return allEvents.filter(event => {
      // User's own events
      if (event.createdBy === userId) return true;
      
      // Public approved events
      if (event.visibility === 'public' && (event.status === 'approved' || event.status === 'published')) {
        return true;
      }
      
      // Selected users events
      if (event.visibility === 'selected' && event.selectedUsers?.includes(userId)) {
        return true;
      }
      
      return false;
    });
  },

  create: (data: Omit<HackathonEvent, 'id' | 'createdAt' | 'updatedAt'>): HackathonEvent => {
    const events = EventService.getAll();
    const newEvent: HackathonEvent = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    events.push(newEvent);
    setStorageItem(STORAGE_KEYS.EVENTS, events);
    
    // Notify admins
    const admins = UserService.getAll().filter(u => u.role === 'admin' || u.role === 'main_admin');
    admins.forEach(admin => {
      NotificationService.create({
        userId: admin.id,
        type: 'event_uploaded',
        title: 'New Event Uploaded',
        message: `A new event "${newEvent.title}" has been uploaded and is pending approval.`,
        data: { eventId: newEvent.id },
      });
    });
    
    return newEvent;
  },

  update: (id: string, updates: Partial<HackathonEvent>): HackathonEvent | undefined => {
    const events = EventService.getAll();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return undefined;
    
    events[index] = { ...events[index], ...updates, updatedAt: new Date() };
    setStorageItem(STORAGE_KEYS.EVENTS, events);
    return events[index];
  },

  delete: (id: string): boolean => {
    const events = EventService.getAll();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    setStorageItem(STORAGE_KEYS.EVENTS, filtered);
    return true;
  },

  approve: (id: string, approvedBy: string): HackathonEvent | undefined => {
    const event = EventService.update(id, {
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
    });
    
    if (event) {
      // Notify creator
      NotificationService.create({
        userId: event.createdBy,
        type: 'event_approved',
        title: 'Event Approved',
        message: `Your event "${event.title}" has been approved!`,
        data: { eventId: event.id },
      });
    }
    
    return event;
  },

  reject: (id: string, rejectionReason: string): HackathonEvent | undefined => {
    const event = EventService.getAll().find(e => e.id === id);
    if (!event) return undefined;
    
    const updated = EventService.update(id, {
      status: 'rejected',
      rejectionReason,
    });
    
    if (updated) {
      // Notify creator
      NotificationService.create({
        userId: event.createdBy,
        type: 'event_rejected',
        title: 'Event Rejected',
        message: `Your event "${event.title}" was not approved. Reason: ${rejectionReason}`,
        data: { eventId: event.id },
      });
    }
    
    return updated;
  },
};

// ============================================
// Task Service
// ============================================

export const TaskService = {
  getAll: (): Task[] => {
    return getStorageItem<Task[]>(STORAGE_KEYS.TASKS, []).map(parseDate);
  },

  getById: (id: string): Task | undefined => {
    return TaskService.getAll().find(t => t.id === id);
  },

  getByUser: (userId: string): Task[] => {
    return TaskService.getAll().filter(t => t.userId === userId);
  },

  getByEvent: (eventId: string): Task[] => {
    return TaskService.getAll().filter(t => t.eventId === eventId);
  },

  create: (data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task => {
    const tasks = TaskService.getAll();
    const newTask: Task = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    tasks.push(newTask);
    setStorageItem(STORAGE_KEYS.TASKS, tasks);
    return newTask;
  },

  update: (id: string, updates: Partial<Task>): Task | undefined => {
    const tasks = TaskService.getAll();
    const index = tasks.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    
    const updatesWithCompleted = { ...updates };
    if (updates.status === 'completed' && tasks[index].status !== 'completed') {
      updatesWithCompleted.completedAt = new Date();
    }
    
    tasks[index] = { ...tasks[index], ...updatesWithCompleted, updatedAt: new Date() };
    setStorageItem(STORAGE_KEYS.TASKS, tasks);
    return tasks[index];
  },

  delete: (id: string): boolean => {
    const tasks = TaskService.getAll();
    const filtered = tasks.filter(t => t.id !== id);
    if (filtered.length === tasks.length) return false;
    setStorageItem(STORAGE_KEYS.TASKS, filtered);
    return true;
  },

  getStats: (userId: string) => {
    const userTasks = TaskService.getByUser(userId);
    return {
      total: userTasks.length,
      pending: userTasks.filter(t => t.status === 'pending').length,
      inProgress: userTasks.filter(t => t.status === 'in_progress').length,
      completed: userTasks.filter(t => t.status === 'completed').length,
      highPriority: userTasks.filter(t => t.priority === 'high' && t.status !== 'completed').length,
    };
  },
};

// ============================================
// Reminder Service
// ============================================

export const ReminderService = {
  getAll: (): Reminder[] => {
    return getStorageItem<Reminder[]>(STORAGE_KEYS.REMINDERS, []).map(parseDate);
  },

  getByUser: (userId: string): Reminder[] => {
    return ReminderService.getAll().filter(r => r.userId === userId);
  },

  getByEvent: (eventId: string): Reminder[] => {
    return ReminderService.getAll().filter(r => r.eventId === eventId);
  },

  create: (data: Omit<Reminder, 'id' | 'createdAt' | 'updatedAt'>): Reminder => {
    const reminders = ReminderService.getAll();
    const newReminder: Reminder = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    reminders.push(newReminder);
    setStorageItem(STORAGE_KEYS.REMINDERS, reminders);
    return newReminder;
  },

  update: (id: string, updates: Partial<Reminder>): Reminder | undefined => {
    const reminders = ReminderService.getAll();
    const index = reminders.findIndex(r => r.id === id);
    if (index === -1) return undefined;
    
    reminders[index] = { ...reminders[index], ...updates, updatedAt: new Date() };
    setStorageItem(STORAGE_KEYS.REMINDERS, reminders);
    return reminders[index];
  },

  delete: (id: string): boolean => {
    const reminders = ReminderService.getAll();
    const filtered = reminders.filter(r => r.id !== id);
    if (filtered.length === reminders.length) return false;
    setStorageItem(STORAGE_KEYS.REMINDERS, filtered);
    return true;
  },
};

// ============================================
// Notification Service
// ============================================

export const NotificationService = {
  getAll: (): Notification[] => {
    return getStorageItem<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []).map(parseDate);
  },

  getByUser: (userId: string): Notification[] => {
    return NotificationService.getAll()
      .filter(n => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getUnreadCount: (userId: string): number => {
    return NotificationService.getByUser(userId).filter(n => !n.isRead).length;
  },

  create: (data: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Notification => {
    const notifications = NotificationService.getAll();
    const newNotification: Notification = {
      ...data,
      id: generateId(),
      isRead: false,
      createdAt: new Date(),
    };
    notifications.push(newNotification);
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return newNotification;
  },

  markAsRead: (id: string): Notification | undefined => {
    const notifications = NotificationService.getAll();
    const index = notifications.findIndex(n => n.id === id);
    if (index === -1) return undefined;
    
    notifications[index] = { 
      ...notifications[index], 
      isRead: true, 
      readAt: new Date() 
    };
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, notifications);
    return notifications[index];
  },

  markAllAsRead: (userId: string): void => {
    const notifications = NotificationService.getAll();
    const updated = notifications.map(n => {
      if (n.userId === userId && !n.isRead) {
        return { ...n, isRead: true, readAt: new Date() };
      }
      return n;
    });
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, updated);
  },

  delete: (id: string): boolean => {
    const notifications = NotificationService.getAll();
    const filtered = notifications.filter(n => n.id !== id);
    if (filtered.length === notifications.length) return false;
    setStorageItem(STORAGE_KEYS.NOTIFICATIONS, filtered);
    return true;
  },
};

// ============================================
// Chat Service
// ============================================

export const ChatService = {
  getAllSessions: (): ChatSession[] => {
    return getStorageItem<ChatSession[]>(STORAGE_KEYS.CHAT_SESSIONS, []).map(parseDate);
  },

  getSessionsByUser: (userId: string): ChatSession[] => {
    return ChatService.getAllSessions()
      .filter(s => s.userId === userId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  },

  getSessionById: (id: string): ChatSession | undefined => {
    return ChatService.getAllSessions().find(s => s.id === id);
  },

  createSession: (userId: string, title: string = 'New Chat'): ChatSession => {
    const sessions = ChatService.getAllSessions();
    const newSession: ChatSession = {
      id: generateId(),
      userId,
      title,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    sessions.push(newSession);
    setStorageItem(STORAGE_KEYS.CHAT_SESSIONS, sessions);
    return newSession;
  },

  updateSession: (id: string, updates: Partial<ChatSession>): ChatSession | undefined => {
    const sessions = ChatService.getAllSessions();
    const index = sessions.findIndex(s => s.id === id);
    if (index === -1) return undefined;
    
    sessions[index] = { ...sessions[index], ...updates, updatedAt: new Date() };
    setStorageItem(STORAGE_KEYS.CHAT_SESSIONS, sessions);
    return sessions[index];
  },

  deleteSession: (id: string): boolean => {
    const sessions = ChatService.getAllSessions();
    const filtered = sessions.filter(s => s.id !== id);
    if (filtered.length === sessions.length) return false;
    setStorageItem(STORAGE_KEYS.CHAT_SESSIONS, filtered);
    
    // Also delete messages
    const messages = ChatService.getAllMessages();
    const filteredMessages = messages.filter(m => m.userId !== id);
    setStorageItem(STORAGE_KEYS.CHAT_MESSAGES, filteredMessages);
    
    return true;
  },

  getAllMessages: (): ChatMessage[] => {
    return getStorageItem<ChatMessage[]>(STORAGE_KEYS.CHAT_MESSAGES, []).map(parseDate);
  },

  getMessagesBySession: (sessionId: string): ChatMessage[] => {
    return ChatService.getAllMessages()
      .filter(m => {
        const session = ChatService.getSessionById(sessionId);
        return session?.messages.some(sm => sm.id === m.id);
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  },

  addMessage: (sessionId: string, data: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const messages = ChatService.getAllMessages();
    const newMessage: ChatMessage = {
      ...data,
      id: generateId(),
      timestamp: new Date(),
    };
    messages.push(newMessage);
    setStorageItem(STORAGE_KEYS.CHAT_MESSAGES, messages);
    
    // Update session
    const session = ChatService.getSessionById(sessionId);
    if (session) {
      ChatService.updateSession(sessionId, {
        messages: [...session.messages, newMessage],
      });
    }
    
    return newMessage;
  },

  // AI Response Simulation
  generateAIResponse: (userMessage: string, _context?: any): string => {
    const lowerMsg = userMessage.toLowerCase();
    
    if (lowerMsg.includes('hackathon') && lowerMsg.includes('prepare')) {
      return `Here's a comprehensive preparation plan for your hackathon:

**1 Week Before:**
- Research the theme and problem statement
- Form your team and assign roles
- Set up development environment
- Prepare reusable code templates

**3 Days Before:**
- Review previous winning projects
- Plan your tech stack
- Prepare presentation template
- Test all tools and APIs

**Day Of:**
- Arrive early and network
- Start with a clear plan
- Take regular breaks
- Focus on MVP first

Would you like me to elaborate on any specific aspect?`;
    }
    
    if (lowerMsg.includes('team') || lowerMsg.includes('member')) {
      return `Building a great hackathon team is crucial! Here's what I recommend:

**Ideal Team Composition:**
- **Frontend Developer** - UI/UX implementation
- **Backend Developer** - API and database
- **Designer** - Visual design and user experience
- **Presenter** - Pitch and demo preparation

**Tips:**
- Look for complementary skills
- Ensure good communication
- Define roles clearly
- Practice working together

Would you like tips on finding team members or managing team dynamics?`;
    }
    
    if (lowerMsg.includes('idea') || lowerMsg.includes('project')) {
      return `Generating winning hackathon ideas:

**Brainstorming Framework:**
1. Identify the problem space
2. Research existing solutions
3. Find unique angles
4. Consider feasibility
5. Think about impact

**Idea Validation:**
- Is it technically feasible in the time limit?
- Does it solve a real problem?
- Can you demonstrate a working prototype?
- Is it innovative?

**Popular Categories:**
- AI/ML applications
- Sustainability solutions
- Healthcare innovations
- Education tools
- Social impact projects

What theme or problem statement are you working with?`;
    }
    
    if (lowerMsg.includes('pitch') || lowerMsg.includes('present')) {
      return `Creating a winning hackathon pitch:

**Structure (3-5 minutes):**
1. **Hook** (30 sec) - Grab attention with the problem
2. **Problem** (1 min) - Explain what you're solving
3. **Solution** (1 min) - Demo your product
4. **Impact** (30 sec) - Why it matters
5. **Ask** (30 sec) - What you need next

**Tips:**
- Practice multiple times
- Focus on the user story
- Show, don't just tell
- Be confident and enthusiastic
- Prepare for Q&A

Would you like help with your specific pitch?`;
    }
    
    return `That's a great question! As your HackTrack AI assistant, I can help you with:

- **Hackathon preparation** strategies and timelines
- **Team building** and role assignment
- **Project ideation** and validation
- **Technical guidance** on tools and technologies
- **Pitch preparation** and presentation tips
- **Time management** during the event
- **Post-hackathon** next steps

What specific aspect would you like to explore further? Feel free to share more details about your hackathon or project!`;
  },
};

// ============================================
// Calendar Service
// ============================================

export const CalendarService = {
  getAll: (): CalendarSync[] => {
    return getStorageItem<CalendarSync[]>(STORAGE_KEYS.CALENDAR_SYNC, []).map(parseDate);
  },

  getByUser: (userId: string): CalendarSync | undefined => {
    return CalendarService.getAll().find(c => c.userId === userId);
  },

  createOrUpdate: (userId: string, data: Partial<CalendarSync>): CalendarSync => {
    const syncs = CalendarService.getAll();
    const existingIndex = syncs.findIndex(c => c.userId === userId);
    
    if (existingIndex >= 0) {
      syncs[existingIndex] = { 
        ...syncs[existingIndex], 
        ...data, 
        lastSyncedAt: new Date() 
      };
    } else {
      const newSync: CalendarSync = {
        id: generateId(),
        userId,
        isConnected: data.isConnected ?? false,
        syncEnabled: data.syncEnabled ?? true,
        ...data,
        lastSyncedAt: new Date(),
      };
      syncs.push(newSync);
    }
    
    setStorageItem(STORAGE_KEYS.CALENDAR_SYNC, syncs);
    return syncs[existingIndex >= 0 ? existingIndex : syncs.length - 1];
  },

  disconnect: (userId: string): boolean => {
    const syncs = CalendarService.getAll();
    const index = syncs.findIndex(c => c.userId === userId);
    if (index === -1) return false;
    
    syncs[index] = { 
      ...syncs[index], 
      isConnected: false, 
      accessToken: undefined,
      refreshToken: undefined,
    };
    setStorageItem(STORAGE_KEYS.CALENDAR_SYNC, syncs);
    return true;
  },

  // Simulate Google OAuth
  initiateGoogleAuth: async (): Promise<{ success: boolean; error?: string }> => {
    // In a real app, this would open Google OAuth popup
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 1500);
    });
  },

  // Simulate adding event to Google Calendar
  addEvent: async (_event: HackathonEvent, _accessToken?: string): Promise<{ success: boolean; eventId?: string; error?: string }> => {
    // In a real app, this would call Google Calendar API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ 
          success: true, 
          eventId: `google_${generateId()}` 
        });
      }, 1000);
    });
  },

  // Simulate detecting conflicts
  detectConflicts: async (_eventDate: Date, _accessToken?: string): Promise<any[]> => {
    // In a real app, this would fetch user's calendar and check for conflicts
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]); // No conflicts for demo
      }, 800);
    });
  },
};

// ============================================
// Activity Log Service
// ============================================

export const ActivityLogService = {
  getAll: (): ActivityLog[] => {
    return getStorageItem<ActivityLog[]>(STORAGE_KEYS.ACTIVITY_LOGS, []).map(parseDate);
  },

  getByUser: (userId: string): ActivityLog[] => {
    return ActivityLogService.getAll()
      .filter(l => l.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  getRecent: (limit: number = 50): ActivityLog[] => {
    return ActivityLogService.getAll()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  },

  create: (data: Omit<ActivityLog, 'id' | 'createdAt'>): ActivityLog => {
    const logs = ActivityLogService.getAll();
    const newLog: ActivityLog = {
      ...data,
      id: generateId(),
      createdAt: new Date(),
    };
    logs.push(newLog);
    setStorageItem(STORAGE_KEYS.ACTIVITY_LOGS, logs);
    return newLog;
  },

  clear: (): void => {
    setStorageItem(STORAGE_KEYS.ACTIVITY_LOGS, []);
  },
};

// ============================================
// Session Service
// ============================================

export const SessionService = {
  getCurrentUser: (): User | null => {
    const user = getStorageItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    return user ? parseDate(user) : null;
  },

  setCurrentUser: (user: User | null): void => {
    setStorageItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  isAuthenticated: (): boolean => {
    return !!SessionService.getCurrentUser();
  },

  getUserRole: (): UserRole | null => {
    const user = SessionService.getCurrentUser();
    return user?.role || null;
  },

  hasRole: (roles: UserRole[]): boolean => {
    const userRole = SessionService.getUserRole();
    return userRole ? roles.includes(userRole) : false;
  },

  logout: (): void => {
    const user = SessionService.getCurrentUser();
    if (user) {
      ActivityLogService.create({
        userId: user.id,
        action: 'logout',
        entityType: 'user',
        entityId: user.id,
      });
    }
    SessionService.setCurrentUser(null);
  },

  login: (email: string, password: string): { success: boolean; user?: User; error?: string } => {
    const user = UserService.getByEmail(email);
    
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    if (user.password !== password) {
      return { success: false, error: 'Invalid email or password' };
    }
    
    if (user.status !== 'active') {
      return { success: false, error: 'Account is not active. Please contact admin.' };
    }
    
    // Update last login
    UserService.update(user.id, { lastLoginAt: new Date() });
    
    // Set session
    SessionService.setCurrentUser(user);
    
    // Log activity
    ActivityLogService.create({
      userId: user.id,
      action: 'login',
      entityType: 'user',
      entityId: user.id,
    });
    
    return { success: true, user };
  },
};

// ============================================
// AI Extraction Service
// ============================================

export const AIExtractionService = {
  extractFromBrochure: async (file: File): Promise<{
    success: boolean;
    data?: {
      eventName: string;
      date: string;
      time: string;
      venue: string;
      isOnline: boolean;
      registrationDeadline: string;
      teamSize: string;
      instructions: string;
    };
    error?: string;
  }> => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted data based on file name
    const fileName = file.name.toLowerCase();
    
    if (fileName.includes('hack') || fileName.includes('tech')) {
      return {
        success: true,
        data: {
          eventName: 'TechHack 2025',
          date: '2025-03-15',
          time: '09:00 AM - 06:00 PM',
          venue: 'Innovation Center, Tech Park',
          isOnline: false,
          registrationDeadline: '2025-03-10',
          teamSize: '2-4 members',
          instructions: 'Bring your own laptop. Food and refreshments will be provided. Theme will be announced on the day of the event.',
        },
      };
    }
    
    if (fileName.includes('code') || fileName.includes('dev')) {
      return {
        success: true,
        data: {
          eventName: 'CodeFest Hackathon',
          date: '2025-04-20',
          time: '10:00 AM - 08:00 PM',
          venue: 'Online (Virtual Event)',
          isOnline: true,
          registrationDeadline: '2025-04-18',
          teamSize: '1-3 members',
          instructions: 'Virtual event. Join link will be sent to registered participants. Ensure stable internet connection.',
        },
      };
    }
    
    // Default extraction
    return {
      success: true,
      data: {
        eventName: 'Hackathon Event',
        date: '2025-05-01',
        time: '09:00 AM - 05:00 PM',
        venue: 'TBD',
        isOnline: false,
        registrationDeadline: '2025-04-25',
        teamSize: '2-5 members',
        instructions: 'Please check the brochure for detailed instructions.',
      },
    };
  },
};

// ============================================
// Initialize Database
// ============================================

export const initializeDatabase = (): void => {
  UserService.initDefaultAdmin();
};

// ============================================
// Export All Services
// ============================================

export const Database = {
  User: UserService,
  PendingRequest: PendingRequestService,
  Profile: ProfileService,
  Event: EventService,
  Task: TaskService,
  Reminder: ReminderService,
  Notification: NotificationService,
  Chat: ChatService,
  Calendar: CalendarService,
  ActivityLog: ActivityLogService,
  Session: SessionService,
  AIExtraction: AIExtractionService,
  initialize: initializeDatabase,
};

export default Database;
