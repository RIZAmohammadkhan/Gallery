'use server';
/**
 * @fileOverview This file contains a Genkit flow for detecting defective images (e.g., blurry, duplicates).
 *
 * - detectDefectiveImages - A function that initiates the image defect detection process.
 * - DetectDefectiveImagesInput - The input type for the detectDefectiveImages function.
 * - DetectDefectiveImagesOutput - The return type for the detectDefectiveImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDefectiveImagesInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo to be checked for defects, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DetectDefectiveImagesInput = z.infer<typeof DetectDefectiveImagesInputSchema>;

const DetectDefectiveImagesOutputSchema = z.object({
  isDefective: z
    .boolean()
    .describe('Whether the image is potentially defective (blurry, duplicate, etc.).'),
  defectType: z
    .string()
    .optional()
    .describe('The type of defect detected, if any (e.g., blurry, duplicate).'),
  confidence: z
    .number()
    .optional()
    .describe('The confidence level of the defect detection (0-1).'),
});
export type DetectDefectiveImagesOutput = z.infer<typeof DetectDefectiveImagesOutputSchema>;

export async function detectDefectiveImages(
  input: DetectDefectiveImagesInput
): Promise<DetectDefectiveImagesOutput> {
  return detectDefectiveImagesFlow(input);
}

const detectDefectiveImagesPrompt = ai.definePrompt({
  name: 'detectDefectiveImagesPrompt',
  input: {schema: DetectDefectiveImagesInputSchema},
  output: {schema: DetectDefectiveImagesOutputSchema},
  prompt: `You are an AI image quality expert. Analyze the image provided to determine if it is defective.

  Consider these common defects:
  - Blurriness: Image is out of focus.
  - Duplicates: Image is very similar to another image already in the gallery.
  - Low Quality: Image has low resolution or is heavily compressed.
  - Accidental: Image is a screenshot, or photo of text, or other non-personal photo.

  Based on your analysis, determine if the image is defective and set the isDefective field accordingly.
  If isDefective is true, also provide the defectType (e.g., blurry, duplicate, low quality, accidental) and a confidence score (0-1) in the corresponding fields.

  Here is the image to analyze:
  {{media url=photoDataUri}}
  `,
});

const detectDefectiveImagesFlow = ai.defineFlow(
  {
    name: 'detectDefectiveImagesFlow',
    inputSchema: DetectDefectiveImagesInputSchema,
    outputSchema: DetectDefectiveImagesOutputSchema,
  },
  async input => {
    const {output} = await detectDefectiveImagesPrompt(input);
    return output!;
  }
);
