
"use client";

import type React from 'react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, ListChecks, MessageSquareQuote, FileText, Brain, Info, Mic, StopCircle, AlertCircleIcon } from 'lucide-react';
import type { MeetingContext, SuggestionItem } from "./types";
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
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  const [isLoadingSummary, setIsLoadingSummary] = useState<boolean>(false);
  const [isLoadingActionItems, setIsLoadingActionItems] = useState<boolean>(false);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState<boolean>(false);
  const [isLoadingTranscriptFromAudio, setIsLoadingTranscriptFromAudio] = useState<boolean>(false);

  const [isListening, setIsListening] = useState<boolean>(false);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  const formattedMeetingContext = `Participants: ${initialContext.participants}. Agenda: ${initialContext.agenda}.`;

  const DUMMY_AUDIO_DATA_URI = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAAAAAA=='; // Used for text-only summarization

  useEffect(() => {
    const checkMicPermission = async () => {
        if (typeof navigator.permissions?.query === 'function') {
            try {
                const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName });
                setHasMicPermission(permissionStatus.state === 'granted');
                permissionStatus.onchange = () => {
                    setHasMicPermission(permissionStatus.state === 'granted');
                };
            } catch (err) {
                console.error("Error querying microphone permission:", err);
                setHasMicPermission(false); // Assume no permission if query fails
            }
        } else {
            // Fallback for browsers that don't support navigator.permissions.query
            // This won't update dynamically if permissions change outside the app.
            // We can try a quick getUserMedia check, but it will prompt if not granted.
            // For a non-prompting check, this path is limited.
             try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                stream.getTracks().forEach(track => track.stop()); // Clean up immediately
                setHasMicPermission(true);
            } catch (error) {
                setHasMicPermission(false);
            }
        }
    };
    checkMicPermission();
  }, []);

  const requestMicPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Close the stream immediately after permission is granted, actual stream for recording will be opened when recording starts.
      stream.getTracks().forEach(track => track.stop());
      setHasMicPermission(true);
      toast({ title: "Microphone Access Granted", description: "You can now start listening." });
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setHasMicPermission(false);
      toast({
        variant: 'destructive',
        title: 'Microphone Access Denied',
        description: 'Please enable microphone permissions in your browser settings.',
      });
      return false;
    }
  };

  const startListening = async () => {
    if (!hasMicPermission) {
      const permissionGranted = await requestMicPermission();
      if (!permissionGranted) return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store the stream
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = async () => {
        setIsLoadingTranscriptFromAudio(true);
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); 
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64AudioData = reader.result as string;
          try {
            const result = await summarizeMeeting({
              audioDataUri: base64AudioData,
              meetingContext: formattedMeetingContext,
              existingSummary: summary,
              llmModel: initialContext.llmModel,
              llmApiKey: initialContext.llmApiKey,
            });
            if (result.newlyTranscribedText) {
              setTranscript(prev => prev + (prev ? "\n" : "") + result.newlyTranscribedText);
            }
            if (result.summary) {
              setSummary(result.summary);
            }
            toast({ title: "Audio Processed", description: "Transcript and summary updated from audio." });
          } catch (error) {
            console.error("Error processing audio:", error);
            toast({ title: "Error Processing Audio", description: `Could not process audio. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
          } finally {
            setIsLoadingTranscriptFromAudio(false);
             // Clean up tracks after stopping and processing
            if (mediaStreamRef.current) {
                mediaStreamRef.current.getTracks().forEach(track => track.stop());
                mediaStreamRef.current = null;
            }
          }
        };
      };

      mediaRecorderRef.current.start();
      setIsListening(true);
      toast({ title: "Listening Started", description: "Microphone is now active." });
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasMicPermission(false); // Re-evaluate permission if start fails
      toast({ title: "Recording Error", description: "Could not start audio recording. Please check microphone permissions.", variant: "destructive" });
    }
  };

  const stopListening = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop(); // This will trigger 'onstop'
    }
    if (mediaStreamRef.current) { // Also stop tracks here in case onstop is not triggered for some reason
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
        mediaStreamRef.current = null;
    }
    setIsListening(false);
    // Stream tracks are also stopped in onstop
  };

  const handleToggleListening = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleProcessTranscript = useCallback(async () => {
    if (!transcript.trim()) {
      toast({ title: "Transcript Empty", description: "Please enter or record some text in the transcript.", variant: "destructive" });
      return;
    }

    setIsLoadingSummary(true);
    try {
      // Use a distinct context for summarization that clearly indicates it's based on the *full text transcript*
      const summaryContext = `Participants: ${initialContext.participants}. Agenda: ${initialContext.agenda}. Full Meeting Transcript: ${transcript}`;
      const result = await summarizeMeeting({
        audioDataUri: DUMMY_AUDIO_DATA_URI, // Signal that this is text-based summarization
        meetingContext: summaryContext, 
        existingSummary: "", // Process full transcript for a new summary
        llmModel: initialContext.llmModel,
        llmApiKey: initialContext.llmApiKey,
      });
      if(result.summary) {
        setSummary(result.summary);
      } else {
        // If summary is empty but newlyTranscribedText exists (which shouldn't for dummy audio)
        // it implies the model might have tried to transcribe the dummy audio.
        // This branch handles cases where the summary might be unexpectedly empty.
        setSummary("Could not generate a summary from the provided text.");
        toast({ title: "Summary Issue", description: "The model did not return a summary for the text.", variant: "default" });
      }
    } catch (error) {
      console.error("Error summarizing meeting from text:", error);
      toast({ title: "Error Summarizing (Text)", description: `Could not generate summary. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
      setSummary("Failed to generate summary due to an error.");
    } finally {
      setIsLoadingSummary(false);
    }

    setIsLoadingActionItems(true);
    try {
      const result = await genActionItemsFlow({
        meetingContext: formattedMeetingContext,
        transcript: transcript,
        llmModel: initialContext.llmModel,
        llmApiKey: initialContext.llmApiKey,
      });
      setActionItems(result.actionItems);
    } catch (error) {
      console.error("Error generating action items:", error);
      toast({ title: "Error Generating Action Items", description: `Could not generate action items. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
    } finally {
      setIsLoadingActionItems(false);
    }

    setIsLoadingSuggestions(true);
    try {
      const result = await suggestFollowUpFlow({
        meetingContext: formattedMeetingContext,
        meetingNotes: transcript,
        llmModel: initialContext.llmModel,
        llmApiKey: initialContext.llmApiKey,
      });
      setSuggestions(result.followUpActions);
    } catch (error) {
      console.error("Error suggesting follow-up actions:", error);
      toast({ title: "Error Generating Suggestions", description: `Could not generate suggestions. ${error instanceof Error ? error.message : 'Unknown error.'}`, variant: "destructive" });
    } finally {
      setIsLoadingSuggestions(false);
    }
  }, [transcript, formattedMeetingContext, toast, initialContext.llmModel, initialContext.llmApiKey, summary]);

  const isLoadingAny = isLoadingSummary || isLoadingActionItems || isLoadingSuggestions || isLoadingTranscriptFromAudio;

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6">
      <header className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-primary">Live Scribe Dashboard</h1>
        <div className="text-sm text-muted-foreground mt-1">
            <p>Meeting with: {initialContext.participants}</p>
            <p>Agenda: {initialContext.agenda}</p>
            <p>Using LLM: <Badge variant="secondary" className="ml-1">{initialContext.llmModel.replace(/^(googleai|openai|meta|anthropic)\//, '')}</Badge></p>
        </div>
      </header>

      {hasMicPermission === false && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircleIcon className="h-4 w-4" />
          <AlertTitle>Microphone Access Denied/Unavailable</AlertTitle>
          <AlertDescription>
            Live Scribe needs microphone access to record audio. Please enable it in your browser settings.
            If access is enabled and you still see this, your browser might not fully support the permission query API.
            You can still manually enter transcripts.
            <Button variant="outline" size="sm" onClick={requestMicPermission} className="ml-2">Try Granting Access</Button>
          </AlertDescription>
        </Alert>
      )}


      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl"><FileText className="text-primary"/>Live Transcript</CardTitle>
          <CardDescription>Record audio or enter/paste the meeting conversation below. Click "Process Transcript" to generate insights.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Start typing, paste transcript, or record audio..."
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            className="min-h-[200px] text-base rounded-md shadow-inner focus:ring-primary focus:border-primary"
            rows={10}
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleToggleListening} disabled={isLoadingTranscriptFromAudio || hasMicPermission === null} variant="outline">
              {isListening ? <StopCircle className="mr-2 h-4 w-4 text-red-500" /> : <Mic className="mr-2 h-4 w-4" />}
              {isListening ? 'Stop Listening' : 'Start Listening'}
              {isLoadingTranscriptFromAudio && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
            </Button>
            <Button onClick={handleProcessTranscript} disabled={isLoadingAny || !transcript.trim()} className="flex-grow md:flex-grow-0">
              {(isLoadingSummary || isLoadingActionItems || isLoadingSuggestions) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Process Transcript
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="shadow-lg lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl"><MessageSquareQuote className="text-primary"/>Meeting Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {(isLoadingSummary || (isLoadingTranscriptFromAudio && isListening)) && <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />}
            {!(isLoadingSummary || (isLoadingTranscriptFromAudio && isListening)) && !summary && (
              <p className="text-muted-foreground italic">Summary will appear here once processed.</p>
            )}
            {!(isLoadingSummary || (isLoadingTranscriptFromAudio && isListening)) && summary && (
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
                    <TooltipProvider key={index} delayDuration={100}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <li className="text-sm p-2 bg-background rounded-md shadow-sm border border-accent/50 cursor-default">
                            {item.suggestion}
                          </li>
                        </TooltipTrigger>
                        {item.transcriptReference && (
                           <TooltipContent side="top" align="start" className="max-w-xs break-words bg-popover text-popover-foreground p-2 rounded-md shadow-lg border">
                            <p className="text-xs text-muted-foreground mb-1">Reference:</p>
                            <p className="text-xs">{item.transcriptReference}</p>
                          </TooltipContent>
                        )}
                      </Tooltip>
                    </TooltipProvider>
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
                    <Badge variant="default" className="bg-accent text-accent-foreground mt-1 shrink-0">Task</Badge>
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-300">
        <Info className="h-5 w-5 text-primary" />
        <AlertTitle className="font-semibold">Note on AI Features</AlertTitle>
        <AlertDescription>
          Live audio transcription and summarization depend on your microphone setup and the capabilities of the selected LLM model. 
          For text-only input in the transcript box, the summary quality may differ.
          API key errors or model access issues from the selected LLM provider might also affect results.
        </AlertDescription>
      </Alert>

    </div>
  );
};

export default ScribeDashboard;

    