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
  return (
    <Card
      className="overflow-hidden cursor-pointer group transition-all hover:shadow-lg hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-0 relative aspect-square">
        <Image
          src={image.dataUri}
          alt={image.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform group-hover:scale-105"
        />
        {loadingState && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2 text-center">
            <Loader2 className="animate-spin h-8 w-8 mb-2" />
            <span className="text-sm font-medium">{typeof loadingState === 'string' ? loadingState : 'Processing...'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function ImageCardSkeleton() {
    return (
        <div className="aspect-square">
            <Skeleton className="w-full h-full" />
        </div>
    )
}
