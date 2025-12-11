'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAudit } from '@/utils/api';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    if (typeof window === 'undefined') {
      setIsLoading(false);
      return;
    }

    const apiKey = localStorage.getItem('api_key');
    
    if (!apiKey) {
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);

    // Check admin status by attempting to access audit endpoint
    try {
      await getAudit();
      setIsAdmin(true);
    } catch (error) {
      // If we get 403/401, user is not admin
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('api_key');
    // Clear session cookie
    document.cookie = 'api_key=; path=/; max-age=0';
    setIsAuthenticated(false);
    setIsAdmin(false);
    router.push('/login');
  }

  function getApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('api_key');
  }

  return {
    isAuthenticated,
    isAdmin,
    isLoading,
    logout,
    getApiKey,
    checkAuth,
  };
}

