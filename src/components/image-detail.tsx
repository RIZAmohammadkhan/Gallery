"use client";

import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, FolderSync, Trash2, RotateCcw } from "lucide-react";
import type { StoredImage, Folder } from "@/lib/types";

interface ImageDetailProps {
  image: StoredImage;
  folders: Folder[];
  onOpenChange: (open: boolean) => void;
  onCategorize: (imageId: string) => void;
  onUpdateImage: (imageId: string, updates: Partial<StoredImage>) => void;
  onDeleteImage: (imageId: string) => void;
  onEditImage: (imageId: string, prompt: string) => Promise<void>;
  loadingState: string | boolean | undefined;
}

export default function ImageDetail({
  image,
  folders,
  onOpenChange,
  onCategorize,
  onUpdateImage,
  onDeleteImage,
  onEditImage,
  loadingState
}: ImageDetailProps) {
  const [editPrompt, setEditPrompt] = useState('');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleEdit = async () => {
    if (!editPrompt.trim()) return;
    await onEditImage(image.id, editPrompt);
    setIsEditDialogOpen(false);
    setEditPrompt('');
  }

  const isLoading = !!loadingState;

  return (
    <Dialog open={true} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full h-[90vh] flex flex-col md:flex-row p-0 gap-0">
        <div className="relative w-full md:w-2/3 h-1/2 md:h-full bg-black">
          <Image
            src={image.dataUri}
            alt={image.name}
            fill
            className="object-contain"
          />
           {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center text-foreground p-2 text-center">
              <Loader2 className="animate-spin h-8 w-8 mb-2" />
              <span className="text-sm font-medium">{typeof loadingState === 'string' ? loadingState : 'Processing...'}</span>
            </div>
          )}
        </div>
        <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col p-6 overflow-y-auto">
          <DialogHeader className="text-left">
            <DialogTitle className="text-2xl mb-2">{image.name}</DialogTitle>
            <DialogDescription>
              {image.metadata}
            </DialogDescription>
             {image.isDefective && <Badge variant="destructive" className="w-fit my-2">{image.defectType}</Badge>}
          </DialogHeader>
          
          {image.tags && image.tags.length > 0 && (
            <div className="my-4">
                <h3 className="font-semibold mb-2 text-foreground">Tags</h3>
                <div className="flex flex-wrap gap-2">
                    {image.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                </div>
            </div>
          )}

          <div className="mt-auto space-y-2 pt-4">
             {!image.isDefective ? (
              <>
                <div className="flex gap-2">
                  <Select onValueChange={(folderId) => onUpdateImage(image.id, { folderId })} value={image.folderId ?? ""}>
                      <SelectTrigger disabled={isLoading} className="flex-grow">
                        <SelectValue placeholder="Move to folder..." />
                      </SelectTrigger>
                      <SelectContent>
                        {folders.map(folder => (
                          <SelectItem key={folder.id} value={folder.id}>{folder.name}</SelectItem>
                        ))}
                      </SelectContent>
                  </Select>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" size="icon" onClick={() => onCategorize(image.id)} disabled={isLoading}>
                          <FolderSync className="h-4 w-4" />
                          <span className="sr-only">Categorize with AI</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Categorize with AI</TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex gap-2">
                    <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                      <Tooltip>
                          <TooltipTrigger asChild>
                              <DialogTrigger asChild>
                                  <Button className="w-full" variant="outline" disabled={isLoading}>
                                      <Sparkles className="h-4 w-4" />
                                  </Button>
                              </DialogTrigger>
                          </TooltipTrigger>
                          <TooltipContent>Edit with AI</TooltipContent>
                      </Tooltip>
                      <DialogContent>
                          <DialogHeader>
                              <DialogTitle>Edit Image with AI</DialogTitle>
                              <DialogDescription>Describe the changes you want to make to the image.</DialogDescription>
                          </DialogHeader>
                          <Textarea 
                              placeholder="e.g. make the sky purple, add a cat on the bench..." 
                              value={editPrompt}
                              onChange={(e) => setEditPrompt(e.target.value)}
                              rows={3}
                          />
                          <DialogFooter>
                              <Button onClick={handleEdit} disabled={isLoading}>
                                  {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                  Generate
                              </Button>
                          </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="destructive" className="w-full" onClick={() => onUpdateImage(image.id, { isDefective: true, defectType: 'Manual' })} disabled={isLoading}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>Move to Bin</TooltipContent>
                    </Tooltip>
                </div>
              </>
            ) : (
               <div className="flex gap-2 w-full">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="outline" className="w-full" onClick={() => onUpdateImage(image.id, { isDefective: false })} disabled={isLoading}>
                          <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Restore</TooltipContent>
                  </Tooltip>
                   <Tooltip>
                      <TooltipTrigger asChild>
                          <Button variant="destructive" className="w-full" onClick={() => onDeleteImage(image.id)} disabled={isLoading}>
                              <Trash2 className="h-4 w-4" />
                          </Button>
                      </TooltipTrigger>
                      <TooltipContent>Delete Permanently</TooltipContent>
                    </Tooltip>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
