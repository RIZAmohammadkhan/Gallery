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
import { Share2, Copy, ExternalLink, Trash2, Clock, Eye, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

interface SharedGalleriesManagerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SharedGalleriesManager({ isOpen, onOpenChange }: SharedGalleriesManagerProps) {
  const [galleries, setGalleries] = useState<SharedGallery[]>([]);
  const [deleteGalleryId, setDeleteGalleryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const isExpired = (gallery: SharedGallery) => {
    return gallery.expiresAt && new Date(gallery.expiresAt) < new Date();
  };

  const getTimeUntilExpiry = (expiresAt: Date) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff < 0) return "Expired";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h`;
    return "< 1h";
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Shared Galleries
            </DialogTitle>
            <DialogDescription>
              Manage your shared image galleries. View, copy links, or delete shared galleries.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {galleries.length} galleries found
            </div>
            <Button 
              onClick={loadGalleries} 
              variant="outline" 
              size="sm" 
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="overflow-y-auto max-h-[60vh] space-y-4">
            {loading ? (
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Loading galleries...</p>
              </div>
            ) : galleries.length === 0 ? (
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No Shared Galleries</h3>
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t created any shared galleries yet. Select some images and use the share feature to get started.
                </p>
              </div>
            ) : (
              galleries.map((gallery) => (
                <Card key={gallery.id} className={`${isExpired(gallery) ? 'opacity-60' : ''}`}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {gallery.title}
                          {isExpired(gallery) && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {gallery.images.length} images
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            {gallery.accessCount} views
                          </span>
                          <span>Created {formatDate(gallery.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleCopyUrl(gallery.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <Copy className="h-4 w-4" />
                          Copy
                        </Button>
                        <Button
                          onClick={() => openInNewTab(gallery.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                        >
                          <ExternalLink className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          onClick={() => setDeleteGalleryId(gallery.id)}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2 overflow-x-auto">
                        {gallery.images.slice(0, 5).map((image, _index) => (
                          <Image
                            key={image.id}
                            src={image.dataUri}
                            alt={image.name}
                            width={48}
                            height={48}
                            className="w-12 h-12 object-cover rounded border flex-shrink-0"
                          />
                        ))}
                        {gallery.images.length > 5 && (
                          <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center text-xs text-muted-foreground flex-shrink-0">
                            +{gallery.images.length - 5}
                          </div>
                        )}
                      </div>
                      {gallery.expiresAt && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {isExpired(gallery) ? (
                            <span className="text-destructive">Expired</span>
                          ) : (
                            <span>Expires in {getTimeUntilExpiry(gallery.expiresAt)}</span>
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Shared Gallery</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this shared gallery? This action cannot be undone and the share link will no longer work.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteGalleryId && handleDeleteGallery(deleteGalleryId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
