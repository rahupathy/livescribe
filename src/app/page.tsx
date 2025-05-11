
"use client";

import type React from 'react';
import LandingHeader from '@/components/landing/landing-header';
import HeroSection from '@/components/landing/hero-section';
import FeatureCard from '@/components/landing/feature-card';
import LandingFooter from '@/components/landing/landing-footer';
import { ShieldCheck, Zap, ListChecks, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <LandingHeader />
      <main className="flex-grow">
        <HeroSection />

        <section id="features" className="py-16 lg:py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl lg:text-4xl font-bold text-center mb-12 text-foreground">
              Discover the Power of Live Scribe
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Zap className="h-10 w-10 text-primary" />}
                title="Real-Time Transcription & Summaries"
                description="Capture every word with high-accuracy live transcription. Get instant, concise summaries of key discussion points and decisions, so you never miss a beat."
                imageSrc="https://picsum.photos/seed/transcript/600/400"
                imageAlt="Real-time transcription interface"
                dataAiHint="transcript summary"
              />
              <FeatureCard
                icon={<ListChecks className="h-10 w-10 text-primary" />}
                title="Intelligent Action Items"
                description="Live Scribe automatically identifies actionable tasks from your conversations. Assign owners and track progress effortlessly, turning discussions into deliverables."
                imageSrc="https://picsum.photos/seed/actionitems/600/400"
                imageAlt="Action items list"
                dataAiHint="task list"
              />
              <FeatureCard
                icon={<Users className="h-10 w-10 text-primary" />}
                title="Smart Follow-Up Suggestions"
                description="Receive AI-powered suggestions for follow-up meetings, research topics, or communications, ensuring comprehensive post-meeting engagement."
                imageSrc="https://picsum.photos/seed/suggestions/600/400"
                imageAlt="Follow-up suggestions"
                dataAiHint="collaboration communication"
              />
            </div>
          </div>
        </section>

        <section id="security" className="py-16 lg:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <ShieldCheck className="h-16 w-16 text-accent mx-auto mb-6" />
              <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
                Your Data, Your Control: Uncompromising Security
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                We prioritize your privacy. Your LLM API keys are never stored on our servers; they remain securely in your browser's memory for the duration of your session. All meeting data processed using your keys is handled according to the terms of your chosen LLM provider. Live Scribe acts as a secure conduit, ensuring your sensitive information remains confidential and under your control.
              </p>
              <div className="flex justify-center">
                <img 
                  src="https://picsum.photos/seed/securitylock/600/350" 
                  alt="Data security visual" 
                  className="rounded-lg shadow-xl"
                  data-ai-hint="data security" 
                />
              </div>
            </div>
          </div>
        </section>

        <section id="purpose" className="py-16 lg:py-24 bg-primary/10">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl lg:text-4xl font-bold mb-6 text-foreground">
                  Focus on What Matters Most
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Live Scribe frees you from the burden of manual note-taking, allowing you to fully engage in discussions, foster better collaboration, and drive productive outcomes. Spend less time documenting and more time innovating, connecting, and leading.
                </p>
                <Link href="/login" passHref>
                  <Button size="lg" className="text-lg py-7 px-10">
                    Try Live Scribe Now
                  </Button>
                </Link>
              </div>
              <div>
                <img 
                  src="https://picsum.photos/seed/teamfocus/600/450" 
                  alt="Team focusing in a meeting" 
                  className="rounded-lg shadow-xl"
                  data-ai-hint="team meeting"
                />
              </div>
            </div>
          </div>
        </section>
      </main>
      <LandingFooter />
    </div>
  );
};

export default LandingPage;
