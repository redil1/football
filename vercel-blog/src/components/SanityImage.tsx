'use client';

import NextImage from 'next/image';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '@/lib/sanity.client'; // Your configured Sanity client
import type { 
  Image as SanityImageType, 
  Asset as SanityAsset, 
  ImageCrop, 
  ImageHotspot 
} from 'sanity'; // Base Sanity image type

// Helper function to get the Sanity image URL builder
const builder = imageUrlBuilder(client);

// Define a type for an image object where the asset is fully resolved
export interface ResolvedSanityImage extends Omit<SanityImageType, 'asset'> {
  asset: SanityAsset; // Expects the full asset document
  crop?: ImageCrop;
  hotspot?: ImageHotspot;
}

function urlFor(source: ResolvedSanityImage | SanityImageType) { // Accept both for flexibility if needed elsewhere, but component expects ResolvedSanityImage
  return builder.image(source as SanityImageType);
}

interface SanityImageProps {
  image: ResolvedSanityImage; // Use the more specific type
  alt: string;
  className?: string;
  width?: number; // Strict number or undefined
  height?: number; // Strict number or undefined
  layout?: 'fill' | 'fixed' | 'intrinsic' | 'responsive'; // Subset of NextImage layouts
  objectFit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';
  quality?: number; // Strict number
  sizes?: string;
  priority?: boolean; // Add priority prop
  // Not including ...rest or other NextImageProps for now to simplify
}

const SanityImage: React.FC<SanityImageProps> = ({
  image,
  alt,
  className,
  width,
  height,
  sizes,
  layout = 'responsive',
  objectFit,
  quality = 75, // Default quality, strictly number
  priority = false,
  // No ...rest here
}) => {
  console.log('SanityImage received image prop:', JSON.stringify(image, null, 2));
  if (!image?.asset?._id) { // Check for resolved asset's _id
    console.warn('SanityImage: image.asset._id is missing (expected for resolved asset). Image data:', JSON.stringify(image, null, 2));
    // console.warn('SanityImage: Image asset reference is missing', image);
    const placeholderStyle: React.CSSProperties = {
      width: width ? `${width}px` : (layout === 'fill' ? '100%' : undefined),
      height: height ? `${height}px` : (layout === 'fill' ? '100%' : undefined),
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
    return <div className={`bg-gray-200 dark:bg-gray-700 ${className || ''}`} style={placeholderStyle} aria-label={alt || 'Image placeholder'}><span>🖼️</span></div>;
  }

  const imageUrl = urlFor(image).quality(quality).auto('format').url();

  // Prepare props for NextImage, ensuring width/height are numbers or undefined for fill
  const finalWidth = layout === 'fill' ? undefined : width;
  const finalHeight = layout === 'fill' ? undefined : height;

  return (
    <NextImage
      src={imageUrl}
      alt={alt}
      className={className}
      width={finalWidth as number | undefined}
      height={finalHeight as number | undefined}
      sizes={sizes}
      layout={layout}
      objectFit={objectFit}
      quality={quality}
      priority={priority} // Pass priority to NextImage
      // Consider re-enabling placeholder/blurDataURL if LQIP is available in your Sanity asset metadata
      // placeholder={image.asset?.metadata?.lqip ? 'blur' : 'empty'}
      // blurDataURL={image.asset?.metadata?.lqip}
      // No {...rest} spread here
    />
  );
};

export default SanityImage;

