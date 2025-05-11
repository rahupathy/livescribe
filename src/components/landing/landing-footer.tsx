
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';
import { LifeBuoy } from 'lucide-react';

const LandingFooter: React.FC = () => {
  const [footerCopyrightText, setFooterCopyrightText] = useState<string>("Signatech Services Pvt. Ltd. (signatech.com). All rights reserved.");

  useEffect(() => {
    setFooterCopyrightText(`${new Date().getFullYear()} Signatech Services Pvt. Ltd. (signatech.com). All rights reserved.`);
  }, []);

  return (
    <footer className="py-8 border-t">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <LiveScribeLogo className="h-6 w-6 text-primary" />
          <span className="font-semibold">Live Scribe</span>
        </div>
        <p>&copy; {footerCopyrightText}</p>
        <p className="text-xs mt-1">This project is for educational purposes. Not for commercial use or reproduction.</p>
        <p className="text-sm mt-3">
          <a 
            href="mailto:rahupathy.m@signatech.com?subject=Live%20Scribe%20Feedback%20/%20Support"
            className="inline-flex items-center hover:text-primary transition-colors"
            aria-label="Contact Support and Feedback"
          >
            <LifeBuoy className="mr-1.5 h-4 w-4" />
            Support & Feedback
          </a>
        </p>
      </div>
    </footer>
  );
};

export default LandingFooter;

