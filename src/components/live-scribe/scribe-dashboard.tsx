"use client";

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ListChecks, MessageSquareQuote, AlertTriangle, FileText, Brain } from 'lucide-react';
import type { MeetingContext, ScribeData } from "./types";
import { summarizeMeeting } from '@/ai/flows/summarize-meeting';
import { generateActionItems as genActionItemsFlow } from '@/ai/flows/generate-action-items';
import { suggestFollowUpActions as suggestFollowUpFlow } from '@/ai/flows/suggest-follow-up-actions';
import { useToast } from "@/hooks/use-toast";

interface ScribeDashboardProps {
  initialContext: MeetingContext;
}

const ScribeDashboard: React.FC<ScribeDashboardProps> = ({ initialContext }) => {
  const [transcript, setTranscript] = useState<string>("");
  const [summary, setSummary] = useState<string>("");
  const [actionItems, setActionItems] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingActionItems, setIsLoadingActionItems] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);

  const { toast } = useToast();

  const formattedMeetingContext = `Participants: ${initialContext.participants}. Agenda: ${initialContext.agenda}.`;

  // Minimal valid Data URI for an empty WAV file
  const DUMMY_AUDIO_DATA_URI = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA==';

  const handleProcessTranscript = useCallback(async () => {
    if (!transcript.trim()) {
      toast({ title: "Transcript Empty", description: "Please enter some text in the transcript.", variant: "destructive" });
      return;
    }

    // --- Summarization ---
    setIsLoadingSummary(true);
    try {
      // The prompt for summarizeMeeting uses `meetingContext` and `existingSummary`.
      // We'll put the current transcript into the meetingContext for the AI to process.
      const contextForSummary = `${formattedMeetingContext} Current discussion: ${transcript}`;
      const result = await summarizeMeeting({
        audioDataUri: DUMMY_AUDIO_DATA_URI, // Dummy audio, as flow requires it
        meetingContext: contextForSummary,
        existingSummary: summary,
      });
      setSummary(result.summary);
    } catch (error) {
      console.error("Error summarizing meeting:", error);
      toast({ title: "Error Summarizing", description: "Could not generate summary. The AI flow might require actual audio input.", variant: "destructive" });
    } finally {
      setIsLoadingSummary(false);
    }

    // --- Action Items ---
    setIsLoadingActionItems(true);
    try {
      const result = await genActionItemsFlow({
        meetingContext: formattedMeetingContext,
        transcript: transcript,
      });
      setActionItems(result.actionItems);
    } catch (error) {
      console.error("Error generating action items:", error);
      toast({ title: "Error Generating Action Items", description: "Could not generate action items.", variant: "destructive" });
    } finally {
      setIsLoadingActionItems(false);
    }

    // --- Suggestions ---
    setIsLoadingSuggestions(true);
    try {
      const result = await suggestFollowUpFlow({
        meetingContext: formattedMeetingContext,
        meetingNotes: transcript,
      });
      setSuggestions(result.followUpActions);
    } catch (error) {
      console.error("Error suggesting follow-up actions:", error);
      toast({ title: "Error Generating Suggestions", description: "Could not generate suggestions.", variant: "destructive" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [transcript, summary, formattedMeetingContext, toast]);

  const isLoading = isLoadingSummary || isLoadingActionItems || isLoadingSuggestions;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Live Scribe Dashboard</h1>
        <p className="text-muted-foreground">Meeting with: {initialContext.participants}</p>
        <p className="text-muted-foreground">Agenda: {initialContext.agenda}</p>
      </header>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><FileText className="text-primary"/>Live Transcript</CardTitle>
          <CardDescription>Enter or paste the meeting conversation below. Click "Process Transcript" to generate insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Start typing or paste transcript here..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[200px] text-base rounded-md shadow-inner focus:ring-primary focus:border-primary"
            rows={10}
          />
          <Button onClick={handleProcessTranscript} disabled={isLoading || !transcript.trim()} className="w-full md:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Process Transcript
          </Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><MessageSquareQuote className="text-primary"/>Meeting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSummary && <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />}
            {!isLoadingSummary && !summary && (
              <p className="text-muted-foreground italic">Summary will appear here once processed. Note: AI summary quality may vary with text-only input as it's optimized for audio.</p>
            )}
            {!isLoadingSummary && summary && (
              <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-secondary/30 shadow-inner">
                <p className="whitespace-pre-wrap text-sm">{summary}</p>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><Brain className="text-accent"/>Suggestions</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingSuggestions && <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />}
            {!isLoadingSuggestions && suggestions.length === 0 && (
              <p className="text-muted-foreground italic">Suggestions for follow-up will appear here.</p>
            )}
            {!isLoadingSuggestions && suggestions.length > 0 && (
              <ScrollArea className="h-[200px] w-full rounded-md border p-3 bg-secondary/30 shadow-inner">
                <ul className="space-y-2">
                  {suggestions.map((item, index) => (
                    <li key={index} className="text-sm p-2 bg-background rounded-md shadow-sm border border-accent/50">
                      {item}
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><ListChecks className="text-accent"/>Action Items</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingActionItems && <Loader2 className="mx-auto h-8 w-8 animate-spin text-accent" />}
          {!isLoadingActionItems && actionItems.length === 0 && (
            <p className="text-muted-foreground italic">Action items will appear here once processed.</p>
          )}
          {!isLoadingActionItems && actionItems.length > 0 && (
            <ScrollArea className="h-[200px] w-full rounded-md border p-3 bg-secondary/30 shadow-inner">
              <ul className="space-y-2">
                {actionItems.map((item, index) => (
                  <li key={index} className="flex items-start gap-2 p-2 bg-background rounded-md shadow-sm">
                    <Badge variant="default" className="bg-accent text-accent-foreground mt-1">Task</Badge>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700">
        <AlertTriangle className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold">Note on AI Summarization</AlertTitle>
        <AlertDescription>
          The real-time summarization feature is optimized for audio input. While we attempt to process text-based transcripts, the quality and relevance of AI-generated summaries may be limited. For best results, future versions will integrate direct audio processing.
        </AlertDescription>
      </Alert>

    </div>
  );
};

export default ScribeDashboard;
