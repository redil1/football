import type { 
  Image as SanityImageType, 
  Slug as SanitySlugType,
  Asset as SanityAsset, // For resolved asset
  ImageCrop,
  ImageHotspot
} from 'sanity';
import type { PortableTextBlock } from '@portabletext/types';

// Re-exporting Sanity's Image type for convenience if needed elsewhere directly
export type { SanityImageType, SanitySlugType }; 

// Interface for an image where the asset is resolved and mandatory
export interface PostImage extends Omit<SanityImageType, 'asset' | 'crop' | 'hotspot'> {
  asset: SanityAsset; // Asset is now mandatory and resolved
  crop?: ImageCrop;
  hotspot?: ImageHotspot;
}

// Custom content type interfaces
export interface FAQBlock {
  _type: 'faq';
  _key: string;
  question: string;
  answer: string;
}

export interface CalloutBlock {
  _type: 'callout';
  _key: string;
  type: 'tip' | 'warning' | 'info' | 'success' | 'error';
  title: string;
  content: string;
}

export interface CustomCodeBlock {
  _type: 'customCode';
  _key: string;
  code: string;
  language?: string;
  filename?: string;
}

// Extended Portable Text block that includes custom types
export type ExtendedPortableTextBlock = PortableTextBlock | FAQBlock | CalloutBlock | CustomCodeBlock;

export interface Author {
  name?: string | null;
  image?: SanityImageType | null; // Assuming author might have an image
  // Add other author fields if you have them (e.g., bio, slug)
}

export interface Post {
  _id: string;
  title?: string | null;
  slug: SanitySlugType; // Using Sanity's Slug type
  author?: Author | null;
  coverImage?: PostImage | null; // Use the new strict type for coverImage
  publishedAt?: string | null;
  excerpt?: string | null;
  body?: ExtendedPortableTextBlock[]; // Use extended type for custom blocks
  // Add other fields like categories if you fetch them
  // categories?: Category[]; 
}

// Example for a Category type if you use it
// export interface Category {
//   _id: string;
//   title?: string | null;
//   description?: string | null;
// }
