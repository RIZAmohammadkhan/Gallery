// Shared gallery page for displaying persistent shared galleries

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { BulkExportDialog } from '@/components/bulk-export-dialog';
import { BulkDeleteDialog } from '@/components/bulk-delete-dialog';
import { AddImagesToGalleryDialog } from '@/components/add-images-to-gallery-dialog';
import SharedImageDetail from '@/components/shared-image-detail';
import { cn } from '@/lib/utils';
import { GalleryHorizontal, Download, ExternalLink, Clock, Eye, AlertCircle, MousePointer2, CheckSquare2, DownloadIcon, MoreVertical, ChevronLeft, ChevronRight, X, Trash2, Edit3, CheckCircle2, Plus, ArrowLeft } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SharedGallery } from '@/lib/sharing-client';
import { exportImagesAsZip } from '@/lib/bulk-operations';
import type { StoredImage } from '@/lib/types';

export default function SharedGalleryPage() {
  const params = useParams();
  const router = useRouter();
  const shareId = params?.shareId as string;
  const { data: session } = useSession();
  const [gallery, setGallery] = useState<SharedGallery | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Gallery preview state
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  
  // Selection mode state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  
  // Export and delete state
  const [isBulkExportDialogOpen, setIsBulkExportDialogOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isAddImagesDialogOpen, setIsAddImagesDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExportComplete, setIsExportComplete] = useState(false);
  
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const loadGallery = useCallback(async () => {
    if (!shareId) {
      setError("Invalid share link");
      setLoading(false);
      return;
    }

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
  }, [shareId]);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

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

  const handleBackButton = () => {
    if (session) {
      // User is logged in, go to main gallery
      router.push('/');
    } else {
      // User is not logged in, go to login page
      router.push('/auth/signin');
    }
  };

  // Selection handlers
  const handleImageSelection = (imageId: string) => {
    setSelectedImageIds(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(imageId)) {
        newSelection.delete(imageId);
      } else {
        newSelection.add(imageId);
      }
      return newSelection;
    });
  };

  const handleSelectAll = () => {
    if (gallery?.images) {
      setSelectedImageIds(new Set(gallery.images.map(img => img.id)));
    }
  };

  const handleUnselectAll = () => {
    setSelectedImageIds(new Set());
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (selectionMode) {
      setSelectedImageIds(new Set());
    }
  };

  // Gallery navigation handlers
  const handleImageClick = (imageId: string, index: number) => {
    if (selectionMode) {
      handleImageSelection(imageId);
    } else {
      setSelectedImageId(imageId);
      setSelectedImageIndex(index);
    }
  };

  const handleNavigateToImage = (imageId: string) => {
    if (gallery?.images) {
      const index = gallery.images.findIndex(img => img.id === imageId);
      if (index !== -1) {
        setSelectedImageId(imageId);
        setSelectedImageIndex(index);
      }
    }
  };

  const handleCloseDetailView = () => {
    setSelectedImageId(null);
    setSelectedImageIndex(null);
  };

  // Bulk export handler
  const handleBulkExport = useCallback(async () => {
    if (selectedImageIds.size === 0 || !gallery) return;
    
    const selectedImages = gallery.images.filter(img => selectedImageIds.has(img.id));
    
    // Convert to StoredImage format for the export function
    const storedImages: StoredImage[] = selectedImages.map(img => ({
      id: img.id,
      name: img.name,
      dataUri: img.dataUri,
      metadata: '',
      tags: [],
      isDefective: false,
      folderId: null
    }));
    
    setIsBulkExportDialogOpen(true);
    setExportProgress(0);
    setIsExportComplete(false);
    
    try {
      await exportImagesAsZip(storedImages, (progress) => {
        setExportProgress(progress);
      });
      
      setIsExportComplete(true);
      toast({ 
        title: "Export Complete", 
        description: `Successfully exported ${selectedImages.length} ${selectedImages.length === 1 ? 'image' : 'images'}.` 
      });
      
      setSelectionMode(false);
      setSelectedImageIds(new Set());
    } catch (error) {
      console.error('Export failed:', error);
      toast({ 
        title: "Export Failed", 
        description: "There was an error exporting the images. Please try again.", 
        variant: "destructive" 
      });
      setIsBulkExportDialogOpen(false);
    }
  }, [selectedImageIds, gallery, toast]);

  // Bulk delete handler (owner only)
  const handleBulkDelete = useCallback(async () => {
    if (selectedImageIds.size === 0 || !gallery || !gallery.isOwner) return;
    
    setIsBulkDeleteDialogOpen(true);
  }, [selectedImageIds, gallery]);

  const confirmBulkDelete = useCallback(async () => {
    if (!gallery || !gallery.isOwner || selectedImageIds.size === 0) return;

    try {
      const idsToDelete = Array.from(selectedImageIds);
      const response = await fetch(`/api/images/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: idsToDelete })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the gallery by removing deleted images
        const updatedGallery = {
          ...gallery,
          images: gallery.images.filter(img => !selectedImageIds.has(img.id))
        };
        setGallery(updatedGallery);
        setSelectedImageIds(new Set());
        setSelectionMode(false);
        setIsBulkDeleteDialogOpen(false);
        
        toast({
          title: "Images Deleted",
          description: result.message || `Successfully deleted ${idsToDelete.length} image(s) from your gallery.`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the images. Please try again.",
        variant: "destructive"
      });
    }
  }, [gallery, selectedImageIds, toast]);

  // Individual image delete handler (owner only)
  const handleIndividualDelete = useCallback(async (imageId: string, imageName: string) => {
    if (!gallery || !gallery.isOwner) return;

    try {
      const response = await fetch(`/api/images/bulk-delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: [imageId] })
      });

      if (response.ok) {
        const result = await response.json();
        
        // Update the gallery by removing the deleted image
        const updatedGallery = {
          ...gallery,
          images: gallery.images.filter(img => img.id !== imageId)
        };
        setGallery(updatedGallery);
        
        // Close detail view if the deleted image was currently being viewed
        if (selectedImageId === imageId) {
          handleCloseDetailView();
        }
        
        toast({
          title: "Image Deleted",
          description: `Successfully deleted "${imageName}" from your gallery.`
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Delete failed');
      }
    } catch (error) {
      console.error('Individual delete failed:', error);
      toast({
        title: "Delete Failed",
        description: "There was an error deleting the image. Please try again.",
        variant: "destructive"
      });
    }
  }, [gallery, toast]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Gallery navigation shortcuts - handled by SharedImageDetail component
      if (selectedImageId !== null) {
        // Let SharedImageDetail handle navigation
        return;
      }

      // Ctrl/Cmd + A - Select all
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        if (selectionMode) {
          const allSelected = gallery?.images && selectedImageIds.size === gallery.images.length;
          if (allSelected) {
            handleUnselectAll();
          } else {
            handleSelectAll();
          }
        }
        return;
      }

      // Only handle these shortcuts in selection mode
      if (!selectionMode || selectedImageIds.size === 0) return;

      // Ctrl/Cmd + E - Bulk export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        handleBulkExport();
        return;
      }

      // Delete or Backspace - Bulk delete (owner only)
      if (gallery?.isOwner && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        handleBulkDelete();
        return;
      }

      // Escape - Exit selection mode
      if (event.key === 'Escape') {
        event.preventDefault();
        setSelectionMode(false);
        setSelectedImageIds(new Set());
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImageId, selectionMode, selectedImageIds, gallery, handleBulkExport, handleBulkDelete, handleIndividualDelete]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-4">
          <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm sm:text-base text-muted-foreground">Loading gallery...</p>
        </div>
      </div>
    );
  }

  if (error || !gallery) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 sm:h-16 sm:w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-xl sm:text-2xl font-bold mb-4">Gallery Not Found</h1>
          <p className="text-sm sm:text-base text-muted-foreground mb-6">
            {error || "The shared gallery you're looking for doesn't exist or may have expired."}
          </p>
          <Button onClick={() => window.location.href = '/'} className="w-full sm:w-auto">
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
      <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b bg-background/80 backdrop-blur-sm px-2 sm:px-4 md:px-6">
        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackButton}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="hidden sm:inline">
            {session ? 'Home' : 'Sign In'}
          </span>
        </Button>
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <GalleryHorizontal className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl md:text-2xl font-headline font-semibold tracking-tight truncate">
              {gallery.title}
            </h1>
            {gallery.isOwner && (
              <p className="text-xs sm:text-sm text-muted-foreground">
                Your shared gallery
              </p>
            )}
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMobile && gallery && gallery.images.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleSelectionMode}>
                <CheckSquare2 className="mr-2 h-4 w-4" />
                {selectionMode ? 'Exit Selection' : 'Select Images'}
              </DropdownMenuItem>
              {selectionMode && gallery.images.length > 0 && (
                <DropdownMenuItem 
                  onClick={selectedImageIds.size === gallery.images.length ? handleUnselectAll : handleSelectAll}
                >
                  <CheckSquare2 className="mr-2 h-4 w-4" />
                  {selectedImageIds.size === gallery.images.length ? 'Unselect All' : 'Select All'}
                </DropdownMenuItem>
              )}
              {selectionMode && selectedImageIds.size > 0 && (
                <>
                  <DropdownMenuItem onClick={handleBulkExport}>
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export ({selectedImageIds.size})
                  </DropdownMenuItem>
                  {gallery.isOwner && (
                    <DropdownMenuItem onClick={handleBulkDelete}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete ({selectedImageIds.size})
                    </DropdownMenuItem>
                  )}
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        
        {/* Desktop Controls */}
        {!isMobile && gallery && gallery.images.length > 0 && (
          <div className="flex items-center gap-2">
            {selectionMode && (
              <>
                <span className="text-sm text-muted-foreground">
                  {selectedImageIds.size} selected
                </span>
                {selectedImageIds.size > 0 && (
                  <>
                    <Button
                      size="sm"
                      onClick={handleBulkExport}
                      className="gap-2"
                    >
                      <DownloadIcon className="h-4 w-4" />
                      Export ({selectedImageIds.size})
                    </Button>
                    {gallery.isOwner && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={handleBulkDelete}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete ({selectedImageIds.size})
                      </Button>
                    )}
                  </>
                )}
                {gallery.images.length > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={selectedImageIds.size === gallery.images.length ? handleUnselectAll : handleSelectAll}
                  >
                    {selectedImageIds.size === gallery.images.length ? 'Unselect All' : 'Select All'}
                  </Button>
                )}
              </>
            )}
            {gallery.isOwner && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsAddImagesDialogOpen(true)}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Images
              </Button>
            )}
            <Button
              size="sm"
              variant={selectionMode ? "default" : "outline"}
              onClick={toggleSelectionMode}
              className="gap-2"
            >
              {selectionMode ? (
                <>
                  <MousePointer2 className="h-4 w-4" />
                  Exit Selection
                </>
              ) : (
                <>
                  <CheckSquare2 className="h-4 w-4" />
                  Select
                </>
              )}
            </Button>
          </div>
        )}
        
        <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-muted-foreground flex-shrink-0">
          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{gallery.accessCount} view{gallery.accessCount !== 1 ? 's' : ''}</span>
          <span className="sm:hidden">{gallery.accessCount}</span>
        </div>
      </header>

      <main className="p-2 sm:p-4 md:p-6">
        {/* Gallery Info */}
        <div className="mb-4 sm:mb-6 space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
              <span>Created {gallery.createdAt instanceof Date ? formatDate(gallery.createdAt) : 'Unknown'}</span>
            </div>
            {gallery.expiresAt && (
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Expires {gallery.expiresAt instanceof Date ? formatDate(gallery.expiresAt) : 'Unknown'}</span>
              </div>
            )}
          </div>

          {isExpiringSoon && (
            <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
              <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-xs sm:text-sm text-orange-800 dark:text-orange-300">
                This gallery will expire soon. Save any images you need before it becomes unavailable.
              </AlertDescription>
            </Alert>
          )}

          {/* Mobile Selection Info */}
          {isMobile && selectionMode && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <span className="text-sm font-medium">
                {selectedImageIds.size} of {gallery.images.length} selected
              </span>
              {selectedImageIds.size > 0 && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleBulkExport} className="gap-2">
                    <DownloadIcon className="h-4 w-4" />
                    Export
                  </Button>
                  {gallery.isOwner && (
                    <Button size="sm" variant="destructive" onClick={handleBulkDelete} className="gap-2">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Image Grid */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-4">
          {gallery.images.map((image, index) => (
            <div key={image.id} className="break-inside-avoid mb-2 sm:mb-4">
              <Card 
                className={`overflow-hidden cursor-pointer group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 border-2 ${
                  selectionMode && selectedImageIds.has(image.id) 
                    ? 'border-primary' 
                    : 'border-transparent'
                }`}
                onClick={() => handleImageClick(image.id, index)}
              >
                <CardContent className="p-0 relative overflow-hidden">
                  <div className="relative transition-transform duration-300 group-hover:scale-105">
                    <Image
                      src={image.dataUri}
                      alt={image.name}
                      width={500}
                      height={500}
                      className="w-full h-auto object-cover"
                    />
                    {selectionMode && (
                      <div className={cn(
                        "absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white p-2 text-center",
                        !selectedImageIds.has(image.id) && "bg-black/40",
                        selectedImageIds.has(image.id) && "bg-primary/40",
                      )}>
                        {selectedImageIds.has(image.id) && (
                          <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
                <div className="p-2 sm:p-3">
                  <p className="text-xs sm:text-sm font-medium truncate">{image.name}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {gallery.images.length === 0 && (
          <div className="text-center py-8 sm:py-12">
            <GalleryHorizontal className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-medium mb-2">No Images</h3>
            <p className="text-sm sm:text-base text-muted-foreground">This gallery doesn&apos;t contain any images.</p>
          </div>
        )}
      </main>
      
      {/* Shared Image Detail Dialog */}
      {selectedImageId && gallery?.images && (
        <SharedImageDetail
          image={gallery.images.find(img => img.id === selectedImageId)!}
          allImages={gallery.images}
          onOpenChange={handleCloseDetailView}
          onNavigateToImage={handleNavigateToImage}
          onDeleteImage={gallery.isOwner ? (imageId: string) => {
            const image = gallery.images.find(img => img.id === imageId);
            if (image) {
              handleIndividualDelete(imageId, image.name);
            }
          } : undefined}
          isOwner={gallery.isOwner}
        />
      )}
      
      {/* Bulk Export Dialog */}
      <BulkExportDialog
        isOpen={isBulkExportDialogOpen}
        onOpenChange={setIsBulkExportDialogOpen}
        progress={exportProgress}
        isComplete={isExportComplete}
        imageCount={selectedImageIds.size}
      />

      {/* Bulk Delete Dialog (Owner Only) */}
      {gallery?.isOwner && (
        <BulkDeleteDialog
          isOpen={isBulkDeleteDialogOpen}
          onOpenChange={setIsBulkDeleteDialogOpen}
          imageCount={selectedImageIds.size}
          onConfirm={confirmBulkDelete}
        />
      )}

      {/* Add Images Dialog (Owner Only) */}
      {gallery?.isOwner && (
        <AddImagesToGalleryDialog
          isOpen={isAddImagesDialogOpen}
          onOpenChange={setIsAddImagesDialogOpen}
          galleryId={shareId}
          galleryTitle={gallery.title}
          onImagesAdded={loadGallery}
        />
      )}
    </div>
  );
}
