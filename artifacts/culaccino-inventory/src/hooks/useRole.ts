import { useState, useEffect, useCallback } from 'react';
import { Role } from '../types/inventory';
import { ROLE_KEY } from '../lib/storage';

export function useRole() {
  const [role, setRoleState] = useState<Role>(() => {
    return (localStorage.getItem(ROLE_KEY) as Role) || "manager";
  });

  useEffect(() => {
    const handleRoleChange = () => {
      const currentRole = (localStorage.getItem(ROLE_KEY) as Role) || "manager";
      setRoleState(currentRole);
    };
    window.addEventListener('role-updated', handleRoleChange);
    return () => window.removeEventListener('role-updated', handleRoleChange);
  }, []);

  const setRole = useCallback((newRole: Role) => {
    localStorage.setItem(ROLE_KEY, newRole);
    window.dispatchEvent(new Event('role-updated'));
  }, []);

  return { role, setRole };
}
