export interface MeetingContext {
  participants: string;
  agenda: string;
}

export interface ScribeData {
  transcript: string;
  summary: string;
  actionItems: string[];
  suggestions: string[];
}
