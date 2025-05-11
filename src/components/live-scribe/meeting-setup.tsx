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

const formSchema = z.object({
  participants: z.string().min(1, { message: "Participant names are required." }),
  agenda: z.string().min(1, { message: "Meeting agenda is required." }),
  llmModel: z.string().min(1, { message: "Please select an LLM model." }),
  llmApiKey: z.string().min(1, { message: "LLM API Key is required." }).refine(key => !key.startsWith("sk-") || key.length > 20, {
    message: "Please enter a valid API key.",
  }),
});

type MeetingSetupFormValues = z.infer<typeof formSchema>;

interface MeetingSetupProps {
  onContextSet: (context: MeetingContext) => void;
}

const llmModelOptions = [
  { value: 'googleai/gemini-1.5-flash-latest', label: 'Gemini 1.5 Flash (Latest)' },
  { value: 'googleai/gemini-pro', label: 'Gemini Pro' },
  { value: 'googleai/gemini-1.5-pro-latest', label: 'Gemini 1.5 Pro (Latest)' },
];

const MeetingSetup: React.FC<MeetingSetupProps> = ({ onContextSet }) => {
  const form = useForm<MeetingSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: "",
      agenda: "",
      llmModel: llmModelOptions[0].value, // Default to the first model
      llmApiKey: "",
    },
  });

  function onSubmit(values: MeetingSetupFormValues) {
    // Optional: Store API key in sessionStorage if needed for persistence beyond component lifecycle
    // if (typeof window !== "undefined") {
    //   sessionStorage.setItem('llmApiKey', values.llmApiKey);
    // }
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
