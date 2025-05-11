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
    )
    .optional(), // Made optional
  meetingContext: z.string().describe('The context of the meeting, including participants and agenda.'),
  existingSummary: z.string().optional().describe('The existing summary of the meeting, if any.'),
  transcriptForSummary: z.string().optional().describe('Full transcript text to be summarized, used if audioDataUri is not provided.'), // Added for explicit text summarization
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
  prompt: `You are an AI assistant. Your task is to process meeting information.

Meeting Context: {{{meetingContext}}}
{{#if existingSummary}}Existing Summary (try to build upon this): {{{existingSummary}}}{{/if}}

{{#if audioDataUri}}
Audio Chunk: {{media url=audioDataUri}}

Instruction:
1. Transcribe the provided audio chunk. This is the "newlyTranscribedText". If the audio is silent or unintelligible, state that.
2. Based on the meeting context, the newly transcribed text, and any existing summary, provide an updated concise "summary" of the meeting so far. Focus on key discussion points and decisions from all information available.
{{else if transcriptForSummary}}
Instruction:
You are given meeting context which includes a text transcript:
Transcript:
{{{transcriptForSummary}}}

Generate a "summary" based on this context, transcript, and any existing summary.
Since no direct audio chunk is provided, "newlyTranscribedText" should be empty or indicate no audio was processed for transcription in this step.
{{else}}
Instruction:
You are given meeting context. Generate a "summary" based on this context and any existing summary.
Since no audio chunk or full transcript is provided for this specific request, "newlyTranscribedText" should be empty.
{{/if}}

Return the "summary" and "newlyTranscribedText" (if applicable) according to the output schema.
Ensure the summary is based on all available information (context, existing summary, and new input - either transcribed audio or provided transcript text).
If no meaningful summary can be generated, return an empty string for the summary.
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
        maxOutputTokens: 1024, 
      }
    });
    
    // Ensure a valid output structure even if the model returns null or undefined
    if (!output) {
        return { summary: "", newlyTranscribedText: "" };
    }
    return {
        summary: output.summary || "",
        newlyTranscribedText: output.newlyTranscribedText || ""
    };
  }
);
