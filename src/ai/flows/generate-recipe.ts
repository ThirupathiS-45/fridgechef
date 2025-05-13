
// Use server directive is required when using Genkit flows in Next.js
'use server';
/**
 * @fileOverview Recipe generation flow that suggests recipes based on user-provided ingredients.
 *
 * - generateRecipe - A function that takes ingredients as input and returns a recipe.
 * - GenerateRecipeInput - The input type for the generateRecipe function.
 * - GenerateRecipeOutput - The return type for the generateRecipe function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateRecipeInputSchema = z.object({
  ingredients: z
    .string()
    .describe('A comma-separated list of ingredients available for use in the recipe.'),
  language: z.string().optional().describe('The preferred language for the recipe (e.g., "en" for English, "ta" for Tamil).'),
});
export type GenerateRecipeInput = z.infer<typeof GenerateRecipeInputSchema>;

const GenerateRecipeOutputSchema = z.object({
  recipeName: z.string().describe('The name of the suggested recipe.'),
  ingredients: z.array(z.string()).describe('A list of ingredients required for the recipe.'),
  instructions: z.string().describe('Step-by-step instructions for preparing the recipe.'),
  prepTime: z.string().optional().describe('The estimated preparation time for the recipe.'),
  cookTime: z.string().optional().describe('The estimated cooking time for the recipe.'),
});
export type GenerateRecipeOutput = z.infer<typeof GenerateRecipeOutputSchema>;

export async function generateRecipe(input: GenerateRecipeInput): Promise<GenerateRecipeOutput> {
  return generateRecipeFlow(input);
}

const generateRecipePrompt = ai.definePrompt({
  name: 'generateRecipePrompt',
  input: {schema: GenerateRecipeInputSchema},
  output: {schema: GenerateRecipeOutputSchema},
  prompt: `You are a world-class chef. Generate a recipe based on the ingredients provided.
{{#if language}}
Please provide the recipe primarily in the language specified by the code: {{language}}. For example, 'en' for English, 'ta' for Tamil. If Tamil ('ta') is requested, please use Tamil script.
{{else}}
Respond in the language of the provided ingredients or default to English if the language is unclear.
{{/if}}
Consider common ingredient pairings.

Ingredients: {{{ingredients}}}

Recipe should include:
- recipeName
- ingredients (array of strings)
- instructions
- prepTime (optional)
- cookTime (optional)`,
});

const generateRecipeFlow = ai.defineFlow(
  {
    name: 'generateRecipeFlow',
    inputSchema: GenerateRecipeInputSchema,
    outputSchema: GenerateRecipeOutputSchema,
  },
  async input => {
    const {output} = await generateRecipePrompt(input);
    return output!;
  }
);
