'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Trash2 } from 'lucide-react';
import { runCommand } from '@/utils/api';
import Badge from './Badge';
import toast from 'react-hot-toast';

interface LogEntry {
  id: number;
  command: string;
  status: 'executed' | 'rejected' | 'pending';
  result: string | null;
  timestamp: Date;
}

export default function CommandTerminal() {
  const [command, setCommand] = useState('');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new log entry is added
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  async function handleRun() {
    if (!command.trim() || isRunning) return;

    const commandText = command.trim();
    setCommand('');
    
    // Add pending entry
    const pendingId = Date.now();
    setLogs((prev) => [
      ...prev,
      {
        id: pendingId,
        command: commandText,
        status: 'pending',
        result: null,
        timestamp: new Date(),
      },
    ]);

    setIsRunning(true);

    try {
      const response = await runCommand(commandText);
      
      // Update pending entry with result
      setLogs((prev) =>
        prev.map((log) =>
          log.id === pendingId
            ? {
                ...log,
                status: response.status === 'executed' ? 'executed' : 'rejected',
                result: response.result || null,
              }
            : log
        )
      );

      if (response.status === 'executed') {
        toast.success('Command executed successfully');
      } else {
        toast.error('Command was rejected');
      }
    } catch (error: any) {
      // Update pending entry with error
      setLogs((prev) =>
        prev.map((log) =>
          log.id === pendingId
            ? {
                ...log,
                status: 'rejected',
                result: error.message || 'Command failed',
              }
            : log
        )
      );
      toast.error(error.message || 'Failed to execute command');
    } finally {
      setIsRunning(false);
      inputRef.current?.focus();
    }
  }

  function handleClear() {
    setLogs([]);
    toast.success('Terminal cleared');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRun();
    } else if (e.ctrlKey && e.key === 'l') {
      e.preventDefault();
      handleClear();
    }
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Terminal Header */}
      <div className="bg-surface border-b border-neon/20 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-error"></div>
          <div className="w-3 h-3 rounded-full bg-ice"></div>
          <div className="w-3 h-3 rounded-full bg-success"></div>
          <span className="ml-2 text-xs text-muted font-mono">Terminal</span>
        </div>
        <button
          onClick={handleClear}
          className="p-1.5 rounded hover:bg-neon/10 text-muted hover:text-neon transition-colors"
          aria-label="Clear terminal"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Log Area */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {logs.length === 0 ? (
          <div className="text-muted text-center py-8">
            <p>No commands executed yet.</p>
            <p className="text-xs mt-2">Type a command and press Enter to run.</p>
          </div>
        ) : (
          <AnimatePresence>
            {logs.map((log) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4"
              >
                <div className="flex items-start space-x-3">
                  <span className="text-neon">$</span>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-ice">{log.command}</span>
                      <Badge status={log.status}>
                        {log.status === 'executed' ? 'executed' : log.status === 'rejected' ? 'rejected' : 'pending'}
                      </Badge>
                    </div>
                    {log.result && (
                      <div className={`mt-2 p-2 rounded ${
                        log.status === 'executed' 
                          ? 'bg-success/10 text-success border border-success/20' 
                          : 'bg-error/10 text-error border border-error/20'
                      }`}>
                        <pre className="whitespace-pre-wrap break-words">{log.result}</pre>
                      </div>
                    )}
                    <div className="text-xs text-muted mt-1">
                      {log.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
        <div ref={logEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-surface border-t border-neon/20 p-4">
        <div className="flex items-center space-x-2">
          <span className="text-neon font-mono">$</span>
          <input
            ref={inputRef}
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter command..."
            disabled={isRunning}
            className="flex-1 bg-background border border-neon/20 rounded px-3 py-2 text-ice font-mono text-sm
                     focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon
                     disabled:opacity-50 disabled:cursor-not-allowed
                     placeholder:text-muted"
            aria-label="Command input"
          />
          <button
            onClick={handleRun}
            disabled={!command.trim() || isRunning}
            className="px-4 py-2 bg-neon/20 hover:bg-neon/30 border border-neon/30 rounded
                     text-neon font-medium text-sm
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50
                     flex items-center space-x-2"
            aria-label="Run command"
          >
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Run</span>
          </button>
        </div>
        <div className="text-xs text-muted mt-2 flex items-center justify-between">
          <span>Press Enter to run • Ctrl+L to clear</span>
          {isRunning && <span className="text-ice animate-pulse">Executing...</span>}
        </div>
      </div>
    </div>
  );
}

