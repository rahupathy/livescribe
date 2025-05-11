
"use client";

import type React from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginForm from '@/components/auth/login-form';
import { useAuth } from '@/contexts/auth-context';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';

const LoginPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/');
    }
  }, [user, loading, router]);

  if (loading || (!loading && user)) {
    // Show loading or let the effect redirect
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30">
         {/* Optionally, a more specific loading indicator for this page */}
      </div>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <LoginForm />
       <footer className="py-8 text-center text-muted-foreground mt-8">
        <div className="flex items-center justify-center space-x-2">
          <LiveScribeLogo className="h-5 w-5" /> 
          <span>Live Scribe &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
};

export default LoginPage;
