'use server';

/**
 * @fileOverview Summarizes a meeting in real-time.
 *
 * - summarizeMeeting - A function that handles the meeting summarization process.
 * - SummarizeMeetingInput - The input type for the summarizeMeeting function.
 * - SummarizeMeetingOutput - The return type for the summarizeMeeting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ModelReference } from 'genkit';

const SummarizeMeetingInputSchema = z.object({
  audioDataUri: z
    .string()
    .describe(
      "A chunk of audio data from the meeting, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  meetingContext: z.string().describe('The context of the meeting, including participants and agenda.'),
  existingSummary: z.string().optional().describe('The existing summary of the meeting, if any.'),
  llmModel: z.string().describe('The LLM model to use for summarization.'),
  llmApiKey: z.string().describe('The API key for the LLM model.'),
});
export type SummarizeMeetingInput = z.infer<typeof SummarizeMeetingInputSchema>;

const SummarizeMeetingOutputSchema = z.object({
  summary: z.string().describe('The real-time summary of the meeting.'),
});
export type SummarizeMeetingOutput = z.infer<typeof SummarizeMeetingOutputSchema>;

export async function summarizeMeeting(input: SummarizeMeetingInput): Promise<SummarizeMeetingOutput> {
  return summarizeMeetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingPrompt',
  input: {schema: SummarizeMeetingInputSchema.omit({ llmModel: true, llmApiKey: true })}, 
  output: {schema: SummarizeMeetingOutputSchema},
  prompt: `You are an AI assistant summarizing a meeting in real-time.

  Meeting Context: {{{meetingContext}}}
  Existing Summary: {{{existingSummary}}}

  Audio Chunk: {{media url=audioDataUri}}

  Based on the meeting context and the current audio chunk, provide a concise summary of the meeting so far.
  Focus on key discussion points and decisions.
  If there is an existing summary, incorporate the new audio chunk into it. Otherwise generate a new summary from the audio chunk.
  Summary:`,
});

const summarizeMeetingFlow = ai.defineFlow(
  {
    name: 'summarizeMeetingFlow',
    inputSchema: SummarizeMeetingInputSchema,
    outputSchema: SummarizeMeetingOutputSchema,
  },
  async (input) => {
    const { llmModel, llmApiKey, ...promptInput } = input;

    if (!llmModel.startsWith('googleai/')) {
      throw new Error(
        `The selected model '${llmModel}' is not supported by the currently configured AI providers. Only Google AI models (e.g., 'googleai/gemini-pro') are available.`
      );
    }

    const {output} = await prompt(promptInput, {
      model: llmModel as ModelReference<any>, 
      auth: { apiKey: llmApiKey }
    });
    return output!;
  }
);
