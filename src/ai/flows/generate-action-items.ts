'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating action items from meeting transcripts.
 *
 * - generateActionItems - A function that takes meeting context and transcript and returns a list of action items.
 * - GenerateActionItemsInput - The input type for the generateActionItems function.
 * - GenerateActionItemsOutput - The return type for the generateActionItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ModelReference } from 'genkit';

const GenerateActionItemsInputSchema = z.object({
  meetingContext: z
    .string()
    .describe('The context of the meeting, including participants and agenda.'),
  transcript: z.string().describe('The transcript of the meeting.'),
  llmModel: z.string().describe('The LLM model to use for generating action items.'),
  llmApiKey: z.string().describe('The API key for the LLM model.'),
});
export type GenerateActionItemsInput = z.infer<typeof GenerateActionItemsInputSchema>;

const GenerateActionItemsOutputSchema = z.object({
  actionItems: z
    .array(z.string())
    .describe('A list of actionable tasks identified from the meeting.'),
});
export type GenerateActionItemsOutput = z.infer<typeof GenerateActionItemsOutputSchema>;

export async function generateActionItems(input: GenerateActionItemsInput): Promise<GenerateActionItemsOutput> {
  return generateActionItemsFlow(input);
}

const generateActionItemsPrompt = ai.definePrompt({
  name: 'generateActionItemsPrompt',
  input: {schema: GenerateActionItemsInputSchema.omit({ llmModel: true, llmApiKey: true })},
  output: {schema: GenerateActionItemsOutputSchema},
  prompt: `You are an AI assistant helping to generate action items from meeting transcripts.

  Meeting Context: {{{meetingContext}}}

  Transcript: {{{transcript}}}

  Based on the meeting context and transcript, identify actionable tasks and return them as a list of strings.
  Each action item should be clear and concise.
  If no action items can be extracted return an empty list.
  `,
});

const generateActionItemsFlow = ai.defineFlow(
  {
    name: 'generateActionItemsFlow',
    inputSchema: GenerateActionItemsInputSchema,
    outputSchema: GenerateActionItemsOutputSchema,
  },
  async (input) => {
    const { llmModel, llmApiKey, ...promptInput } = input;

    if (!llmModel.startsWith('googleai/')) {
      throw new Error(
        `The selected model '${llmModel}' is not supported by the currently configured AI providers. Only Google AI models (e.g., 'googleai/gemini-pro') are available.`
      );
    }

    const {output} = await generateActionItemsPrompt(promptInput, {
      model: llmModel as ModelReference<any>,
      auth: { apiKey: llmApiKey },
      config: {
        maxOutputTokens: 256,
      }
    });
    return output!;
  }
);

