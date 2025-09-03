'use server';

/**
 * @fileOverview AI-powered image editing flow using generative AI.
 *
 * - editImage - A function that takes an image and a description of the desired edit
 *   and returns a modified image.
 * - EditImageInput - The input type for the editImage function.
 * - EditImageOutput - The return type for the editImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EditImageInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      'A photo to edit, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
  editDescription: z.string().describe('A description of the desired edits.'),
});
export type EditImageInput = z.infer<typeof EditImageInputSchema>;

const EditImageOutputSchema = z.object({
  editedPhotoDataUri: z
    .string()
    .describe(
      'The edited photo, as a data URI that must include a MIME type and use Base64 encoding. Expected format: data:<mimetype>;base64,<encoded_data>.'
    ),
});
export type EditImageOutput = z.infer<typeof EditImageOutputSchema>;

export async function editImage(input: EditImageInput): Promise<EditImageOutput> {
  return editImageFlow(input);
}

// Unused prompt template - keeping for future reference
/*
const editImagePrompt = ai.definePrompt({
  name: 'editImagePrompt',
  input: {schema: EditImageInputSchema},
  output: {schema: EditImageOutputSchema},
  prompt: `You are an AI image editor. Please edit the given image based on the description.

Description: {{{editDescription}}}
Image: {{media url=photoDataUri}}

Please return the edited image as a data URI.
`,
});
*/

const editImageFlow = ai.defineFlow(
  {
    name: 'editImageFlow',
    inputSchema: EditImageInputSchema,
    outputSchema: EditImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: [
        {media: {url: input.photoDataUri}},
        {text: input.editDescription},
      ],
      config: {
        responseModalities: ['TEXT', 'IMAGE'], // MUST provide both TEXT and IMAGE, IMAGE only won't work
      },
    });

    return {editedPhotoDataUri: media!.url!};
  }
);
