"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { getShareUrl, copyToClipboard, type SharedGallery } from '@/lib/sharing-client';
import { Share2, Copy, ExternalLink, Trash2, Clock, Eye, RefreshCw, Plus } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { AddImagesToGalleryDialog } from './add-images-to-gallery-dialog';

interface SharedGalleriesManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharedGalleriesManager({ isOpen, onOpenChange }: SharedGalleriesManagerProps) {
  const [galleries, setGalleries] = useState<SharedGallery[]>([]);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);
  const [addImagesGalleryId, setAddImagesGalleryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Safe date conversion utility
  const safeFormatDate = (date: Date | string | undefined, format: 'full' | 'short' = 'full') => {
    if (!date) return 'Unknown';
    
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      if (isNaN(dateObj.getTime())) return 'Invalid Date';
      
      if (format === 'short') {
        return new Intl.DateTimeFormat('en-US', { 
          month: 'short', 
          day: 'numeric' 
        }).format(dateObj);
      }
      
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(dateObj);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'Invalid Date';
    }
  };

  const loadGalleries = useCallback(async () => {
    setLoading(true);
    try {
      // First cleanup expired galleries
      await fetch('/api/shared-galleries/cleanup', { method: 'POST' });
      
      // Then load the galleries
      const response = await fetch('/api/shared-galleries');
      if (response.ok) {
        const galleriesList = await response.json();
        setGalleries(galleriesList);
      } else {
        throw new Error('Failed to fetch galleries');
      }
    } catch (error) {
      console.error('Failed to load galleries:', error);
      toast({
        title: "Error",
        description: "Failed to load shared galleries.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (isOpen) {
      loadGalleries();
    }
  }, [isOpen, loadGalleries]);

  const handleDeleteGallery = async (shareId: string) => {
    try {
      const response = await fetch(`/api/shared-galleries?shareId=${shareId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setGalleries(galleries.filter(g => g.id !== shareId));
        toast({
          title: "Gallery Deleted",
          description: "Shared gallery has been deleted successfully."
        });
      } else {
        throw new Error('Failed to delete gallery');
      }
    } catch (error) {
      console.error('Failed to delete gallery:', error);
      toast({
        title: "Error",
        description: "Failed to delete shared gallery.",
        variant: "destructive"
      });
    }
    setDeleteGalleryId(null);
  };

  const handleCopyUrl = async (shareId: string) => {
    const url = getShareUrl(shareId);
    const success = await copyToClipboard(url);
    
    if (success) {
      toast({
        title: "Link Copied",
        description: "Share link has been copied to your clipboard."
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const openInNewTab = (shareId: string) => {
    const url = getShareUrl(shareId);
    window.open(url, '_blank');
  };

  const formatDate = (date: Date | string) => {
    return safeFormatDate(date, 'full');
  };

  const isExpired = (gallery: SharedGallery) => {
    if (!gallery.expiresAt) return false;
    
    try {
      const expiryDate = gallery.expiresAt instanceof Date ? gallery.expiresAt : new Date(gallery.expiresAt);
      if (isNaN(expiryDate.getTime())) return false;
      return expiryDate < new Date();
    } catch (error) {
      console.error('Date comparison error:', error);
      return false;
    }
  };

  const getTimeUntilExpiry = (expiresAt: Date | string) => {
    try {
      const now = new Date();
      const expiry = expiresAt instanceof Date ? expiresAt : new Date(expiresAt);
      
      if (isNaN(expiry.getTime())) return "Unknown";
      
      const diff = expiry.getTime() - now.getTime();
      
      if (diff < 0) return "Expired";
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h`;
      return "< 1h";
    } catch (error) {
      console.error('Time calculation error:', error);
      return "Unknown";
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className={`${
          isMobile 
            ? "max-w-[95vw] w-full h-[85vh] overflow-hidden p-3" 
            : "max-w-4xl max-h-[80vh] overflow-hidden"
        }`}>
          <DialogHeader className="pb-3">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-xl">
              <Share2 className="h-4 w-4 sm:h-5 sm:w-5" />
              Shared Galleries
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Manage your shared image galleries. View, copy links, or delete shared galleries.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs text-muted-foreground">
              {galleries.length} galleries found
            </div>
            <Button 
              onClick={loadGalleries} 
              variant="outline" 
              size="sm" 
              disabled={loading}
              className="flex items-center gap-1 h-7 px-2 text-xs"
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
              {!isMobile && <span>Refresh</span>}
            </Button>
          </div>

          <div className={`overflow-y-auto space-y-2 ${
            isMobile ? "max-h-[65vh]" : "max-h-[60vh] space-y-3"
          }`}>
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-3 text-muted-foreground" />
                <p className="text-xs sm:text-sm text-muted-foreground">Loading galleries...</p>
              </div>
            ) : galleries.length === 0 ? (
              <div className="text-center py-6">
                <Share2 className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-3 text-muted-foreground" />
                <h3 className="text-sm sm:text-lg font-medium mb-2">No Shared Galleries</h3>
                <p className="text-xs sm:text-sm text-muted-foreground px-2 leading-relaxed">
                  You haven&apos;t created any shared galleries yet. Select some images and use the share feature to get started.
                </p>
              </div>
            ) : (
              galleries.map((gallery) => (
                <Card 
                  key={gallery.id} 
                  className={`${isExpired(gallery) ? 'opacity-60' : ''} ${isMobile ? 'shadow-sm border-border/50' : ''} cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={() => openInNewTab(gallery.id)}
                >
                  <CardHeader className={`${isMobile ? "p-3 pb-2" : "pb-2 sm:pb-3"}`}>
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <CardTitle className={`${
                          isMobile ? "text-sm font-medium leading-tight" : "text-lg"
                        } flex items-start gap-2`}>
                          <span className="truncate">{gallery.title}</span>
                          {isExpired(gallery) && (
                            <Badge variant="destructive" className="text-xs flex-shrink-0 mt-0.5 px-1.5 py-0.5">
                              Expired
                            </Badge>
                          )}
                        </CardTitle>
                        <div className={`flex items-center gap-2 text-xs text-muted-foreground mt-1 ${
                          isMobile ? "flex-wrap" : "sm:gap-4 sm:text-sm"
                        }`}>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {gallery.images.length} images
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {gallery.accessCount} views
                          </span>
                          <span className="text-xs">
                            {isMobile ? 
                              `Created ${safeFormatDate(gallery.createdAt, 'short')}` :
                              `Created ${formatDate(gallery.createdAt)}`
                            }
                          </span>
                        </div>
                      </div>
                      
                      {/* Direct Action Icons */}
                      <div className="flex items-center gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setAddImagesGalleryId(gallery.id);
                          }}
                          title="Add More Images"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCopyUrl(gallery.id);
                          }}
                          title="Copy Share Link"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={(e) => {
                            e.stopPropagation();
                            openInNewTab(gallery.id);
                          }}
                          title="View Gallery"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteGalleryId(gallery.id);
                          }}
                          title="Delete Gallery"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className={`pt-0 ${isMobile ? "p-3 pt-0" : ""}`}>
                    <div className="flex items-center justify-between gap-3">
                      {/* Image thumbnails */}
                      <div className="flex gap-1.5 overflow-x-auto">
                        {gallery.images.slice(0, isMobile ? 3 : 5).map((image, _index) => (
                          <Image
                            key={image.id}
                            src={image.dataUri}
                            alt={image.name}
                            width={isMobile ? 48 : 48}
                            height={isMobile ? 48 : 48}
                            className={`${
                              isMobile ? "w-12 h-12" : "w-12 h-12"
                            } object-cover rounded border flex-shrink-0`}
                          />
                        ))}
                        {gallery.images.length > (isMobile ? 3 : 5) && (
                          <div className={`${
                            isMobile ? "w-12 h-12 text-xs" : "w-12 h-12 text-xs"
                          } bg-muted rounded border flex items-center justify-center text-muted-foreground flex-shrink-0 font-medium`}>
                            +{gallery.images.length - (isMobile ? 3 : 5)}
                          </div>
                        )}
                      </div>
                      {/* Expiration info */}
                      {gallery.expiresAt && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                          <Clock className="h-3 w-3" />
                          {isExpired(gallery) ? (
                            <span className="text-destructive font-medium">Expired</span>
                          ) : (
                            <span className="whitespace-nowrap">Expires in {getTimeUntilExpiry(gallery.expiresAt)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteGalleryId !== null} onOpenChange={() => setDeleteGalleryId(null)}>
        <AlertDialogContent className={isMobile ? "max-w-[90vw] w-full" : ""}>
          <AlertDialogHeader>
            <AlertDialogTitle className={isMobile ? "text-lg" : ""}>Delete Shared Gallery</AlertDialogTitle>
            <AlertDialogDescription className={isMobile ? "text-sm" : ""}>
              Are you sure you want to delete this shared gallery? This action cannot be undone and the share link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
            <AlertDialogCancel className={isMobile ? "w-full" : ""}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGalleryId && handleDeleteGallery(deleteGalleryId)}
              className={`bg-destructive text-destructive-foreground hover:bg-destructive/90 ${
                isMobile ? "w-full" : ""
              }`}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Images Dialog */}
      {addImagesGalleryId && (
        <AddImagesToGalleryDialog
          isOpen={addImagesGalleryId !== null}
          onOpenChange={() => setAddImagesGalleryId(null)}
          galleryId={addImagesGalleryId}
          galleryTitle={galleries.find(g => g.id === addImagesGalleryId)?.title || "Gallery"}
          onImagesAdded={loadGalleries}
        />
      )}
    </>
  );
}
