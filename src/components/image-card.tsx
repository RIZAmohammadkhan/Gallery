"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoredImage } from "@/lib/types";
import { Loader2 } from "lucide-react";

interface ImageCardProps {
  image: StoredImage;
  loadingState: string | boolean | undefined;
  onClick: () => void;
}

export default function ImageCard({ image, loadingState, onClick }: ImageCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    e.dataTransfer.setData("imageId", image.id);
  };
  
  return (
    <div 
      className="break-inside-avoid mb-4" 
      onClick={onClick}
      draggable="true"
      onDragStart={handleDragStart}
    >
      <Card
        className="overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 border-transparent hover:border-primary/50"
      >
        <CardContent className="p-0 relative">
          <Image
            src={image.dataUri}
            alt={image.name}
            width={image.width || 500}
            height={image.height || 500}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {loadingState && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-2 text-center">
              <Loader2 className="animate-spin h-8 w-8 mb-2" />
              <span className="text-sm font-medium">{typeof loadingState === 'string' ? loadingState : 'Processing...'}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ImageCardSkeleton() {
    const randomHeight = Math.floor(Math.random() * (450 - 250 + 1)) + 250;
    return (
        <div className="break-inside-avoid mb-4">
            <Skeleton className="w-full" style={{ height: `${randomHeight}px` }}/>
        </div>
    )
}
