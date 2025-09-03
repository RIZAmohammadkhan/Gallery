import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import { settingsManager } from '@/lib/settings-manager';

// Function to get the API key dynamically
function getApiKey(): string {
  // Check environment variable first (for server-side), then settings
  return process.env.GEMINI_API_KEY || settingsManager.getGeminiApiKey();
}

export const ai = genkit({
  plugins: [
    googleAI({
      apiKey: getApiKey(),
    })
  ],
  model: 'googleai/gemini-2.5-flash',
});

// Export a function to reinitialize AI with new API key
export function reinitializeAI(): void {
  // This would be called when API key is updated in settings
  // For now, we'll need to restart the application to pick up new keys
  console.log('AI configuration updated. Please restart the application for changes to take effect.');
}
