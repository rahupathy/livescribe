
"use client";

import type React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const LandingHeader: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleAuthAction = () => {
    if (user) {
      router.push('/app');
    } else {
      router.push('/login');
    }
  };

  return (
    <header className="py-4 shadow-sm sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2" aria-label="Live Scribe Home">
          <LiveScribeLogo className="h-8 w-8 text-primary" />
          <span className="text-2xl font-bold text-foreground">Live Scribe</span>
        </Link>
        <nav className="flex items-center space-x-2 md:space-x-4">
          <Link href="/#features" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
            Features
          </Link>
          <Link href="/#security" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
            Security
          </Link>
          <Link href="/#purpose" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
            Purpose
          </Link>
          <Link href="/#project-journey" className="text-muted-foreground hover:text-primary transition-colors text-sm sm:text-base">
            Journey
          </Link>
          <Button onClick={handleAuthAction} variant="default" size="sm" disabled={loading}>
            {loading ? 'Loading...' : (user ? 'Go to App' : 'Login')}
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default LandingHeader;
