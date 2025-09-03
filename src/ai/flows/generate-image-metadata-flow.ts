'use server';
/**
 * @fileOverview AI flow to generate image metadata.
 *
 * - generateImageMetadata - A function that generates metadata for a given image.
 * - GenerateImageMetadataInput - The input type for the generateImageMetadata function.
 * - GenerateImageMetadataOutput - The return type for the generateImageMetadata function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateImageMetadataInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to analyze, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type GenerateImageMetadataInput = z.infer<typeof GenerateImageMetadataInputSchema>;

const GenerateImageMetadataOutputSchema = z.object({
  metadata: z
    .string()
    .describe('A short, one-sentence description of the image.'),
});
export type GenerateImageMetadataOutput = z.infer<typeof GenerateImageMetadataOutputSchema>;

export async function generateImageMetadata(
  input: GenerateImageMetadataInput
): Promise<GenerateImageMetadataOutput> {
  return generateImageMetadataFlow(input);
}

const generateImageMetadataPrompt = ai.definePrompt({
  name: 'generateImageMetadataPrompt',
  input: {schema: GenerateImageMetadataInputSchema},
  output: {schema: GenerateImageMetadataOutputSchema},
  prompt: `You are an AI that generates short, one-sentence descriptions of images.

  Analyze the image and provide a concise description of its content, including objects, scenes, and subjects.
  Image: {{media url=photoDataUri}}`,
});

const generateImageMetadataFlow = ai.defineFlow(
  {
    name: 'generateImageMetadataFlow',
    inputSchema: GenerateImageMetadataInputSchema,
    outputSchema: GenerateImageMetadataOutputSchema,
  },
  async input => {
    const {output} = await generateImageMetadataPrompt(input);
    return output!;
  }
);
