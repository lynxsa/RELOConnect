import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type UserRole = 'user' | 'driver' | 'both';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  primaryRole: 'user' | 'driver';
  isDriverVerified: boolean;
  driverStatus?: 'online' | 'offline' | 'busy';
  vehicleInfo?: {
    type: string;
    licensePlate: string;
    model: string;
    year: number;
  };
  earnings?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
}

interface UserContextType {
  user: UserProfile | null;
  isDriverMode: boolean;
  isLoading: boolean;
  canBeDriver: boolean;
  
  // User management
  setUser: (user: UserProfile) => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  
  // Role management
  toggleDriverMode: () => void;
  setDriverMode: (enabled: boolean) => void;
  enableDriverRole: () => void;
  
  // Driver status
  setDriverStatus: (status: 'online' | 'offline' | 'busy') => void;
  
  // Persistence
  saveUserData: () => Promise<void>;
  loadUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<UserProfile | null>(null);
  const [isDriverMode, setIsDriverMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize user data on app start
  useEffect(() => {
    loadUserData();
  }, []);

  const setUser = (newUser: UserProfile) => {
    setUserState(newUser);
    setIsDriverMode(newUser.primaryRole === 'driver');
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUserState(updatedUser);
      saveUserData();
    }
  };

  const toggleDriverMode = () => {
    if (user && (user.role === 'both' || user.role === 'driver')) {
      const newDriverMode = !isDriverMode;
      setIsDriverMode(newDriverMode);
      
      // Update primary role based on current mode
      updateUser({
        primaryRole: newDriverMode ? 'driver' : 'user'
      });
    }
  };

  const setDriverMode = (enabled: boolean) => {
    if (user && (user.role === 'both' || user.role === 'driver')) {
      setIsDriverMode(enabled);
      updateUser({
        primaryRole: enabled ? 'driver' : 'user'
      });
    }
  };

  const enableDriverRole = () => {
    if (user) {
      const newRole: UserRole = user.role === 'user' ? 'both' : user.role;
      updateUser({ role: newRole, isDriverVerified: false });
    }
  };

  const setDriverStatus = (status: 'online' | 'offline' | 'busy') => {
    if (user && user.role !== 'user') {
      updateUser({ driverStatus: status });
    }
  };

  const saveUserData = async () => {
    try {
      if (user) {
        await AsyncStorage.multiSet([
          ['@user_profile', JSON.stringify(user)],
          ['@driver_mode', JSON.stringify(isDriverMode)]
        ]);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const [[, userDataStr], [, driverModeStr]] = await AsyncStorage.multiGet([
        '@user_profile',
        '@driver_mode'
      ]);

      if (userDataStr) {
        const userData: UserProfile = JSON.parse(userDataStr);
        setUserState(userData);
      }

      if (driverModeStr) {
        setIsDriverMode(JSON.parse(driverModeStr));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      // Set default user for development
      setUserState({
        id: 'demo-user-1',
        name: 'Demo User',
        email: 'demo@reloconnect.co.za',
        phone: '+27 82 123 4567',
        role: 'both',
        primaryRole: 'user',
        isDriverVerified: true,
        driverStatus: 'offline',
        vehicleInfo: {
          type: 'bakkie',
          licensePlate: 'GP 123-456',
          model: 'Toyota Hilux',
          year: 2020
        },
        earnings: {
          today: 450,
          thisWeek: 2800,
          thisMonth: 12500,
          total: 48750
        }
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isDriverMode,
        isLoading,
        canBeDriver: user ? user.role !== 'user' : false,
        setUser,
        updateUser,
        toggleDriverMode,
        setDriverMode,
        enableDriverRole,
        setDriverStatus,
        saveUserData,
        loadUserData
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;
