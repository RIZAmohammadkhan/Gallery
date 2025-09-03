import { config } from 'dotenv';
config();

import '@/ai/flows/edit-image-flow.ts';
import '@/ai/flows/categorize-images-flow.ts';
import '@/ai/flows/detect-defective-images-flow.ts';
import '@/ai/flows/generate-image-metadata-flow.ts';
import '@/ai/flows/search-images-flow.ts';
import '@/ai/flows/advanced-search-images-flow.ts';
