import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'react-hot-toast';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'CommandX - Command Gateway',
  description: 'Secure command gateway with rule-based validation',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background text-muted">
        <Navbar />
        <main className="min-h-[calc(100vh-4rem)]">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#0f1724',
              color: '#9AA4B2',
              border: '1px solid rgba(0, 230, 168, 0.2)',
            },
            success: {
              iconTheme: {
                primary: '#22C55E',
                secondary: '#0f1724',
              },
            },
            error: {
              iconTheme: {
                primary: '#FF6B6B',
                secondary: '#0f1724',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

