'use server';

/**
 * @fileOverview An advanced AI-powered image search flow that uses natural language queries to find images based on comprehensive AI-generated metadata.
 *
 * - advancedSearchImages - A function that handles the advanced image search process.
 * - AdvancedSearchImagesInput - The input type for the advancedSearchImages function.
 * - AdvancedSearchImagesOutput - The return type for the advancedSearchImages function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AdvancedSearchImagesInputSchema = z.object({
  query: z.string().describe('The natural language search query. It can be complex, e.g., "blurry photos of the city" or "best shots of nature".'),
  imageMetadata: z
    .array(
      z.object({
        filename: z.string().describe('The filename of the image.'),
        description: z.string().describe('The AI-generated description of the image.'),
        tags: z.array(z.string()).optional().describe('A list of AI-generated tags.'),
        isDefective: z.boolean().optional().describe('Whether the image has been flagged as defective.'),
        defectType: z.string().optional().describe('The type of defect if any (e.g., "Blurry", "Low Quality").'),
      })
    )
    .describe('An array of comprehensive image metadata objects.'),
});
export type AdvancedSearchImagesInput = z.infer<typeof AdvancedSearchImagesInputSchema>;

const AdvancedSearchImagesOutputSchema = z.object({
  results: z
    .array(z.string())
    .describe('An array of filenames that best match the complex search query.'),
});
export type AdvancedSearchImagesOutput = z.infer<typeof AdvancedSearchImagesOutputSchema>;

export async function advancedSearchImages(input: AdvancedSearchImagesInput): Promise<AdvancedSearchImagesOutput> {
  return advancedSearchImagesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'advancedSearchImagesPrompt',
  input: {schema: AdvancedSearchImagesInputSchema},
  output: {schema: AdvancedSearchImagesOutputSchema},
  prompt: `You are an advanced AI image search assistant. You are an expert at understanding nuanced, natural language queries and matching them against a list of detailed image metadata.

Analyze the user's query and the provided image metadata to determine the most relevant images. Consider all available fields: description, tags, and defect status.

Query: {{{query}}}

Image Metadata:
{{#each imageMetadata}}
- Filename: {{this.filename}}
  - Description: {{this.description}}
  - Tags: {{#if this.tags}}{{#each this.tags}}{{this}}{{#unless @last}}, {{/unless}}{{/each}}{{else}}N/A{{/if}}
  - Is Defective: {{#if this.isDefective}}Yes ({{this.defectType}}){{else}}No{{/if}}
{{/each}}

Return a JSON object containing only the filenames of the images that best match the query. The results should be ordered by relevance. If no images match the query, return an empty array.
`,
});

const advancedSearchImagesFlow = ai.defineFlow(
  {
    name: 'advancedSearchImagesFlow',
    inputSchema: AdvancedSearchImagesInputSchema,
    outputSchema: AdvancedSearchImagesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
