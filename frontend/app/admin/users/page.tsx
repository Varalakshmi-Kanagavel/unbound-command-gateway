'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Copy, Check, X } from 'lucide-react';
import Card from '@/components/Card';
import { createUser, UserCreateResponse } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminUsersPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [createdApiKey, setCreatedApiKey] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: 'member' as 'admin' | 'member',
    credits: 100,
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-pulse text-neon text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    router.push('/dashboard');
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response: UserCreateResponse = await createUser(
        formData.name,
        formData.role,
        formData.credits
      );

      setCreatedApiKey(response.api_key);
      setShowApiKeyModal(true);
      setFormData({ name: '', role: 'member', credits: 100 });
      toast.success('User created successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create user');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopyApiKey() {
    try {
      await navigator.clipboard.writeText(createdApiKey);
      setCopied(true);
      toast.success('API key copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy API key');
    }
  }

  function handleConfirmSaved() {
    setShowApiKeyModal(false);
    setCreatedApiKey('');
    toast.success('User creation completed');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Create User</h1>
        <p className="text-muted">Create a new user account</p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-muted mb-2">
              Name
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="w-full bg-background border border-neon/20 rounded-lg px-4 py-3
                     text-white focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon
                     placeholder:text-muted"
              placeholder="Enter user name"
              aria-label="User name"
            />
          </div>

          <div>
            <label htmlFor="role" className="block text-sm font-medium text-muted mb-2">
              Role
            </label>
            <select
              id="role"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value as 'admin' | 'member' })
              }
              className="w-full bg-background border border-neon/20 rounded-lg px-4 py-3
                     text-white focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon"
              aria-label="User role"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label htmlFor="credits" className="block text-sm font-medium text-muted mb-2">
              Initial Credits
            </label>
            <input
              id="credits"
              type="number"
              min="0"
              value={formData.credits}
              onChange={(e) =>
                setFormData({ ...formData, credits: parseInt(e.target.value) || 0 })
              }
              required
              className="w-full bg-background border border-neon/20 rounded-lg px-4 py-3
                     text-white focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon
                     placeholder:text-muted"
              placeholder="100"
              aria-label="Initial credits"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.name.trim()}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3
                   bg-neon/20 hover:bg-neon/30 border border-neon/30 rounded-lg
                   text-neon font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50"
          >
            <UserPlus className="w-5 h-5" />
            <span>{isSubmitting ? 'Creating...' : 'Create User'}</span>
          </button>
        </form>
      </Card>

      {/* API Key Modal */}
      <AnimatePresence>
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-neon/30 rounded-lg p-6 max-w-md w-full shadow-[0_0_40px_rgba(0,230,168,0.3)]"
            >
              <div className="mb-4">
                <h2 className="text-xl font-bold text-white mb-2">User Created Successfully</h2>
                <p className="text-sm text-muted mb-4">
                  This API key will only be shown once. Please save it securely.
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-muted mb-2">
                  API Key
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={createdApiKey}
                    readOnly
                    className="flex-1 bg-background border border-neon/20 rounded-lg px-4 py-3
                           text-neon font-mono text-sm focus:outline-none"
                  />
                  <button
                    onClick={handleCopyApiKey}
                    className="p-3 bg-neon/10 hover:bg-neon/20 border border-neon/30 rounded-lg
                         text-neon transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50"
                    aria-label="Copy API key"
                  >
                    {copied ? (
                      <Check className="w-5 h-5 text-success" />
                    ) : (
                      <Copy className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleConfirmSaved}
                  className="flex-1 px-4 py-2 bg-neon/20 hover:bg-neon/30 border border-neon/30 rounded-lg
                         text-neon font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50"
                >
                  I saved this key
                </button>
                <button
                  onClick={() => {
                    setShowApiKeyModal(false);
                    setCreatedApiKey('');
                  }}
                  className="px-4 py-2 bg-error/10 hover:bg-error/20 border border-error/30 rounded-lg
                         text-error font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-error/50"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

