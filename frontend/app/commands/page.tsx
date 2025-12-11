'use client';

import CommandTerminal from '@/components/CommandTerminal';

export default function CommandsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Command Console</h1>
        <p className="text-muted">Execute commands through the secure gateway</p>
      </div>
      <div className="h-[calc(100vh-12rem)] rounded-lg overflow-hidden border border-neon/20">
        <CommandTerminal />
      </div>
    </div>
  );
}

