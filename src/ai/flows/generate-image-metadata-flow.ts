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
    .describe('A detailed, descriptive paragraph about the image.'),
  tags: z.array(z.string()).describe('An array of relevant keywords or tags for the image.'),
  title: z.string().describe('A short, catchy title for the image.')
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
  prompt: `You are an expert AI at analyzing images and generating rich, detailed metadata.

  Analyze the provided image and generate the following:
  1.  **metadata**: A detailed, descriptive paragraph about the image. Describe the scene, subjects, objects, colors, mood, and any notable details.
  2.  **tags**: A list of 5-7 relevant keywords or tags that accurately represent the image content.
  3.  **title**: A short, catchy, and descriptive title for the image.

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
