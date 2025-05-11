
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MeetingSetup from '@/components/live-scribe/meeting-setup';
import ScribeDashboard from '@/components/live-scribe/scribe-dashboard';
import type { MeetingContext } from '@/components/live-scribe/types';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';
import { useAuth } from '@/contexts/auth-context';
import { Button } from '@/components/ui/button';
import { auth } from '@/lib/firebase/firebase';
import { signOut } from 'firebase/auth';
import { LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [meetingContext, setMeetingContext] = useState<MeetingContext | null>(null);
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleContextSet = (context: MeetingContext) => {
    setMeetingContext(context);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast({ title: 'Logout Failed', description: 'Could not log out. Please try again.', variant: 'destructive' });
    }
  };
  
  const [currentYear, setCurrentYear] = useState<number | null>(null);
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);


  if (loading || !user) {
    // AuthProvider shows its own loader, or user is being redirected.
    // You can optionally show a page-specific loader here if preferred.
    return null; 
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-0">
        <div className="absolute top-4 right-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
        {!meetingContext ? (
          <MeetingSetup onContextSet={handleContextSet} />
        ) : (
          <ScribeDashboard initialContext={meetingContext} />
        )}
      </div>
      <footer className="py-8 text-center text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <LiveScribeLogo className="h-5 w-5" /> 
          {currentYear !== null ? <span>Live Scribe &copy; {currentYear}</span> : <span>Live Scribe</span>}
        </div>
      </footer>
    </main>
  );
}
