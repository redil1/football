import Link from 'next/link';
// import Image from 'next/image'; // No longer needed if SanityImage handles all blog images
import { client } from '@/lib/sanity.client'; // Assuming 'src' is aliased to '@'
import SanityImage from '@/components/SanityImage'; // Import the new component
import type { Post } from '@/lib/types'; // Import shared types

async function getPosts(): Promise<Post[]> {
  const query = `*[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    coverImage { 
      ..., // Spread all fields of the image object
      asset-> { // Ensure asset details are fetched if needed, though urlBuilder handles _ref
        _id,
        _ref,
        _type,
        url,
        path,
        assetId,
        extension,
        mimeType,
        size,
        metadata { 
          lqip 
        }
      }
    },
    author->{
      name,
      slug
    },
    publishedAt,
    excerpt
  }`;
  const posts = await client.fetch<Post[]>(query);
  return posts;
}

export default async function HomePage() {
  const posts = await getPosts();

  return (
    <div className="container mx-auto px-4 py-8 font-[family-name:var(--font-geist-sans)]">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
          Football Events Blog
        </h1>
        <p className="mt-3 text-lg text-gray-600 dark:text-gray-300">
          The latest news, analysis, and insights from the world of football.
        </p>
      </header>

      {posts.length === 0 && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          No posts published yet. Check back soon!
        </p>
      )}

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article
            key={post._id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105"
          >
            {post.coverImage && (
              <Link href={`/post/${post.slug.current}`} className="block h-48 w-full relative group overflow-hidden">
                <SanityImage 
                  image={post.coverImage} 
                  alt={post.title || 'Post image'} 
                  layout="fill" 
                  objectFit="cover" 
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </Link>
            )}
            <div className="p-6">
              <h2 className="text-2xl font-semibold mb-2 leading-tight">
                <Link href={`/post/${post.slug.current}`} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  {post.title}
                </Link>
              </h2>
              {post.author && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  By {post.author.name}
                </p>
              )}
              {post.excerpt && (
                <p className="text-gray-700 dark:text-gray-300 text-base mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              )}
              <Link href={`/post/${post.slug.current}`} className="text-blue-500 dark:text-blue-400 hover:underline font-medium">
                Read more &rarr;
              </Link>
            </div>
          </article>
        ))}
      </main>
    </div>
  );
}

// Revalidate this page every 60 seconds (Incremental Static Regeneration)
export const revalidate = 0;

