'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting follow-up actions based on a meeting discussion.
 *
 * - suggestFollowUpActions - A function that takes meeting notes as input and returns suggested follow-up actions.
 * - SuggestFollowUpActionsInput - The input type for the suggestFollowUpActions function.
 * - SuggestFollowUpActionsOutput - The return type for the suggestFollowUpActions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import type { ModelReference } from 'genkit';

const SuggestFollowUpActionsInputSchema = z.object({
  meetingNotes: z.string().describe('Meeting notes from the discussion.'),
  meetingContext: z.string().optional().describe('Context about the meeting including participants and agenda.'),
  llmModel: z.string().describe('The LLM model to use for suggesting follow-up actions.'),
  llmApiKey: z.string().describe('The API key for the LLM model.'),
});
export type SuggestFollowUpActionsInput = z.infer<typeof SuggestFollowUpActionsInputSchema>;

const SuggestFollowUpActionsOutputSchema = z.object({
  followUpActions: z.array(
    z.string().describe('A list of suggested follow-up actions.')
  ).describe('Suggested follow-up actions based on the meeting discussion.'),
});
export type SuggestFollowUpActionsOutput = z.infer<typeof SuggestFollowUpActionsOutputSchema>;

export async function suggestFollowUpActions(input: SuggestFollowUpActionsInput): Promise<SuggestFollowUpActionsOutput> {
  return suggestFollowUpActionsFlow(input);
}

const suggestFollowUpActionsPrompt = ai.definePrompt({
  name: 'suggestFollowUpActionsPrompt',
  input: {schema: SuggestFollowUpActionsInputSchema.omit({ llmModel: true, llmApiKey: true })},
  output: {schema: SuggestFollowUpActionsOutputSchema},
  prompt: `Based on the following meeting notes, please suggest a list of follow-up actions.

Meeting Notes:
{{meetingNotes}}

{{#if meetingContext}}
Meeting Context:
{{meetingContext}}
{{/if}}

Follow-up Actions:`, 
});

const suggestFollowUpActionsFlow = ai.defineFlow(
  {
    name: 'suggestFollowUpActionsFlow',
    inputSchema: SuggestFollowUpActionsInputSchema,
    outputSchema: SuggestFollowUpActionsOutputSchema,
  },
  async (input) => {
    const { llmModel, llmApiKey, ...promptInput } = input;

    if (!llmModel.startsWith('googleai/')) {
      throw new Error(
        `The selected model '${llmModel}' is not supported by the currently configured AI providers. Only Google AI models (e.g., 'googleai/gemini-pro') are available.`
      );
    }

    const {output} = await suggestFollowUpActionsPrompt(promptInput, {
      model: llmModel as ModelReference<any>,
      auth: { apiKey: llmApiKey },
      config: {
        maxOutputTokens: 256,
      }
    });
    return output!;
  }
);

