
'use client';

import { useState, useEffect, useCallback } from 'react';
import type { User } from '@/lib/types';

const SESSION_KEY = 'bni_user_session';

export function useSession() {
  const [user, setUserState] = useState<User | null>(null);
  const [isSessionLoading, setIsSessionLoading] = useState(true);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem(SESSION_KEY);
      if (storedUser) {
        setUserState(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Tidak bisa mengakses localStorage untuk sesi:", error);
    } finally {
      setIsSessionLoading(false);
    }
  }, []);

  const setUser = useCallback((userData: User) => {
    try {
      const userToStore = { 
        id: userData.id,
        email: userData.email, 
        username: userData.username, 
        phone_number: userData.phone_number,
        balance: userData.balance
      };
      localStorage.setItem(SESSION_KEY, JSON.stringify(userToStore));
      setUserState(userToStore);
    } catch (error) {
      console.error("Tidak bisa menyimpan sesi ke localStorage:", error);
    }
  }, []);

  const clearSession = useCallback(() => {
    try {
      localStorage.removeItem(SESSION_KEY);
      setUserState(null);
    } catch (error) {
      console.error("Tidak bisa menghapus sesi dari localStorage:", error);
    }
  }, []);

  return { user, setUser, clearSession, isSessionLoading };
}
