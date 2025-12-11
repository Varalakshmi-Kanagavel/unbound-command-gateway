'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Shield, Beaker } from 'lucide-react';
import Card from '@/components/Card';
import Badge from '@/components/Badge';
import { getRules, addRule, Rule } from '@/utils/api';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function AdminRulesPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    pattern: '',
    action: 'AUTO_REJECT' as 'AUTO_ACCEPT' | 'AUTO_REJECT',
  });
  const [patternError, setPatternError] = useState<string>('');
  const [testerPattern, setTesterPattern] = useState('');
  const [testerCommand, setTesterCommand] = useState('');
  const [testerResult, setTesterResult] = useState<string>('');

  useEffect(() => {
    if (isAdmin) {
      loadRules();
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

  async function loadRules() {
    try {
      const data = await getRules();
      setRules(data);
    } catch (error: any) {
      toast.error(error.message || 'Failed to load rules');
    } finally {
      setIsLoading(false);
    }
  }

  function validateRegex(pattern: string): boolean {
    if (!pattern.trim()) {
      setPatternError('Pattern cannot be empty');
      return false;
    }

    try {
      new RegExp(pattern);
      setPatternError('');
      return true;
    } catch (error) {
      setPatternError('Invalid regex pattern');
      return false;
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!validateRegex(formData.pattern)) {
      return;
    }

    setIsSubmitting(true);

    try {
      await addRule(formData.pattern, formData.action);
      toast.success('Rule added successfully!');
      setFormData({ pattern: '', action: 'AUTO_REJECT' });
      loadRules();
    } catch (error: any) {
      toast.error(error.message || 'Failed to add rule');
    } finally {
      setIsSubmitting(false);
    }
  }

  function testRule() {
    const pattern = testerPattern.trim() || formData.pattern.trim();
    const command = testerCommand;

    if (!pattern) {
      setTesterResult('Enter a regex pattern to test.');
      return;
    }
    if (!command) {
      setTesterResult('Enter a sample command to test against.');
      return;
    }

    try {
      const regex = new RegExp(pattern);
      const matched = regex.exec(command);
      if (matched) {
        setTesterResult(
          `Match ✅ — Pattern matches. First match: "${matched[0]}" at index ${matched.index}.`
        );
      } else {
        setTesterResult('No match ❌ — The pattern did not match this command.');
      }
    } catch {
      setTesterResult('Invalid regex pattern. Please fix the pattern.');
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Rules Management</h1>
        <p className="text-muted">Manage command validation rules</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add Rule Form */}
        <Card>
          <div className="flex items-center space-x-2 mb-6">
            <Shield className="w-5 h-5 text-neon" />
            <h2 className="text-xl font-semibold text-white">Add Rule</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="pattern" className="block text-sm font-medium text-muted mb-2">
                Regex Pattern
              </label>
              <input
                id="pattern"
                type="text"
                value={formData.pattern}
                onChange={(e) => {
                  setFormData({ ...formData, pattern: e.target.value });
                  if (patternError) {
                    validateRegex(e.target.value);
                  }
                }}
                onBlur={() => validateRegex(formData.pattern)}
                required
                className={`w-full bg-background border rounded-lg px-4 py-3
                     text-white font-mono text-sm
                     focus:outline-none focus:ring-2 focus:border-neon
                     placeholder:text-muted
                     ${
                       patternError
                         ? 'border-error focus:ring-error/50'
                         : 'border-neon/20 focus:ring-neon/50'
                     }`}
                placeholder="^rm -rf"
                aria-label="Regex pattern"
              />
              {patternError && (
                <p className="mt-1 text-xs text-error">{patternError}</p>
              )}
              <p className="mt-1 text-xs text-muted">
                Enter a valid regex pattern to match commands
              </p>
            </div>

            <div>
              <label htmlFor="action" className="block text-sm font-medium text-muted mb-2">
                Action
              </label>
              <select
                id="action"
                value={formData.action}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    action: e.target.value as 'AUTO_ACCEPT' | 'AUTO_REJECT',
                  })
                }
                className="w-full bg-background border border-neon/20 rounded-lg px-4 py-3
                     text-white focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon"
                aria-label="Rule action"
              >
                <option value="AUTO_REJECT">Auto Reject</option>
                <option value="AUTO_ACCEPT">Auto Accept</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || !formData.pattern.trim() || !!patternError}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3
                   bg-neon/20 hover:bg-neon/30 border border-neon/30 rounded-lg
                   text-neon font-medium
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50"
            >
              <Plus className="w-5 h-5" />
              <span>{isSubmitting ? 'Adding...' : 'Add Rule'}</span>
            </button>
          </form>
        </Card>

        {/* Rules List */}
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-ice" />
              <h2 className="text-xl font-semibold text-white">Active Rules</h2>
            </div>
            <button
              onClick={loadRules}
              className="text-sm text-muted hover:text-neon transition-colors"
            >
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-pulse text-neon">Loading rules...</div>
            </div>
          ) : rules.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted">No rules configured yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {rules.map((rule) => (
                <motion.div
                  key={rule.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-background border border-neon/20 rounded-lg"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <code className="text-sm text-ice font-mono bg-surface px-2 py-1 rounded block mb-2">
                        {rule.pattern}
                      </code>
                      <Badge
                        status={
                          rule.action === 'AUTO_ACCEPT' ? 'success' : 'error'
                        }
                      >
                        {rule.action === 'AUTO_ACCEPT' ? 'Auto Accept' : 'Auto Reject'}
                      </Badge>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Rule Tester */}
      <div className="mt-6">
        <Card>
          <div className="flex items-center space-x-2 mb-4">
            <Beaker className="w-5 h-5 text-ice" />
            <h2 className="text-lg font-semibold text-white">Rule Tester</h2>
          </div>
          <p className="text-sm text-muted mb-4">
            Try a regex pattern against a sample command to verify behavior before saving.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted">Regex Pattern</label>
              <input
                value={testerPattern}
                onChange={(e) => setTesterPattern(e.target.value)}
                placeholder="Use current form pattern or enter a new one"
                className="w-full bg-background border border-neon/20 rounded-lg px-4 py-3
                       text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon
                       placeholder:text-muted"
              />
              <p className="text-xs text-muted">
                If left blank, the pattern from the add-rule form will be used.
              </p>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted">Sample Command</label>
              <input
                value={testerCommand}
                onChange={(e) => setTesterCommand(e.target.value)}
                placeholder="e.g., rm -rf /tmp"
                className="w-full bg-background border border-neon/20 rounded-lg px-4 py-3
                       text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-neon/50 focus:border-neon
                       placeholder:text-muted"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={testRule}
              className="px-4 py-2 bg-neon/20 hover:bg-neon/30 border border-neon/30 rounded-lg
                     text-neon font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-neon/50"
            >
              Test Rule
            </button>
            {testerResult && (
              <span
                className={`text-sm ${
                  testerResult.includes('Match') ? 'text-success' : testerResult.includes('Invalid') ? 'text-error' : 'text-muted'
                }`}
              >
                {testerResult}
              </span>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

