"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { StoredImage } from "@/lib/types";
import { Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageCardProps {
  image: StoredImage;
  loadingState: string | boolean | undefined;
  onClick: () => void;
  selectionMode: boolean;
  isSelected: boolean;
}

export default function ImageCard({ image, loadingState, onClick, selectionMode, isSelected }: ImageCardProps) {
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>) => {
    // Disable drag-and-drop while in selection mode
    if (selectionMode) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("imageId", image.id);
  };
  
  return (
    <div 
      className="break-inside-avoid mb-4 relative" 
      onClick={onClick}
      draggable={!selectionMode}
      onDragStart={handleDragStart}
    >
      <Card
        className={cn(
          "overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 border-2",
          isSelected ? "border-primary" : "border-transparent"
        )}
      >
        <CardContent className="p-0 relative">
          <Image
            src={image.dataUri}
            alt={image.name}
            width={image.width || 500}
            height={image.height || 500}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {(loadingState || selectionMode) && (
            <div className={cn(
              "absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-2 text-center",
              !loadingState && selectionMode && !isSelected && "bg-black/40",
              !loadingState && selectionMode && isSelected && "bg-primary/40",
            )}>
              {loadingState ? (
                <>
                  <Loader2 className="animate-spin h-8 w-8 mb-2" />
                  <span className="text-sm font-medium">{typeof loadingState === 'string' ? loadingState : 'Processing...'}</span>
                </>
              ) : (
                selectionMode && isSelected && <CheckCircle2 className="h-10 w-10 text-white" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
       {selectionMode && !loadingState && (
        <div className={cn(
            "absolute top-2 left-2 h-6 w-6 rounded-full border-2 border-white bg-background/50 flex items-center justify-center transition-all",
            isSelected && "bg-primary border-primary"
        )}>
           {isSelected && <CheckCircle2 className="h-5 w-5 text-white" />}
        </div>
      )}
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
