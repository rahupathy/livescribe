export interface MeetingContext {
  participants: string;
  agenda: string;
  llmModel: string;
  llmApiKey: string;
}

export interface SuggestionItem {
  suggestion: string;
  transcriptReference?: string;
}

export interface ScribeData {
  transcript: string;
  summary: string;
  actionItems: string[];
  suggestions: SuggestionItem[];
}

```