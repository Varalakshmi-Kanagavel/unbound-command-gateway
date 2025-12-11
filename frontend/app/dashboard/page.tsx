'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Terminal, History, Shield, Coins } from 'lucide-react';
import Card from '@/components/Card';
import { getCredits } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const [credits, setCredits] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadCredits();
  }, []);

  async function loadCredits() {
    try {
      const data = await getCredits();
      setCredits(data.credits);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load credits');
    } finally {
      setIsLoading(false);
    }
  }

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <div className="animate-pulse text-neon text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  const actions = [
    {
      title: 'Run Command',
      description: 'Execute commands through the terminal interface',
      href: '/commands',
      icon: Terminal,
      bgClass: 'bg-neon/10',
      borderClass: 'border-neon/30',
      textClass: 'text-neon',
    },
    {
      title: 'Command History',
      description: 'View your command execution history',
      href: '/history',
      icon: History,
      bgClass: 'bg-ice/10',
      borderClass: 'border-ice/30',
      textClass: 'text-ice',
    },
  ];

  if (isAdmin) {
    actions.push({
      title: 'Admin Panel',
      description: 'Manage users, rules, and view audit logs',
      href: '/admin/users',
      icon: Shield,
      bgClass: 'bg-neon/10',
      borderClass: 'border-neon/30',
      textClass: 'text-neon',
    });
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-muted">Welcome to CommandX</p>
      </motion.div>

      {/* Credits Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <Card>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-lg bg-neon/10 border border-neon/30">
                <Coins className="w-6 h-6 text-neon" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-muted">Available Credits</h2>
                <p className="text-3xl font-bold text-white">
                  {credits !== null ? credits : '—'}
                </p>
              </div>
            </div>
            <button
              onClick={loadCredits}
              className="px-4 py-2 text-sm font-medium text-muted hover:text-neon
                     hover:bg-neon/10 rounded-lg border border-neon/20
                     transition-colors"
            >
              Refresh
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.div
              key={action.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
            >
              <Link href={action.href}>
                <Card className="h-full hover:scale-105 transition-transform cursor-pointer">
                  <div className="flex flex-col h-full">
                    <div className={`p-3 rounded-lg ${action.bgClass} border ${action.borderClass} w-fit mb-4`}>
                      <Icon className={`w-6 h-6 ${action.textClass}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {action.title}
                    </h3>
                    <p className="text-muted text-sm flex-1">
                      {action.description}
                    </p>
                    <div className="mt-4 text-neon text-sm font-medium">
                      Go to {action.title} →
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

