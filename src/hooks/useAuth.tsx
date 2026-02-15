// ============================================
// HackTrack - Authentication Hook & Context
// ============================================

import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, UserRole, Profile, PendingRequest } from '@/types';
import { Database } from '@/services/database';

// ============================================
// Auth Context Types
// ============================================

interface AuthContextType {
  // User state
  user: User | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Auth actions
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; isFirstLogin?: boolean }>;
  logout: () => void;
  requestAccess: (data: { email: string; fullName: string; reason: string }) => Promise<{ success: boolean; error?: string }>;
  
  // Profile
  completeProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  hasCompletedProfile: boolean;
  
  // Role checks
  isMainAdmin: boolean;
  isAdmin: boolean;
  isNormalUser: boolean;
  hasRole: (roles: UserRole[]) => boolean;
  
  // Refresh
  refreshUser: () => void;
}

// ============================================
// Create Context
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================
// Auth Provider
// ============================================

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const initAuth = () => {
      try {
        Database.initialize();
        const currentUser = Database.Session.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const userProfile = Database.Profile.getByUserId(currentUser.id);
          setProfile(userProfile || null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // Refresh user data
  const refreshUser = useCallback(() => {
    const currentUser = Database.Session.getCurrentUser();
    if (currentUser) {
      const updatedUser = Database.User.getById(currentUser.id);
      if (updatedUser) {
        setUser(updatedUser);
        Database.Session.setCurrentUser(updatedUser);
      }
      const userProfile = Database.Profile.getByUserId(currentUser.id);
      setProfile(userProfile || null);
    }
  }, []);

  // Login
  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string; isFirstLogin?: boolean }> => {
    try {
      const result = Database.Session.login(email, password);
      
      if (result.success && result.user) {
        setUser(result.user);
        const userProfile = Database.Profile.getByUserId(result.user.id);
        setProfile(userProfile || null);
        
        return { 
          success: true, 
          isFirstLogin: result.user.isFirstLogin 
        };
      }
      
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'An unexpected error occurred' };
    }
  }, []);

  // Logout
  const logout = useCallback(() => {
    Database.Session.logout();
    setUser(null);
    setProfile(null);
  }, []);

  // Request access
  const requestAccess = useCallback(async (data: { email: string; fullName: string; reason: string }): Promise<{ success: boolean; error?: string }> => {
    try {
      // Check if email already exists
      const existingUser = Database.User.getByEmail(data.email);
      if (existingUser) {
        return { success: false, error: 'An account with this email already exists' };
      }

      // Check if request already pending
      const pendingRequests = Database.PendingRequest.getAll();
      const existingRequest = pendingRequests.find(r => 
        r.email.toLowerCase() === data.email.toLowerCase() && r.status === 'pending'
      );
      if (existingRequest) {
        return { success: false, error: 'A request with this email is already pending' };
      }

      // Create pending request
      Database.PendingRequest.create({
        email: data.email,
        fullName: data.fullName,
        reason: data.reason,
      });

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to submit request' };
    }
  }, []);

  // Complete profile (first time)
  const completeProfile = useCallback(async (data: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const profileData: Partial<Profile> = {
        ...data,
        userId: user.id,
        email: user.email,
      };

      const newProfile = Database.Profile.create(profileData as any);
      setProfile(newProfile);

      // Mark first login as complete
      Database.User.update(user.id, { isFirstLogin: false });
      refreshUser();

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Failed to complete profile' };
    }
  }, [user, refreshUser]);

  // Update profile
  const updateProfile = useCallback(async (data: Partial<Profile>): Promise<{ success: boolean; error?: string }> => {
    try {
      if (!user) {
        return { success: false, error: 'User not authenticated' };
      }

      const updated = Database.Profile.update(user.id, data);
      if (updated) {
        setProfile(updated);
        return { success: true };
      }

      return { success: false, error: 'Profile not found' };
    } catch (error) {
      return { success: false, error: 'Failed to update profile' };
    }
  }, [user]);

  // Role checks
  const isMainAdmin = user?.role === 'main_admin';
  const isAdmin = user?.role === 'admin' || user?.role === 'main_admin';
  const isNormalUser = user?.role === 'user';
  
  const hasRole = useCallback((roles: UserRole[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  // Check if profile is completed
  const hasCompletedProfile = !!profile && 
    !!profile.fullName && 
    !!profile.mobileNumber && 
    !!profile.universityRollNumber;

  const value: AuthContextType = {
    user,
    profile,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    requestAccess,
    completeProfile,
    updateProfile,
    hasCompletedProfile,
    isMainAdmin,
    isAdmin,
    isNormalUser,
    hasRole,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// Use Auth Hook
// ============================================

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
