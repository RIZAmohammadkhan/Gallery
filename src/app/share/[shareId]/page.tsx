// This is a placeholder page for displaying shared galleries.
// In a real application, this page would fetch the shared image data
// from a persistent backend using the `shareId` from the URL.

"use client";

import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { GalleryHorizontal } from 'lucide-react';

export default function SharedGalleryPage() {
  const searchParams = useSearchParams();
  const title = searchParams.get('title') || 'Shared Gallery';
  const imagesParam = searchParams.get('images');
  
  let images: { id: string; dataUri: string; name: string }[] = [];
  if (imagesParam) {
    try {
      images = JSON.parse(decodeURIComponent(imagesParam));
    } catch (e) {
      console.error("Failed to parse images from URL", e);
    }
  }

  if (images.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-background text-foreground">
        <h1 className="text-2xl font-bold mb-4">No Images to Display</h1>
        <p className="text-muted-foreground">The link may be invalid or the images may have been removed.</p>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2">
            <GalleryHorizontal className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-headline font-semibold tracking-tight md:text-2xl">{title}</h1>
        </div>
      </header>
      <main className="p-4 md:p-6">
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {images.map(image => (
            <div key={image.id} className="break-inside-avoid mb-4">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <Image
                    src={image.dataUri}
                    alt={image.name}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
