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
  body?: PortableTextBlock[]; // Use PortableTextBlock for type safety
  // Add other fields like categories if you fetch them
  // categories?: Category[]; 
}

// Example for a Category type if you use it
// export interface Category {
//   _id: string;
//   title?: string | null;
//   description?: string | null;
// }
