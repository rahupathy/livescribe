
"use client";

import type React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { MeetingContext } from "./types";
import LiveScribeLogo from '@/components/icons/live-scribe-logo';
import { AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';

const formSchema = z.object({
  participants: z.string().min(1, { message: "Participant names are required." }),
  agenda: z.string().min(1, { message: "Meeting agenda is required." }),
  llmModel: z.string().min(1, { message: "Please select an LLM model." }),
  llmApiKey: z.string()
    .min(1, { message: "LLM API Key is required." })
    .min(10, { message: "API key seems too short. Please enter a valid key." }),
});

type MeetingSetupFormValues = z.infer<typeof formSchema>;

interface MeetingSetupProps {
  onContextSet: (context: MeetingContext) => void;
}

const llmModelOptions = [
  // Google Models
  { value: 'googleai/gemini-1.5-flash-latest', label: 'Google: Gemini 1.5 Flash' },
  { value: 'googleai/gemini-pro', label: 'Google: Gemini Pro' },
  { value: 'googleai/gemini-1.5-pro-latest', label: 'Google: Gemini 1.5 Pro' },
  // OpenAI Models
  { value: 'openai/gpt-3.5-turbo', label: 'OpenAI: GPT-3.5 Turbo' },
  { value: 'openai/gpt-4', label: 'OpenAI: GPT-4' },
  { value: 'openai/gpt-4-turbo', label: 'OpenAI: GPT-4 Turbo' },
  { value: 'openai/gpt-4o', label: 'OpenAI: GPT-4o' },
  // Meta Llama Models (hypothetical prefix, assuming API key access via a provider)
  { value: 'meta/llama-3-8b-instruct', label: 'Meta: Llama 3 8B Instruct' },
  { value: 'meta/llama-3-70b-instruct', label: 'Meta: Llama 3 70B Instruct' },
  // Anthropic Claude Models (hypothetical prefix)
  { value: 'anthropic/claude-3-opus-20240229', label: 'Anthropic: Claude 3 Opus' },
  { value: 'anthropic/claude-3-sonnet-20240229', label: 'Anthropic: Claude 3 Sonnet' },
  { value: 'anthropic/claude-3-haiku-20240307', label: 'Anthropic: Claude 3 Haiku' },
];

const ADMIN_EMAIL = "rahu431@gmail.com";
// In a real scenario, this key might come from a secure configuration or environment variable specific to the admin's setup.
// For this example, it's a placeholder to demonstrate pre-filling.
const ADMIN_PREFILLED_API_KEY = "ADMIN_API_KEY_EXAMPLE_DO_NOT_COMMIT_REAL_KEYS"; 
const ADMIN_DEFAULT_MODEL = llmModelOptions[0].value; // Default to Gemini 1.5 Flash for admin

const MeetingSetup: React.FC<MeetingSetupProps> = ({ onContextSet }) => {
  const { user } = useAuth();
  const isAdmin = user?.email === ADMIN_EMAIL;

  const defaultLlmModel = isAdmin ? ADMIN_DEFAULT_MODEL : llmModelOptions[0].value;
  const defaultLlmApiKey = isAdmin ? ADMIN_PREFILLED_API_KEY : "";

  const form = useForm<MeetingSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: "",
      agenda: "",
      llmModel: defaultLlmModel,
      llmApiKey: defaultLlmApiKey,
    },
  });

  function onSubmit(values: MeetingSetupFormValues) {
    onContextSet(values);
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center items-center mb-4">
            <LiveScribeLogo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold">Live Scribe</CardTitle>
          <CardDescription>Enter meeting details and LLM configuration to begin real-time transcription and insights.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="participants"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Participant Names</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Alice, Bob, Charlie" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="agenda"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting Agenda</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Discuss Q3 roadmap, Review project Alpha..."
                        className="resize-none min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="llmModel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM Model</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an LLM model" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {llmModelOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="llmApiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LLM API Key</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your LLM API Key" {...field} />
                    </FormControl>
                    <FormDescription className="text-xs text-muted-foreground flex items-start pt-1">
                      <AlertCircle className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                      <span>Your API key is used only for this session and is not stored on our servers. It remains in your browser's memory.</span>
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full text-lg py-6">
                Start Scribing
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default MeetingSetup;
