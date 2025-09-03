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
import { copyToClipboard, getShareUrl } from '@/lib/sharing';

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (title: string, expirationDays?: number) => string; // Returns the share URL
  selectedImageCount: number;
}

export function ShareDialog({ isOpen, onOpenChange, onShare, selectedImageCount }: ShareDialogProps) {
  const [title, setTitle] = useState("My Shared Gallery");
  const [hasExpiration, setHasExpiration] = useState(false);
  const [expirationDays, setExpirationDays] = useState("7");
  const [shareUrl, setShareUrl] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

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
      const url = onShare(title.trim(), expiration);
      setShareUrl(url);
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Images</DialogTitle>
          <DialogDescription>
            Create a shareable link for the {selectedImageCount} selected image{selectedImageCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          {/* Title Input */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
              placeholder="Enter gallery title"
            />
          </div>

          {/* Expiration Settings */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="expiration"
                checked={hasExpiration}
                onCheckedChange={setHasExpiration}
              />
              <Label htmlFor="expiration" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Set expiration date
              </Label>
            </div>
            
            {hasExpiration && (
              <div className="grid grid-cols-4 items-center gap-4 pl-6">
                <Label htmlFor="expiration-days" className="text-right text-sm">
                  Expires in
                </Label>
                <Select value={expirationDays} onValueChange={setExpirationDays}>
                  <SelectTrigger className="col-span-3">
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
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={openInNewTab}
                  className="shrink-0"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
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
            <AlertDescription className="text-sm">
              Anyone with this link can view the selected images. 
              {hasExpiration && ` The link will expire in ${expirationDays} day${parseInt(expirationDays) !== 1 ? 's' : ''}.`}
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
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
              >
                Cancel
              </Button>
              <Button
                onClick={handleShareClick}
                disabled={selectedImageCount === 0 || !title.trim() || isGenerating}
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
