'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { getHistory, Command } from '@/utils/api';
import toast from 'react-hot-toast';

export default function HistoryPage() {
  const [commands, setCommands] = useState<Command[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    try {
      const data = await getHistory();
      setCommands(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load command history');
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-pulse text-neon text-xl">Loading history...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Command History</h1>
          <p className="text-muted">View your executed commands</p>
        </div>
        <button
          onClick={loadHistory}
          className="px-4 py-2 text-sm font-medium text-muted hover:text-neon
                 hover:bg-neon/10 rounded-lg border border-neon/20
                 transition-colors"
        >
          Refresh
        </button>
      </div>

      {commands.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <p className="text-muted">No commands executed yet.</p>
            <p className="text-sm text-muted mt-2">
              Go to the Console to execute your first command.
            </p>
          </div>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Command</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Result</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {commands.map((cmd) => (
                  <motion.tr
                    key={cmd.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-neon/10 hover:bg-neon/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <code className="text-sm text-ice font-mono bg-background px-2 py-1 rounded">
                        {cmd.command_text}
                      </code>
                    </td>
                    <td className="py-4 px-4">
                      <Badge
                        status={
                          cmd.status === 'executed'
                            ? 'executed'
                            : cmd.status === 'rejected'
                            ? 'rejected'
                            : 'pending'
                        }
                      >
                        {cmd.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      {cmd.result ? (
                        <div className="max-w-md truncate text-sm text-muted">
                          {cmd.result}
                        </div>
                      ) : (
                        <span className="text-muted text-sm">—</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-sm text-muted">
                      {new Date(cmd.created_at).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

