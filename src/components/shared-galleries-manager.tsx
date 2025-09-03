"use client";

import { useState, useEffect } from 'react';
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
import { listSharedGalleries, deleteSharedGallery, getShareUrl, copyToClipboard, cleanupExpiredGalleries, type SharedGallery } from '@/lib/sharing';
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

  const loadGalleries = () => {
    setLoading(true);
    try {
      // Clean up expired galleries first
      const cleanedCount = cleanupExpiredGalleries();
      if (cleanedCount > 0) {
        toast({
          title: "Cleanup Complete",
          description: `Removed ${cleanedCount} expired galleries.`
        });
      }
      
      const galleriesList = listSharedGalleries();
      setGalleries(galleriesList);
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
  };

  useEffect(() => {
    if (isOpen) {
      loadGalleries();
    }
  }, [isOpen]);

  const handleCopyLink = async (shareId: string) => {
    const shareUrl = getShareUrl(shareId);
    const success = await copyToClipboard(shareUrl);
    
    if (success) {
      toast({
        title: "Link Copied",
        description: "Share link copied to clipboard."
      });
    } else {
      toast({
        title: "Copy Failed",
        description: "Failed to copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const handleOpenGallery = (shareId: string) => {
    const shareUrl = getShareUrl(shareId);
    window.open(shareUrl, '_blank');
  };

  const handleDeleteGallery = (galleryId: string) => {
    const success = deleteSharedGallery(galleryId);
    
    if (success) {
      setGalleries(prev => prev.filter(g => g.id !== galleryId));
      toast({
        title: "Gallery Deleted",
        description: "Shared gallery has been deleted."
      });
    } else {
      toast({
        title: "Delete Failed",
        description: "Failed to delete the gallery.",
        variant: "destructive"
      });
    }
    
    setDeleteGalleryId(null);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getExpirationStatus = (gallery: SharedGallery) => {
    if (!gallery.expiresAt) {
      return { text: 'Never expires', variant: 'secondary' as const };
    }
    
    const now = new Date();
    const timeLeft = gallery.expiresAt.getTime() - now.getTime();
    const hoursLeft = timeLeft / (1000 * 60 * 60);
    
    if (timeLeft <= 0) {
      return { text: 'Expired', variant: 'destructive' as const };
    } else if (hoursLeft < 24) {
      return { text: `${Math.ceil(hoursLeft)}h left`, variant: 'destructive' as const };
    } else if (hoursLeft < 72) {
      return { text: `${Math.ceil(hoursLeft / 24)}d left`, variant: 'outline' as const };
    } else {
      return { text: `Expires ${formatDate(gallery.expiresAt)}`, variant: 'secondary' as const };
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle>Shared Galleries</DialogTitle>
                <DialogDescription>
                  Manage your shared gallery links
                </DialogDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadGalleries}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-y-auto pr-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : galleries.length === 0 ? (
              <div className="text-center py-8">
                <Share2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Shared Galleries</h3>
                <p className="text-muted-foreground">
                  Create your first shared gallery by selecting images and clicking the share button.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {galleries.map((gallery) => {
                  const expirationStatus = getExpirationStatus(gallery);
                  
                  return (
                    <Card key={gallery.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-lg truncate">{gallery.title}</CardTitle>
                            <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>Created {formatDate(gallery.createdAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                <span>{gallery.accessCount} view{gallery.accessCount !== 1 ? 's' : ''}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <span>{gallery.images.length} image{gallery.images.length !== 1 ? 's' : ''}</span>
                              </div>
                            </div>
                          </div>
                          <Badge variant={expirationStatus.variant}>
                            {expirationStatus.text}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex justify-between items-center">
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopyLink(gallery.id)}
                            >
                              <Copy className="h-4 w-4 mr-1" />
                              Copy Link
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleOpenGallery(gallery.id)}
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Open
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteGalleryId(gallery.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteGalleryId} onOpenChange={() => setDeleteGalleryId(null)}>
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
