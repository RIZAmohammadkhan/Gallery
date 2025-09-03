'use server';

/**
 * @fileOverview An AI-powered image search flow that uses natural language queries to find images based on AI-generated metadata.
 *
 * - searchImages - A function that handles the image search process.
 * - SearchImagesInput - The input type for the searchImages function.
 * - SearchImagesOutput - The return type for the searchImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SearchImagesInputSchema = z.object({
  query: z.string().describe('The natural language search query.'),
  imageMetadata: z
    .array(
      z.object({
        filename: z.string().describe('The filename of the image.'),
        description: z.string().describe('The AI-generated description of the image.'),
      })
    )
    .describe('An array of image metadata objects containing filenames and descriptions.'),
});
export type SearchImagesInput = z.infer<typeof SearchImagesInputSchema>;

const SearchImagesOutputSchema = z.object({
  results: z
    .array(z.string())
    .describe('An array of filenames that match the search query.'),
});
export type SearchImagesOutput = z.infer<typeof SearchImagesOutputSchema>;

export async function searchImages(input: SearchImagesInput): Promise<SearchImagesOutput> {
  return searchImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'searchImagesPrompt',
  input: {schema: SearchImagesInputSchema},
  output: {schema: SearchImagesOutputSchema},
  prompt: `You are an AI image search assistant. Given a user query and a list of image metadata (filename and description), determine which images match the query.

Query: {{{query}}}

Image Metadata:
{{#each imageMetadata}}
- Filename: {{this.filename}}, Description: {{this.description}}
{{/each}}

Return a JSON array containing only the filenames of the images that match the query.  Do not include any other text or explanation. If no images match the query, return an empty array.

{
  "results": []
}`,
});

const searchImagesFlow = ai.defineFlow(
  {
    name: 'searchImagesFlow',
    inputSchema: SearchImagesInputSchema,
    outputSchema: SearchImagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
