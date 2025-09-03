'use server';

/**
 * @fileOverview This file defines a Genkit flow for categorizing images into predefined folders using AI.
 *
 * It includes:
 * - categorizeImage - A function that categorizes an image.
 * - CategorizeImageInput - The input type for the categorizeImage function.
 * - CategorizeImageOutput - The return type for the categorizeImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CategorizeImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of an image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  folders: z.array(z.string()).describe('The list of predefined folders.'),
});
export type CategorizeImageInput = z.infer<typeof CategorizeImageInputSchema>;

const CategorizeImageOutputSchema = z.object({
  category: z.string().describe('The predicted category for the image.'),
});
export type CategorizeImageOutput = z.infer<typeof CategorizeImageOutputSchema>;

export async function categorizeImage(input: CategorizeImageInput): Promise<CategorizeImageOutput> {
  return categorizeImageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'categorizeImagePrompt',
  input: {schema: CategorizeImageInputSchema},
  output: {schema: CategorizeImageOutputSchema},
  prompt: `You are an expert image classifier. Given an image and a list of folders, you will predict the most appropriate folder for the image.\n\nImage: {{media url=photoDataUri}}\n\nFolders: {{{folders}}}\n\nCategory:`, // Keep it concise, the bot should only return the category.
});

const categorizeImageFlow = ai.defineFlow(
  {
    name: 'categorizeImageFlow',
    inputSchema: CategorizeImageInputSchema,
    outputSchema: CategorizeImageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
