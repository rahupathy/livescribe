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
  meetingNotes: z.string().describe('Meeting notes or transcript from the discussion.'),
  meetingContext: z.string().optional().describe('Context about the meeting including participants and agenda.'),
  llmModel: z.string().describe('The LLM model to use for suggesting follow-up actions.'),
  llmApiKey: z.string().describe('The API key for the LLM model.'),
});
export type SuggestFollowUpActionsInput = z.infer<typeof SuggestFollowUpActionsInputSchema>;

const SuggestionItemSchema = z.object({
  suggestion: z.string().describe('The suggested follow-up action.'),
  transcriptReference: z.string().optional().describe('A brief, relevant excerpt from the meeting notes/transcript that directly led to this suggestion.'),
});

const SuggestFollowUpActionsOutputSchema = z.object({
  followUpActions: z.array(SuggestionItemSchema).describe('A list of suggested follow-up actions, each potentially with a reference to the relevant part of the transcript.'),
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
For each suggestion, if possible, identify and include a brief, relevant excerpt from the meeting notes that directly led to this suggestion as 'transcriptReference'.

Meeting Notes:
{{{meetingNotes}}}

{{#if meetingContext}}
Meeting Context:
{{{meetingContext}}}
{{/if}}

Provide your output as a list of objects, where each object has a "suggestion" field (string) and an optional "transcriptReference" field (string).
Example:
{
  "followUpActions": [
    { "suggestion": "Schedule a follow-up meeting about X.", "transcriptReference": "Alice: We need to discuss X further." },
    { "suggestion": "Draft the proposal for Y.", "transcriptReference": "Bob mentioned starting the Y proposal." }
  ]
}
If no relevant transcript reference can be found for a suggestion, omit the "transcriptReference" field for that item.
If no follow up actions can be generated, return an empty list for "followUpActions".

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
        maxOutputTokens: 512, // Increased to accommodate potentially longer suggestions with references
      }
    });
    // Ensure an empty array is returned if the model outputs nothing or an invalid structure for followUpActions
    if (!output || !Array.isArray(output.followUpActions)) {
        return { followUpActions: [] };
    }
    return output;
  }
);
