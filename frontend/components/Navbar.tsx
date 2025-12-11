 'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Terminal, History, Shield, Menu, X } from 'lucide-react';
import { getCredits } from '@/utils/api';
import { motion, AnimatePresence } from 'framer-motion';

type NavbarProps = {
  onLogout?: () => void;
};

function defaultLogout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('api_key');
    localStorage.removeItem('is_admin');
    document.cookie = 'api_key=; path=/; max-age=0';
  }
}

export default function Navbar({ onLogout = defaultLogout }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [credits, setCredits] = useState<number | null>(null);
  const [role, setRole] = useState<'admin' | 'member' | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Only fetch credits if an API key exists
    const hasKey = typeof window !== 'undefined' ? localStorage.getItem('api_key') : null;
    if (!hasKey) {
      setCredits(null);
      setRole(null);
      return;
    }

    let mounted = true;

    async function loadCredits() {
      try {
        const data = await getCredits();
        if (!mounted) return;
        setCredits(data.credits ?? null);
        const isAdmin = localStorage.getItem('is_admin') === '1';
        setRole(isAdmin ? 'admin' : 'member');
      } catch (error) {
        if (!mounted) return;
        // Clear state if request fails (likely invalid key)
        setCredits(null);
        setRole(null);
      }
    }

    loadCredits();
    const interval = setInterval(loadCredits, 30000); // refresh every 30s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [pathname]);

  if (pathname === '/login') {
    return null;
  }

  const navLinks = [
    { href: '/commands', label: 'Console', icon: Terminal },
    { href: '/history', label: 'History', icon: History },
  ];

  if (role === 'admin') {
    navLinks.push({ href: '/admin/users', label: 'Admin', icon: Shield });
  }

  function handleLogout() {
    onLogout();
    router.push('/login');
  }

  return (
    <nav className="bg-surface border-b border-neon/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center space-x-2">
            <div className="text-2xl font-bold text-neon">UG</div>
            <span className="hidden sm:block text-muted text-sm">CommandX</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                pathname === link.href ||
                (link.href === '/admin/users' && pathname?.startsWith('/admin'));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`
                    flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium
                    transition-colors duration-200
                    ${
                      isActive
                        ? 'bg-neon/10 text-neon border border-neon/30'
                        : 'text-muted hover:text-neon hover:bg-neon/5'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Credits & Actions */}
          <div className="flex items-center space-x-4">
            {credits !== null && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-neon/10 border border-neon/30">
                <span className="text-xs text-muted">Credits:</span>
                <span className="text-sm font-semibold text-neon">{credits}</span>
              </div>
            )}

            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-muted hover:text-error hover:bg-error/10 transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted hover:text-neon hover:bg-neon/10"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-neon/20 bg-surface"
          >
            <div className="px-4 py-3 space-y-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href === '/admin/users' && pathname?.startsWith('/admin'));

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium
                      ${
                        isActive
                          ? 'bg-neon/10 text-neon border border-neon/30'
                          : 'text-muted hover:text-neon hover:bg-neon/5'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
              {credits !== null && (
                <div className="flex items-center justify-between px-4 py-3 rounded-lg bg-neon/10 border border-neon/30">
                  <span className="text-sm text-muted">Credits:</span>
                  <span className="text-sm font-semibold text-neon">{credits}</span>
                </div>
              )}
              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-muted hover:text-error hover:bg-error/10"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

