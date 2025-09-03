"use client";

import { StoredImage } from "@/lib/types";
import ImageCard, { ImageCardSkeleton } from "./image-card";
import { Frown } from "lucide-react";

interface ImageGridProps {
  images: StoredImage[];
  loadingStates: Record<string, string | boolean>;
  onImageClick: (id: string) => void;
}

export default function ImageGrid({ images, loadingStates, onImageClick }: ImageGridProps) {
  if (Object.values(loadingStates).some(s => typeof s === 'string' && s.includes('Uploading')) && images.length === 0) {
    return (
      <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
        {[...Array(5)].map((_, i) => <ImageCardSkeleton key={i} />)}
      </div>
    );
  }
  
  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <Frown className="w-16 h-16 mb-4" />
        <h2 className="text-2xl font-semibold">No Images Found</h2>
        <p>Upload an image to get started or try a different search term.</p>
      </div>
    );
  }

  return (
    <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
      {images.map((image) => (
        <ImageCard
          key={image.id}
          image={image}
          onClick={() => onImageClick(image.id)}
          loadingState={loadingStates[image.id]}
        />
      ))}
    </div>
  );
}
