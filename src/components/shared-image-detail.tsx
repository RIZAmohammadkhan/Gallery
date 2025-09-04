"use client";

import { useState, useEffect } from 'react';
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Trash2, Download, ChevronLeft, ChevronRight, Edit3, ExternalLink } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

interface SharedImageDetailProps {
  image: {
    id: string;
    name: string;
    dataUri: string;
    metadata?: string;
    tags?: string[];
    isDefective?: boolean;
    defectType?: string;
  };
  onOpenChange: (open: boolean) => void;
  onDeleteImage?: (imageId: string) => void;
  onEditImage?: (imageId: string, prompt: string) => Promise<void>;
  loadingState?: string | boolean;
  allImages?: Array<{
    id: string;
    name: string;
    dataUri: string;
    metadata?: string;
    tags?: string[];
    isDefective?: boolean;
    defectType?: string;
  }>;
  onNavigateToImage?: (imageId: string) => void;
  isOwner?: boolean;
}

export default function SharedImageDetail({
  image,
  onOpenChange,
  onDeleteImage,
  onEditImage,
  loadingState,
  allImages,
  onNavigateToImage,
  isOwner = false
}: SharedImageDetailProps) {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Navigation logic
  const currentIndex = allImages ? allImages.findIndex(img => img.id === image.id) : -1;
  const canNavigate = allImages && allImages.length > 1 && currentIndex !== -1;
  
  const handlePrevious = () => {
    if (canNavigate && onNavigateToImage) {
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : allImages.length - 1;
      onNavigateToImage(allImages[prevIndex].id);
    }
  };
  
  const handleNext = () => {
    if (canNavigate && onNavigateToImage) {
      const nextIndex = currentIndex < allImages.length - 1 ? currentIndex + 1 : 0;
      onNavigateToImage(allImages[nextIndex].id);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrevious();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'Escape') {
        event.preventDefault();
        onOpenChange(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [canNavigate, currentIndex, allImages, onNavigateToImage, onOpenChange]);

  const handleEdit = async () => {
    if (!editPrompt.trim() || !onEditImage) return;
    await onEditImage(image.id, editPrompt);
    setIsEditDialogOpen(false);
    setEditPrompt('');
  }
  
  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = image.dataUri;
    link.download = image.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenOriginal = () => {
    window.open(image.dataUri, '_blank');
  };

  const isLoading = !!loadingState;

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className={`${
        isMobile 
          ? "max-w-[95vw] w-full h-[95vh] flex flex-col p-0 gap-0" 
          : "max-w-4xl w-full h-[90vh] flex flex-col md:flex-row p-0 gap-0"
      }`}>
        <div className={`relative ${
          isMobile 
            ? "w-full h-[60vh] bg-black/50" 
            : "w-full md:w-2/3 h-1/2 md:h-full bg-black/50"
        }`}>
          {/* Navigation arrows */}
          {canNavigate && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePrevious}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white"
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            </>
          )}
          
          <Image
            src={image.dataUri}
            alt={image.name}
            fill
            className="object-contain"
          />
           {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-foreground p-2 text-center">
              <Loader2 className="animate-spin h-6 w-6 sm:h-8 sm:w-8 mb-2" />
              <span className="text-xs sm:text-sm font-medium">{typeof loadingState === 'string' ? loadingState : 'Processing...'}</span>
            </div>
          )}
        </div>
        <div className={`${
          isMobile 
            ? "w-full h-[35vh] flex flex-col p-4 overflow-y-auto" 
            : "w-full md:w-1/3 h-1/2 md:h-full flex flex-col p-6 overflow-y-auto"
        }`}>
          <DialogHeader className="text-left mb-4">
            <DialogTitle className={`${
              isMobile ? "text-lg" : "text-2xl"
            } font-headline tracking-tight mb-2`}>{image.name}</DialogTitle>
            <DialogDescription className="text-sm space-y-1">
              {canNavigate && (
                <div className="text-xs text-muted-foreground">
                  {currentIndex + 1} of {allImages.length}
                </div>
              )}
              {image.metadata && (
                <div className="text-sm text-muted-foreground">{image.metadata}</div>
              )}
            </DialogDescription>
             {image.isDefective && image.defectType && (
               <Badge variant="destructive" className="w-fit my-2">{image.defectType}</Badge>
             )}
          </DialogHeader>
          
          {image.tags && image.tags.length > 0 && (
            <div className="my-4">
                <h3 className="font-semibold mb-2 text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {image.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </div>
          )}

          <div className="mt-auto space-y-4 pt-4">
             <TooltipProvider>
              <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={handleDownload} disabled={isLoading}>
                          <Download className="h-4 w-4 mr-2" />
                          Download
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download Image</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={handleOpenOriginal} disabled={isLoading}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open
                      </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open in New Tab</TooltipContent>
                </Tooltip>
              </div>

              {/* Owner-only actions */}
              {isOwner && onEditImage && (
                <div className={`flex gap-2 ${isMobile ? 'flex-col' : ''}`}>
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                  <Button className="w-full" variant="outline" disabled={isLoading}>
                                      <Sparkles className="h-4 w-4 mr-2" />
                                      Edit with AI
                                  </Button>
                              </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Edit with AI</TooltipContent>
                      </Tooltip>
                      <DialogContent className={isMobile ? "max-w-[95vw] w-full" : ""}>
                          <DialogHeader>
                              <DialogTitle>Edit Image with AI</DialogTitle>
                              <DialogDescription>Describe the changes you want to make to the image.</DialogDescription>
                          </DialogHeader>
                          <Textarea 
                              placeholder="e.g. make the sky purple, add a cat on the bench..." 
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              rows={3}
                              className="text-sm"
                          />
                          <DialogFooter>
                              <Button onClick={handleEdit} disabled={isLoading} className="w-full sm:w-auto">
                                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                  Generate
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                </div>
              )}

              {isOwner && onDeleteImage && (
                <div className="flex gap-2 w-full">
                   <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="destructive" className="w-full" onClick={() => onDeleteImage(image.id)} disabled={isLoading}>
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Image</TooltipContent>
                    </Tooltip>
                </div>
              )}
            </TooltipProvider>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
