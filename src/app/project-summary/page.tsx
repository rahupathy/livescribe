
"use client";
import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import LiveScribeLogo from '@/components/icons/live-scribe-logo';
import Image from 'next/image';

const ProjectSummaryPage: React.FC = () => {
  const [footerCopyrightText, setFooterCopyrightText] = useState<string>("Signatech Services Pvt. Ltd. (signatech.com). All rights reserved.");

  useEffect(() => {
    setFooterCopyrightText(`${new Date().getFullYear()} Signatech Services Pvt. Ltd. (signatech.com). All rights reserved.`);
  }, []);

  const features = [
    "Firebase Authentication (Email/Password & Google Sign-In)",
    "Secure, protected routes for authenticated users",
    "Dynamic LLM selection (Google, OpenAI, Meta, Anthropic models)",
    "Client-side API key management for enhanced security (keys not stored server-side)",
    "Admin user specific pre-configuration for LLM model and API key",
    "Genkit-powered AI flows for meeting summarization, action item generation, and follow-up suggestions",
    "Real-time audio transcription capabilities (via browser Web Speech API)",
    "Text-based transcript processing for AI insights",
    "PDF report generation of all meeting outputs",
    "Interactive dashboard for managing meeting context and viewing results",
    "Responsive landing page showcasing product features, security, and purpose",
    "Toast notifications for user feedback and error handling",
  ];

  const techStack = [
    "Next.js (App Router, Server Components, `next/image`)",
    "React (Functional Components, Hooks, Context API)",
    "TypeScript",
    "Firebase (Authentication)",
    "Genkit (Google AI plugin, Flows, Prompts, Tools)",
    "ShadCN UI (Components, Theming)",
    "Lucide React (Icons)",
    "Tailwind CSS (Styling)",
    "React Hook Form & Zod (Form validation)",
    "jsPDF (PDF generation)",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 py-12 px-4 sm:px-6 lg:px-8">
      <header className="container mx-auto mb-12 text-center">
        <Link href="/" className="inline-block mb-8">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </Link>
        <div className="flex justify-center items-center mb-4">
          <LiveScribeLogo className="h-16 w-16 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-primary mb-3">Live Scribe: Project Journey</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          An overview of the development process, features, and technologies used to build this AI-powered meeting assistant within Firebase Studio.
        </p>
      </header>

      <main className="container mx-auto space-y-12">
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">About Live Scribe</CardTitle>
            <CardDescription className="text-md">
              Live Scribe is an innovative application designed to transform meetings by providing real-time transcription, intelligent summaries, actionable item generation, and smart follow-up suggestions. It aims to enhance productivity by allowing participants to focus on the discussion rather than manual note-taking.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Image
              src="https://picsum.photos/seed/projectoverview/800/400"
              alt="Live Scribe application showcase"
              width={800}
              height={400}
              className="rounded-lg object-cover w-full shadow-md mb-6"
              data-ai-hint="application dashboard"
            />
            <p className="text-foreground">
              Built iteratively using cutting-edge web technologies, Live Scribe demonstrates the power of combining AI with a seamless user experience. The development journey focused on security, user-friendliness, and robust AI integration.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Key Features Developed</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-1 flex-shrink-0" />
                  <span className="text-foreground">{feature}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Technology Stack</CardTitle>
            <CardDescription className="text-md">
              Live Scribe leverages a modern, robust technology stack to deliver its features:
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
              {techStack.map((tech, index) => (
                <li key={index} className="flex items-center">
                  <span className="inline-block h-2 w-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                  <span className="text-foreground">{tech}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        
        <Card className="shadow-xl hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <CardTitle className="text-2xl sm:text-3xl">Development Process in Firebase Studio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground">
              Live Scribe was developed within Firebase Studio, an environment that facilitates rapid prototyping and iterative development of full-stack applications. The process involved:
            </p>
            <ul className="list-disc list-inside space-y-2 text-foreground">
              <li><strong>Initial Setup & Authentication:</strong> Establishing the Next.js project structure and integrating Firebase Authentication for secure user management.</li>
              <li><strong>UI/UX Design:</strong> Crafting an intuitive user interface using ShadCN UI components and Tailwind CSS, focusing on a clean and modern aesthetic for both the landing page and the application dashboard.</li>
              <li><strong>AI Integration with Genkit:</strong> Defining Genkit flows and prompts to interact with various Large Language Models. This included setting up dynamic model selection and secure, client-side API key handling.</li>
              <li><strong>Feature Implementation:</strong> Building out core functionalities such as meeting context setup, transcript input (text and audio), and the display of AI-generated summaries, action items, and suggestions.</li>
              <li><strong>Iterative Refinement:</strong> Addressing user feedback, fixing bugs (including Next.js hydration errors and API integration issues), and enhancing features like PDF export and microphone access.</li>
              <li><strong>Security Considerations:</strong> Prioritizing user data security by ensuring API keys are not stored on the server and are managed within the client's browser session.</li>
              <li><strong>Responsive Design & Accessibility:</strong> Ensuring the application is usable across various devices and adhering to web accessibility best practices.</li>
            </ul>
            <p className="text-foreground">
              This project showcases how a complex, AI-driven application can be built efficiently by leveraging a powerful development environment like Firebase Studio, combined with modern frameworks and tools.
            </p>
             <div className="mt-6">
                <Image
                  src="https://picsum.photos/seed/firebase-studio/800/350"
                  alt="Firebase Studio Development Environment"
                  width={800}
                  height={350}
                  className="rounded-lg object-cover w-full shadow-md"
                  data-ai-hint="coding environment"
                />
              </div>
          </CardContent>
        </Card>
      </main>

      <footer className="container mx-auto mt-16 py-8 text-center text-muted-foreground border-t">
        <div className="flex items-center justify-center space-x-2 mb-2">
          <LiveScribeLogo className="h-6 w-6 text-primary" />
          <span className="font-semibold">Live Scribe</span>
        </div>
        <p>&copy; {footerCopyrightText}</p>
        <p className="text-xs mt-1">This project is for educational purposes. Not for commercial use or reproduction.</p>
      </footer>
    </div>
  );
};

export default ProjectSummaryPage;
