// Shared gallery page for displaying persistent shared galleries

"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { GalleryHorizontal, Download, ExternalLink, Clock, Eye, AlertCircle } from 'lucide-react';
import type { SharedGallery } from '@/lib/sharing-client';

export default function SharedGalleryPage() {
  const params = useParams();
  const shareId = params?.shareId as string;
  const [gallery, setGallery] = useState<SharedGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      const loadGallery = async () => {
        try {
          const response = await fetch(`/api/share/${shareId}`);
          if (response.ok) {
            const sharedGallery = await response.json();
            
            // Convert date strings to Date objects
            if (sharedGallery.createdAt) {
              sharedGallery.createdAt = new Date(sharedGallery.createdAt);
            }
            if (sharedGallery.expiresAt) {
              sharedGallery.expiresAt = new Date(sharedGallery.expiresAt);
            }
            
            setGallery(sharedGallery);
          } else {
            setError("Gallery not found or has expired");
          }
        } catch (err) {
          setError("Failed to load gallery");
          console.error("Error loading shared gallery:", err);
        } finally {
          setLoading(false);
        }
      };
      
      loadGallery();
    } else {
      setError("Invalid share link");
      setLoading(false);
    }
  }, [shareId]);

  const downloadImage = (dataUri: string, name: string) => {
    const link = document.createElement('a');
    link.href = dataUri;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openOriginal = (dataUri: string) => {
    window.open(dataUri, '_blank');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Gallery Not Found</h1>
          <p className="text-muted-foreground mb-6">
            {error || "The shared gallery you're looking for doesn't exist or may have expired."}
          </p>
          <Button onClick={() => window.location.href = '/'}>
            Go to Main Gallery
          </Button>
        </div>
      </div>
    );
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const isExpiringSoon = gallery.expiresAt && 
    gallery.expiresAt instanceof Date &&
    gallery.expiresAt.getTime() - Date.now() < 24 * 60 * 60 * 1000; // Less than 24 hours

  return (
    <div className="bg-background min-h-screen">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
        <div className="flex items-center gap-2 flex-1">
          <GalleryHorizontal className="h-6 w-6 text-primary" />
          <h1 className="text-xl font-headline font-semibold tracking-tight md:text-2xl">
            {gallery.title}
          </h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Eye className="h-4 w-4" />
          <span>{gallery.accessCount} view{gallery.accessCount !== 1 ? 's' : ''}</span>
        </div>
      </header>

      <main className="p-4 md:p-6">
        {/* Gallery Info */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>Created {gallery.createdAt instanceof Date ? formatDate(gallery.createdAt) : 'Unknown'}</span>
            </div>
            {gallery.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Expires {gallery.expiresAt instanceof Date ? formatDate(gallery.expiresAt) : 'Unknown'}</span>
              </div>
            )}
          </div>

          {isExpiringSoon && (
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-800 dark:text-orange-300">
                This gallery will expire soon. Save any images you need before it becomes unavailable.
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* Image Grid */}
        <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4">
          {gallery.images.map((image, index) => (
            <div key={image.id} className="break-inside-avoid mb-4">
              <Card className="overflow-hidden group">
                <CardContent className="p-0 relative">
                  <Image
                    src={image.dataUri}
                    alt={image.name}
                    width={500}
                    height={500}
                    className="w-full h-auto object-cover"
                  />
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => openOriginal(image.dataUri)}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(image.dataUri, image.name)}
                        className="bg-white/90 hover:bg-white text-black"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{image.name}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {gallery.images.length === 0 && (
          <div className="text-center py-12">
            <GalleryHorizontal className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Images</h3>
            <p className="text-muted-foreground">This gallery doesn't contain any images.</p>
          </div>
        )}
      </main>
    </div>
  );
}
