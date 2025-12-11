'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, RefreshCw } from 'lucide-react';
import Card from '@/components/Card';
import { getAudit, AuditLog } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminAuditPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isAdmin) {
      loadAudit();
    }
  }, [isAdmin]);

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

  async function loadAudit() {
    try {
      const data = await getAudit();
      setAuditLogs(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Audit Logs</h1>
          <p className="text-muted">View system audit trail</p>
        </div>
        <button
          onClick={loadAudit}
          className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-muted hover:text-neon
                 hover:bg-neon/10 rounded-lg border border-neon/20
                 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      <Card>
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-pulse text-neon">Loading audit logs...</div>
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No audit logs found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neon/20">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Actor ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Action</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Details</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="border-b border-neon/10 hover:bg-neon/5 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <span className="text-sm text-ice font-mono">
                        {log.actor_id ?? '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-white font-medium">{log.action}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-sm text-muted">
                        {log.details || '—'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

