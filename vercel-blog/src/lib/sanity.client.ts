import { createClient, type SanityClient } from 'next-sanity';

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || '8h82wc2u';
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-02-13';

export const client: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  // token: process.env.SANITY_API_READ_TOKEN, // For drafts
});

// Client for write operations
export const writeClient: SanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false, // Writes must go to the live API, not CDN
  token: process.env.SANITY_API_WRITE_TOKEN, // Your write token
});
