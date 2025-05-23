import { client } from '@/lib/sanity.client';
import SanityImage from '@/components/SanityImage';
import { PortableText } from '@portabletext/react';
import { ptComponents } from '@/components/PortableTextComponents'; // Adjust path if needed
import type { Post, SanityImageType, PostImage } from '@/lib/types'; // Import Post, SanityImageType, and PostImage
import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata, ResolvingMetadata } from 'next';
import imageUrlBuilder from '@sanity/image-url'; // Needed for OG image URL

// Function to fetch a single post by its slug
async function getPost(slug: string): Promise<Post | null> {
  const query = `*[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    author->{
      name
    },
    coverImage { // Changed from mainImage
      ...,
      asset->
    },
    publishedAt,
    excerpt, // Fetch excerpt
    body[]{
      ...,
      _type == "image" => {
        ...,
        asset->
      },
      _type == "faq" => {
        _key,
        _type,
        question,
        answer
      },
      _type == "callout" => {
        _key,
        _type,
        type,
        title,
        content
      },
      _type == "customCode" => {
        _key,
        _type,
        code,
        language,
        filename
      }
    }
  }`;
  const post = await client.fetch<Post | null>(query, { slug });
  return post;
}

// Function to generate static paths for posts
export async function generateStaticParams() {
  const query = `*[_type == "post" && defined(slug.current)][]{
    "slug": slug.current
  }`;
  const slugs: { slug: string }[] = await client.fetch(query);
  return slugs.map((item) => ({ slug: item.slug }));
}

// Revalidate this page every 60 seconds
export const revalidate = 60;

// Helper to build image URLs for OG images
const builder = imageUrlBuilder(client);
function urlFor(source: SanityImageType | PostImage) { // Accept PostImage as well
  return builder.image(source);
}

// Generate metadata for each post page
export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const post = await getPost(slug); // Reuse your getPost function

  if (!post) {
    // Optionally, return default metadata or handle as needed
    return {
      title: 'Post not found',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];
  const ogImage = post.coverImage ? urlFor(post.coverImage).width(1200).height(630).fit('crop').url() : undefined; // Changed from mainImage

  return {
    title: `${post.title || 'Untitled Post'} | Football Events Blog`,
    description: post.excerpt || (await parent).description || 'A post from Football Events Blog.',
    openGraph: {
      title: post.title || 'Untitled Post',
      description: post.excerpt || '',
      type: 'article',
      publishedTime: post.publishedAt || undefined,
      url: `/post/${post.slug.current}`, // Make sure this forms the full URL in production
      images: ogImage ? [{ url: ogImage }, ...previousImages] : previousImages,
      // You can add more OG tags like site_name, authors, etc.
    },
    // You can also add Twitter card metadata here
    // twitter: {
    //   card: 'summary_large_image',
    //   title: post.title || 'Untitled Post',
    //   description: post.excerpt || '',
    //   images: ogImage ? [ogImage] : [],
    // },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const post = await getPost(resolvedParams.slug);

  if (!post) {
    notFound(); // Triggers 404 page if post not found
  }

  // Debug: Log the body content to console
  if (post.body) {
    console.log('Post body content:', JSON.stringify(post.body, null, 2));
  }

  return (
    <article className="container mx-auto px-4 py-8 max-w-3xl">
      <Link href="/" className="text-blue-500 hover:underline mb-6 inline-block">
        &larr; Back to all posts
      </Link>
      <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">{post.title || 'Untitled Post'}</h1>

      {post.author?.name && (
        <p className="text-gray-600 dark:text-gray-400 mb-2">
          By {post.author.name}
        </p>
      )}
      
      {post.publishedAt && (
        <p className="text-gray-500 dark:text-gray-500 text-sm mb-6">
          Published on {new Date(post.publishedAt).toLocaleDateString()}
        </p>
      )}

      {post.coverImage && (
        <div className="mb-8 relative w-full h-96 shadow-lg rounded-lg overflow-hidden">
          <SanityImage 
            image={post.coverImage} 
            alt={post.title || 'Post image'} 
            layout="fill" 
            objectFit="cover" 
            priority // Consider adding priority for LCP images
          />
        </div>
      )}

      {post.body ? (
        <div className="prose dark:prose-invert max-w-none">
          <PortableText value={post.body} components={ptComponents} />
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300">This post has no content.</p>
      )}
    </article>
  );
}
