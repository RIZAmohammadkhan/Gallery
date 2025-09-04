"use client";

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Plus, CheckCircle2, Loader2, FolderOpen, Images, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import type { StoredImage, Folder } from '@/lib/types';

interface AddImagesToGalleryDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  galleryId: string;
  galleryTitle: string;
  onImagesAdded: () => void;
}

// Image card component for consistent styling with your app
function ImageCard({ 
  image, 
  isSelected, 
  onToggle 
}: { 
  image: StoredImage; 
  isSelected: boolean; 
  onToggle: (id: string) => void;
}) {
  return (
    <div 
      className="break-inside-avoid mb-2 sm:mb-4 relative cursor-pointer"
      onClick={() => onToggle(image.id)}
    >
      <Card
        className={cn(
          "overflow-hidden group transition-all duration-300 hover:shadow-xl hover:shadow-primary/20 border-2",
          isSelected ? "border-primary" : "border-transparent"
        )}
      >
        <CardContent className="p-0 relative">
          <Image
            src={image.dataUri}
            alt={image.name}
            width={image.width || 300}
            height={image.height || 300}
            className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {isSelected && (
            <div className="absolute inset-0 bg-primary/40 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
            </div>
          )}
          {image.isDefective && (
            <Badge variant="destructive" className="absolute top-2 left-2 text-xs flex items-center gap-1">
              <Trash2 className="h-3 w-3" />
              Trash
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
            <p className="text-white text-xs font-medium truncate">{image.name}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function AddImagesToGalleryDialog({ 
  isOpen, 
  onOpenChange, 
  galleryId, 
  galleryTitle,
  onImagesAdded 
}: AddImagesToGalleryDialogProps) {
  const [images, setImages] = useState<StoredImage[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string>("all");
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setSelectedImageIds(new Set());
      setSelectedFolderId("all");
      loadImagesAndFolders();
    }
  }, [isOpen]);

  const loadImagesAndFolders = async () => {
    setLoading(true);
    try {
      const [imagesResponse, foldersResponse] = await Promise.all([
        fetch('/api/images'),
        fetch('/api/folders')
      ]);

      if (imagesResponse.ok && foldersResponse.ok) {
        const [imagesData, foldersData] = await Promise.all([
          imagesResponse.json(),
          foldersResponse.json()
        ]);
        setImages(imagesData);
        setFolders(foldersData);
      } else {
        throw new Error('Failed to load data');
      }
    } catch (error) {
      console.error('Failed to load images and folders:', error);
      toast({
        title: "Error",
        description: "Failed to load your images.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleImageSelection = (imageId: string) => {
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

  const handleSubmit = async () => {
    if (selectedImageIds.size === 0) {
      toast({
        title: "No Images Selected",
        description: "Please select at least one image to add.",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/share/${galleryId}/add-images`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageIds: Array.from(selectedImageIds) })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Images Added",
          description: result.message || `Successfully added ${selectedImageIds.size} image(s) to "${galleryTitle}".`
        });
        setSelectedImageIds(new Set());
        onImagesAdded();
        onOpenChange(false);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add images');
      }
    } catch (error) {
      console.error('Failed to add images:', error);
      toast({
        title: "Failed to Add Images",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter images based on selected folder
  const filteredImages = useMemo(() => {
    if (selectedFolderId === "all") {
      // Exclude defective/trash images from "All Images"
      return images.filter(img => !img.isDefective);
    } else if (selectedFolderId === "trash") {
      // Show only defective/trash images
      return images.filter(img => img.isDefective);
    } else if (selectedFolderId === "no-folder") {
      // Show non-defective images without folder
      return images.filter(img => !img.folderId && !img.isDefective);
    } else {
      // Show non-defective images in specific folder
      return images.filter(img => img.folderId === selectedFolderId && !img.isDefective);
    }
  }, [images, selectedFolderId]);

  // Select/deselect all in current view
  const handleSelectAll = () => {
    if (selectedImageIds.size === filteredImages.length && filteredImages.length > 0) {
      // Deselect all
      setSelectedImageIds(new Set());
    } else {
      // Select all in current view
      setSelectedImageIds(new Set(filteredImages.map(img => img.id)));
    }
  };

  const allSelected = filteredImages.length > 0 && selectedImageIds.size === filteredImages.length;
  const someSelected = selectedImageIds.size > 0 && selectedImageIds.size < filteredImages.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={cn(
        "overflow-hidden",
        isMobile 
          ? "max-w-[95vw] w-full h-[90vh] p-4" 
          : "max-w-5xl max-h-[85vh]"
      )}>
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Plus className="h-5 w-5" />
            Add Images to "{galleryTitle}"
          </DialogTitle>
          <DialogDescription className="text-sm">
            Choose a folder and select images to add to your shared gallery.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-3">Loading your images...</span>
          </div>
        ) : (
          <div className="flex flex-col h-full min-h-0">
            {/* Folder Selection and Bulk Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pb-4 border-b">
              <div className="flex items-center gap-2 flex-1">
                <FolderOpen className="h-4 w-4 text-muted-foreground" />
                <Select value={selectedFolderId} onValueChange={setSelectedFolderId}>
                  <SelectTrigger className="w-full sm:w-64">
                    <SelectValue placeholder="Select folder..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      All Images ({images.filter(img => !img.isDefective).length})
                    </SelectItem>
                    <SelectItem value="no-folder">
                      No Folder ({images.filter(img => !img.folderId && !img.isDefective).length})
                    </SelectItem>
                    {folders.map(folder => (
                      <SelectItem key={folder.id} value={folder.id}>
                        {folder.name} ({images.filter(img => img.folderId === folder.id && !img.isDefective).length})
                      </SelectItem>
                    ))}
                    <SelectItem value="trash">
                      Trash ({images.filter(img => img.isDefective).length})
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {filteredImages.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSelectAll}
                  className="w-full sm:w-auto"
                >
                  {allSelected ? "Deselect All" : someSelected ? `Select All (${filteredImages.length - selectedImageIds.size} more)` : `Select All (${filteredImages.length})`}
                </Button>
              )}
            </div>

            {/* Images Grid */}
            <div className="flex-1 min-h-0 pt-4">
              <ScrollArea className="h-full">
                {filteredImages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Images className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Images Found</h3>
                    <p className="text-muted-foreground">
                      {selectedFolderId === "all" 
                        ? "You don't have any non-trash images yet." 
                        : selectedFolderId === "trash"
                        ? "No images in trash."
                        : selectedFolderId === "no-folder"
                        ? "No images without folders (excluding trash)."
                        : `No images in ${folders.find(f => f.id === selectedFolderId)?.name || 'this folder'} (excluding trash).`
                      }
                    </p>
                  </div>
                ) : (
                  <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-2 sm:gap-4">
                    {filteredImages.map((image) => (
                      <ImageCard
                        key={image.id}
                        image={image}
                        isSelected={selectedImageIds.has(image.id)}
                        onToggle={toggleImageSelection}
                      />
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}

        <DialogFooter className="pt-4 border-t">
          <div className="flex items-center justify-between w-full">
            <span className="text-sm text-muted-foreground">
              {selectedImageIds.size} of {filteredImages.length} images selected
            </span>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                disabled={selectedImageIds.size === 0 || submitting}
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add {selectedImageIds.size > 0 ? selectedImageIds.size : ''} Image{selectedImageIds.size !== 1 ? 's' : ''}
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
