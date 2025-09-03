"use client";

import { useState } from 'react';
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
import { Share2 } from 'lucide-react';

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onShare: (title: string) => void;
  selectedImageCount: number;
}

export function ShareDialog({ isOpen, onOpenChange, onShare, selectedImageCount }: ShareDialogProps) {
  const [title, setTitle] = useState("My Shared Gallery");

  const handleShareClick = () => {
    if (title.trim()) {
      onShare(title.trim());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share Images</DialogTitle>
          <DialogDescription>
            Create a shareable link for the {selectedImageCount} selected image{selectedImageCount !== 1 ? 's' : ''}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleShareClick} disabled={selectedImageCount === 0}>
            <Share2 className="mr-2 h-4 w-4" />
            Generate and Open Link
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
