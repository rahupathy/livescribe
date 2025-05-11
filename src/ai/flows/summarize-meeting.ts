'use server';

/**
 * @fileOverview Summarizes a meeting in real-time and transcribes audio if provided.
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
  summary: z.string().describe('The updated summary of the meeting.'),
  newlyTranscribedText: z.string().optional().describe('The transcription of the latest audio chunk, if audio was provided and transcribed by the model.'),
});
export type SummarizeMeetingOutput = z.infer<typeof SummarizeMeetingOutputSchema>;

export async function summarizeMeeting(input: SummarizeMeetingInput): Promise<SummarizeMeetingOutput> {
  return summarizeMeetingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeMeetingPrompt',
  input: {schema: SummarizeMeetingInputSchema.omit({ llmModel: true, llmApiKey: true })}, 
  output: {schema: SummarizeMeetingOutputSchema},
  prompt: `You are an AI assistant summarizing a meeting in real-time and transcribing audio.

Meeting Context: {{{meetingContext}}}
{{#if existingSummary}}Existing Summary (try to build upon this): {{{existingSummary}}}{{/if}}

{{#if audioDataUri}}
Audio Chunk: {{media url=audioDataUri}}

Instruction:
1. Transcribe the provided audio chunk. This is the "newlyTranscribedText". If the audio is silent or unintelligible, state that.
2. Based on the meeting context, the newly transcribed text, and any existing summary, provide an updated concise "summary" of the meeting so far. Focus on key discussion points and decisions from all information available.
{{else}}
Instruction:
You are given meeting context which might include a text transcript. Generate a "summary" based on this context and any existing summary. Since no direct audio chunk is provided, "newlyTranscribedText" should be empty or indicate no audio was processed for transcription in this step.
{{/if}}

Return the "summary" and "newlyTranscribedText" according to the output schema.
`,
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
        `The selected model '${llmModel}' is not supported by the currently configured AI providers for this operation. Only Google AI models (e.g., 'googleai/gemini-pro') are available for summarization with potential audio input.`
      );
    }
    
    const {output} = await prompt(promptInput, {
      model: llmModel as ModelReference<any>, 
      auth: { apiKey: llmApiKey },
      config: {
        maxOutputTokens: 1024, // Increased to accommodate potential transcript + summary
      }
    });
    return output!;
  }
);
