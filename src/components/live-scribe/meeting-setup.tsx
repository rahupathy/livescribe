"use client";

import type React from 'react';
import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { MeetingContext } from "./types";
import LiveScribeLogo from '@/components/icons/live-scribe-logo';

const formSchema = z.object({
  participants: z.string().min(1, { message: "Participant names are required." }),
  agenda: z.string().min(1, { message: "Meeting agenda is required." }),
});

type MeetingSetupFormValues = z.infer<typeof formSchema>;

interface MeetingSetupProps {
  onContextSet: (context: MeetingContext) => void;
}

const MeetingSetup: React.FC<MeetingSetupProps> = ({ onContextSet }) => {
  const form = useForm<MeetingSetupFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      participants: "",
      agenda: "",
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
          <CardDescription>Enter meeting details to begin real-time transcription and insights.</CardDescription>
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
