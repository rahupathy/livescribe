
"use client";
import type React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

const HeroSection: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleGetStarted = () => {
    if (user) {
      router.push('/app');
    } else {
      router.push('/login');
    }
  };
  return (
    <section className="py-20 lg:py-32 bg-gradient-to-br from-background to-secondary/20 animate-in fade-in slide-in-from-bottom-5 duration-500 ease-out">
      <div className="container mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        <div className="text-center lg:text-left">
          <h1 className="text-4xl lg:text-6xl font-extrabold mb-6 text-foreground leading-tight">
            Transform Your Meetings with <span className="text-primary">AI-Powered Insights</span>
          </h1>
          <p className="text-lg lg:text-xl text-muted-foreground mb-10">
            Live Scribe provides real-time transcription, summarization, action item generation, and intelligent follow-up suggestions. Focus on the conversation, not on note-taking.
          </p>
          <Button onClick={handleGetStarted} size="lg" className="text-lg py-7 px-10 shadow-lg hover:shadow-xl transition-shadow duration-300" disabled={loading}>
             {loading ? 'Loading...' : (user ? 'Open Dashboard' : 'Get Started Free')}
          </Button>
        </div>
        <div className="flex justify-center items-center">
          <Image
            src="https://picsum.photos/seed/meetingcollab/700/500"
            alt="Collaborative meeting with AI insights"
            width={700}
            height={500}
            className="rounded-xl shadow-2xl object-cover hover:scale-105 transition-transform duration-300 ease-in-out"
            priority
            data-ai-hint="meeting collaboration"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

