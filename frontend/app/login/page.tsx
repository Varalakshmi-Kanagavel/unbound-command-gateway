'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Key, LogIn } from 'lucide-react';
import Card from '@/components/Card';
import { getCredits, getAudit } from '@/utils/api';
import toast from 'react-hot-toast';

function sanitizeApiKey(raw: string) {
  if (!raw) return '';
  // trim and remove zero-width / non ISO-8859-1 characters
  let s = raw.trim();
  s = s.replace(/[\u200B-\u200D\uFEFF]/g, ''); // zero width characters
  s = s.replace(/[^\x00-\xFF]/g, ''); // drop non ISO-8859-1 chars
  return s;
}

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const cleaned = sanitizeApiKey(apiKey);
    if (!cleaned) {
      toast.error('Please enter a valid API key');
      return;
    }

    // Save the cleaned key immediately so other client code can read it
    localStorage.setItem('api_key', cleaned);
    // Set a non-secret cookie flag for middleware route protection
    document.cookie = 'api_key=authenticated; path=/; max-age=86400';

    setIsLoading(true);

    try {
      // Validate the key by fetching credits
      await getCredits();

      // Determine admin status by attempting to read audit
      let isAdmin = false;
      try {
        await getAudit();
        isAdmin = true;
      } catch {
        isAdmin = false;
      }

      // Persist a small non-secret flag for quick client checks
      localStorage.setItem('is_admin', isAdmin ? '1' : '0');

      toast.success('Login successful!');
      // small delay so the toast is visible
      setTimeout(() => router.push('/dashboard'), 200);
    } catch (error: any) {
      // Remove stored key on failure
      localStorage.removeItem('api_key');
      localStorage.removeItem('is_admin');
      document.cookie = 'api_key=; path=/; max-age=0';
      toast.error((error && error.message) || 'Invalid API key. Please try again.');
      setIsLoading(false);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-neon/10 border border-neon/30 mb-4">
              <Key className="w-8 h-8 text-neon" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to CommandX</h1>
            <p className="text-muted">Enter your API key to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4" autoComplete="off">
            <div>
              <label htmlFor="api-key" className="block text-sm font-medium text-muted mb-2">
                API Key
              </label>
              <input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your API key here"
                disabled={isLoading}
                className="w-full bg-background border border-neon/20 rounded-lg px-4 py-3
                         text-white font-mono text-sm
                         focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon
                         disabled:opacity-50 disabled:cursor-not-allowed
                         placeholder:text-muted"
                aria-label="API Key input"
                autoFocus
                inputMode="text"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !apiKey.trim()}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3
                       bg-neon/20 hover:bg-neon/30 border border-neon/30 rounded-lg
                       text-neon font-medium
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-neon border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-neon/20">
            <p className="text-xs text-muted text-center">
              Don't have an API key? Contact your administrator.
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
