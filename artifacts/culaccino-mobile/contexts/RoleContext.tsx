import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Role = 'manager' | 'employee';

// Matches the web app's key
const ROLE_KEY = 'culaccino_role';

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => Promise<void>;
  isManager: boolean;
}

const RoleContext = createContext<RoleContextType | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<Role>('employee');

  useEffect(() => {
    AsyncStorage.getItem(ROLE_KEY).then(stored => {
      if (stored === 'manager' || stored === 'employee') {
        setRoleState(stored);
      }
    });
  }, []);

  const setRole = useCallback(async (next: Role) => {
    setRoleState(next);
    await AsyncStorage.setItem(ROLE_KEY, next);
  }, []);

  return (
    <RoleContext.Provider value={{ role, setRole, isManager: role === 'manager' }}>
      {children}
    </RoleContext.Provider>
  );
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used within RoleProvider');
  return ctx;
}
