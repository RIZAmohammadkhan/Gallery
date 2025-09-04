"use client";

import { StoredImage } from "@/lib/types";
import ImageCard, { ImageCardSkeleton } from "./image-card";
import { Frown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface ImageGridProps {
  images: StoredImage[];
  loadingStates: Record<string, string | boolean>;
  onImageClick: (id: string) => void;
  selectionMode: boolean;
  selectedImageIds: Set<string>;
}

export default function ImageGrid({ images, loadingStates, onImageClick, selectionMode, selectedImageIds }: ImageGridProps) {
  const isMobile = useIsMobile();
  
  if (Object.values(loadingStates).some(s => typeof s === 'string' && s.includes('Uploading')) && images.length === 0) {
    return (
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-4">
        {[...Array(isMobile ? 3 : 5)].map((_, i) => <ImageCardSkeleton key={i} />)}
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground px-4">
        <Frown className="w-12 h-12 sm:w-16 sm:h-16 mb-4" />
        <h2 className="text-xl sm:text-2xl font-semibold text-center">No Images Found</h2>
        <p className="text-sm sm:text-base text-center">Upload an image to get started or try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={() => onImageClick(image.id)}
          loadingState={loadingStates[image.id]}
          selectionMode={selectionMode}
          isSelected={selectedImageIds.has(image.id)}
        />
      ))}
    </div>
  );
}
