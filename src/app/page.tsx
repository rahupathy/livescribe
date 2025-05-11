"use client";

import { useState } from 'react';
import MeetingSetup from '@/components/live-scribe/meeting-setup';
import ScribeDashboard from '@/components/live-scribe/scribe-dashboard';
import type { MeetingContext } from '@/components/live-scribe/types';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';

export default function Home() {
  const [meetingContext, setMeetingContext] = useState<MeetingContext | null>(null);

  const handleContextSet = (context: MeetingContext) => {
    setMeetingContext(context);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <div className="container mx-auto px-0">
        {!meetingContext ? (
          <MeetingSetup onContextSet={handleContextSet} />
        ) : (
          <ScribeDashboard initialContext={meetingContext} />
        )}
      </div>
      <footer className="py-8 text-center text-muted-foreground">
        <div className="flex items-center justify-center space-x-2">
          <LiveScribeLogo className="h-5 w-5" /> 
          <span>Live Scribe &copy; {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
