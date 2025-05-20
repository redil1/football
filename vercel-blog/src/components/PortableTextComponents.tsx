import CodeBlock from './CodeBlock';
import SanityImage, { type ResolvedSanityImage } from './SanityImage'; // Import component and its specific image type
import type { PortableTextComponents } from '@portabletext/react';
// SanityImageType might still be useful for other non-resolved image scenarios if any
import type { Image as SanityImageType } from 'sanity'; 
import Link from 'next/link';

// Define components for various Portable Text block types
export const ptComponents: PortableTextComponents = {
  types: {
    code: CodeBlock, // Use our custom CodeBlock component for 'code' type
    // You can add more custom types here, for example, for images within Portable Text:
    image: ({ value }: { value: ResolvedSanityImage & { alt?: string; caption?: string } }) => { // Use the imported type, add alt/caption
      if (!value?.asset?.url) { // Check for a property that exists on a resolved asset, like URL or _id
        return null;
      }
      return (
        <figure className="my-6">
          <SanityImage 
            image={value} 
            alt={value.alt || 'Image from content'} 
            layout="responsive" // Or 'intrinsic' or fixed width/height
            width={800} // Example width, adjust as needed or make dynamic
            height={600} // Example height, adjust as needed or make dynamic
            className="rounded-lg shadow-md"
          />
          {value.caption && (
            <figcaption className="mt-2 text-sm text-center text-gray-600 dark:text-gray-400">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },
    // Add other custom block types if you have them in your Sanity schema
  },
  block: {
    // Customize rendering of standard block types like h1, h2, p, blockquote
    h1: ({ children }) => <h1 className="text-4xl font-bold my-4 text-gray-900 dark:text-white">{children}</h1>,
    h2: ({ children }) => <h2 className="text-3xl font-semibold my-3 text-gray-800 dark:text-gray-200">{children}</h2>,
    h3: ({ children }) => <h3 className="text-2xl font-semibold my-3 text-gray-800 dark:text-gray-200">{children}</h3>,
    h4: ({ children }) => <h4 className="text-xl font-semibold my-2 text-gray-700 dark:text-gray-300">{children}</h4>,
    normal: ({ children }) => <p className="my-2 text-base leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>,
    blockquote: ({ children }) => <blockquote className="my-4 pl-4 border-l-4 border-gray-300 dark:border-gray-600 italic text-gray-600 dark:text-gray-400">{children}</blockquote>,
    // You can add more custom styling for other block types (ul, ol, etc.)
  },
  marks: {
    // Customize rendering of marks like links, emphasis, strong
    link: ({ children, value }) => {
      const rel = !value.href.startsWith('/') ? 'noreferrer noopener' : undefined;
      const target = !value.href.startsWith('/') ? '_blank' : undefined;
      return (
        <Link href={value.href} rel={rel} target={target} className="text-blue-500 hover:underline dark:text-blue-400">
          {children}
        </Link>
      );
    },
    strong: ({children}) => <strong className="font-bold">{children}</strong>,
    em: ({children}) => <em className="italic">{children}</em>,
    code: ({children}) => <code className="bg-gray-100 dark:bg-gray-800 text-red-500 dark:text-red-400 px-1 py-0.5 rounded text-sm font-mono">{children}</code>,
    // Add other marks as needed
  },
  list: {
    bullet: ({children}) => <ul className="list-disc pl-5 my-2 space-y-1 text-gray-700 dark:text-gray-300">{children}</ul>,
    number: ({children}) => <ol className="list-decimal pl-5 my-2 space-y-1 text-gray-700 dark:text-gray-300">{children}</ol>,
  },
  listItem: {
    bullet: ({children}) => <li>{children}</li>,
    number: ({children}) => <li>{children}</li>,
  }
  // You can also provide a component for `unknownType`, `unknownMark`, etc.
};
