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
    <div className="break-inside-avoid mb-4" onClick={onClick}>
      <Card
        className="overflow-hidden cursor-pointer group transition-all hover:shadow-lg hover:brightness-90"
      >
        <CardContent className="p-0 relative">
          <Image
            src={image.dataUri}
            alt={image.name}
            width={500}
            height={Math.floor(Math.random() * (800 - 300 + 1)) + 300}
            className="w-full h-auto object-cover transition-transform group-hover:scale-105"
          />
          {loadingState && (
            <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white p-2 text-center">
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
    return (
        <div className="break-inside-avoid mb-4">
            <Skeleton className="w-full h-[300px]" />
        </div>
    )
}
