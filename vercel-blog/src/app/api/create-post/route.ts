// src/app/api/create-post/route.ts
import { NextResponse } from 'next/server';
import { writeClient } from '@/lib/sanity.client'; // Use the new write client

// Define the expected request body structure for creating a post
interface CreatePostPayload {
  title: string;
  slug: string; // Just the string, slug object will be formed
  authorRef: string; // The _id of the author document
  coverImageRef?: string; // The _id of the image asset (e.g., "image-xxxx-jpg")
  publishedAt?: string;
  excerpt?: string;
  body?: Record<string, unknown>[]; // Portable Text array
  // Add other fields as needed by your frontend client
}

// Define the structure for the Sanity post document being created
interface SanityPostDocument {
  _type: 'post';
  title: string;
  slug: { _type: 'slug'; current: string };
  author: { _type: 'reference'; _ref: string };
  publishedAt: string;
  excerpt: string;
  body: Record<string, unknown>[];
  coverImage?: {
    _type: 'image';
    asset: {
      _type: 'reference';
      _ref: string;
    };
  };
}

export async function POST(request: Request) {
  // 1. Authentication/Authorization (CRITICAL FOR PRODUCTION)
  const requestApiKey = request.headers.get('x-api-key');
  if (requestApiKey !== process.env.YOUR_INTERNAL_API_KEY) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await request.json() as CreatePostPayload;

    // 2. Validate payload (important for robustness)
    if (!payload.title || !payload.slug || !payload.authorRef) {
      return NextResponse.json({ message: 'Missing required fields: title, slug, authorRef' }, { status: 400 });
    }

    // 3. Construct the Sanity document
    const postDocument: SanityPostDocument = {
      _type: 'post',
      title: payload.title,
      slug: { _type: 'slug', current: payload.slug },
      author: { _type: 'reference', _ref: payload.authorRef },
      publishedAt: payload.publishedAt || new Date().toISOString(),
      excerpt: payload.excerpt || '',
      body: payload.body || [],
    };

    if (payload.coverImageRef) {
      postDocument.coverImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: payload.coverImageRef,
        },
      };
    }

    // 4. Create the document in Sanity
    const createdPost = await writeClient.create(postDocument);
    
    // 5. Optionally, trigger a revalidation of your Next.js pages if using ISR/SSG
    // This requires setting up on-demand revalidation: https://nextjs.org/docs/app/building-your-application/data-fetching/fetching-caching-and-revalidating#on-demand-revalidation
    // Example:
    // await fetch(`/api/revalidate?path=/&secret=${process.env.REVALIDATION_TOKEN}`);
    // await fetch(`/api/revalidate?path=/post/${createdPost.slug.current}&secret=${process.env.REVALIDATION_TOKEN}`);

    return NextResponse.json({ message: 'Post created successfully', post: createdPost }, { status: 201 });

  } catch (error) {
    console.error('Error creating post:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error creating post', error: errorMessage }, { status: 500 });
  }
}
