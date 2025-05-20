import { createClient } from 'next-sanity';

const projectId = '8h82wc2u';
const dataset = 'production';
const apiVersion = '2024-02-13'; // Use a recent API version

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production', // Use CDN in production
});
