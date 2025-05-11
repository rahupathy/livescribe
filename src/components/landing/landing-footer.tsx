
import type React from 'react';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';

const LandingFooter: React.FC = () => {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="py-8 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <LiveScribeLogo className="h-6 w-6 text-primary" />
          <span className="font-semibold">Live Scribe</span>
        </div>
        <p>&copy; {currentYear} Live Scribe. All rights reserved.</p>
        <p className="text-xs mt-1">Revolutionizing meetings, one insight at a time.</p>
      </div>
    </footer>
  );
};

export default LandingFooter;
