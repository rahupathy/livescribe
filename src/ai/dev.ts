import { config } from 'dotenv';
config();

import '@/ai/flows/generate-action-items.ts';
import '@/ai/flows/summarize-meeting.ts';
import '@/ai/flows/suggest-follow-up-actions.ts';