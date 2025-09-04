"use client";

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Share2, Copy, ExternalLink, Clock, Info } from 'lucide-react';
import { copyToClipboard, getShareUrl } from '@/lib/sharing-client';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedImages: Array<{ 
    id: string; 
    name: string; 
    dataUri: string; 
    metadata?: string;
    tags?: string[];
    isDefective?: boolean;
    defectType?: string;
  }>;
  selectedImageCount: number;
}

export function ShareDialog({ isOpen, onOpenChange, selectedImages, selectedImageCount }: ShareDialogProps) {
  const [title, setTitle] = useState("My Shared Gallery");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState("7");
  const [shareUrl, setShareUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (copySuccess) {
      const timer = setTimeout(() => setCopySuccess(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copySuccess]);

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setShareUrl("");
      setTitle("My Shared Gallery");
      setHasExpiration(false);
      setExpirationDays("7");
      setCopySuccess(false);
    }
  }, [isOpen]);

  const handleShareClick = async () => {
    if (!title.trim()) return;
    
    setIsGenerating(true);
    try {
      const expiration = hasExpiration ? parseInt(expirationDays) : undefined;
      
      // Call the API to create shared gallery
      const response = await fetch('/api/shared-galleries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          images: selectedImages,
          expirationDays: expiration
        }),
      });

      if (response.ok) {
        const { shareId } = await response.json();
        const url = getShareUrl(shareId);
        setShareUrl(url);
        
        toast({
          title: "Shared Gallery Created",
          description: "Your gallery has been created successfully!"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create shared gallery.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating shared gallery:', error);
      toast({
        title: "Error",
        description: "An error occurred while creating the shared gallery.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!shareUrl) return;
    
    const success = await copyToClipboard(shareUrl);
    if (success) {
      setCopySuccess(true);
    }
  };

  const openInNewTab = () => {
    if (shareUrl) {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`${isMobile ? "max-w-[95vw] w-full" : "sm:max-w-[500px]"}`}>
        <DialogHeader>
          <DialogTitle className={isMobile ? "text-lg" : ""}>Share Images</DialogTitle>
          <DialogDescription className={isMobile ? "text-sm" : ""}>
            Create a shareable link for the {selectedImageCount} selected image{selectedImageCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 sm:gap-6 py-4">
          {/* Title Input */}
          <div className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-4 gap-4"} items-center`}>
            <Label htmlFor="title" className={isMobile ? "" : "text-right"}>
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={isMobile ? "" : "col-span-3"}
              placeholder="Enter gallery title"
            />
          </div>

          {/* Expiration Settings */}
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="expiration"
                checked={hasExpiration}
                onCheckedChange={setHasExpiration}
              />
              <Label htmlFor="expiration" className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4" />
                Set expiration date
              </Label>
            </div>
            
            {hasExpiration && (
              <div className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-4 gap-4"} items-center ${isMobile ? "" : "pl-6"}`}>
                <Label htmlFor="expiration-days" className={`text-sm ${isMobile ? "" : "text-right"}`}>
                  Expires in
                </Label>
                <Select value={expirationDays} onValueChange={setExpirationDays}>
                  <SelectTrigger className={isMobile ? "" : "col-span-3"}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">1 week</SelectItem>
                    <SelectItem value="30">1 month</SelectItem>
                    <SelectItem value="90">3 months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Generated URL Display */}
          {shareUrl && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Shareable Link</Label>
              <div className={`flex gap-2 ${isMobile ? "flex-col" : ""}`}>
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-xs sm:text-sm flex-1"
                />
                <div className={`flex gap-2 ${isMobile ? "w-full" : "shrink-0"}`}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyUrl}
                    className={`${isMobile ? "flex-1" : "shrink-0"}`}
                  >
                    <Copy className="h-4 w-4" />
                    {isMobile && <span className="ml-2">Copy</span>}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={openInNewTab}
                    className={`${isMobile ? "flex-1" : "shrink-0"}`}
                  >
                    <ExternalLink className="h-4 w-4" />
                    {isMobile && <span className="ml-2">Open</span>}
                  </Button>
                </div>
              </div>
              
              {copySuccess && (
                <Alert className="py-2">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Link copied to clipboard!
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Info Alert */}
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs sm:text-sm">
              Anyone with this link can view the selected images. 
              {hasExpiration && ` The link will expire in ${expirationDays} day${parseInt(expirationDays) !== 1 ? 's' : ''}.`}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className={isMobile ? "flex-col gap-2" : ""}>
          {shareUrl ? (
            <Button
              onClick={() => onOpenChange(false)}
              className="w-full"
            >
              Done
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className={isMobile ? "w-full" : ""}
              >
                Cancel
              </Button>
              <Button
                onClick={handleShareClick}
                disabled={selectedImageCount === 0 || !title.trim() || isGenerating}
                className={isMobile ? "w-full" : ""}
              >
                {isGenerating ? (
                  <>Generating...</>
                ) : (
                  <>
                    <Share2 className="mr-2 h-4 w-4" />
                    Generate Link
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
