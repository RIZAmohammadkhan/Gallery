"use client";

import type { ChangeEvent } from 'react';
import { useState } from "react";
import { Folder as FolderIcon, Plus, Trash2, LayoutGrid, HelpCircle, UploadCloud, X } from "lucide-react";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder } from "@/lib/types";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

interface AppSidebarProps {
  folders: Folder[];
  activeView: string;
  setActiveView: (view: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onImageDrop: (folderId: string | null, imageId: string) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
}

export default function AppSidebar({ folders, activeView, setActiveView, onCreateFolder, onDeleteFolder, onImageDrop, onFileUpload }: AppSidebarProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState<string | null>(null);

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setIsNewFolderDialogOpen(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLButtonElement>, folderId: string | null) => {
    e.preventDefault();
    const imageId = e.dataTransfer.getData("imageId");
    if (imageId) {
      onImageDrop(folderId, imageId);
    }
    setIsDragOver(null);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLButtonElement>, folderId: string) => {
    e.preventDefault();
    setIsDragOver(folderId);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsDragOver(null);
  };


  return (
    <>
      <SidebarHeader />
      <SidebarContent className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("all")}
              isActive={activeView === "all"}
              tooltip="All Images"
              className="font-medium"
            >
              <LayoutGrid />
              <span>All Images</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
           <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("uncategorized")}
              isActive={activeView === "uncategorized"}
              tooltip="Uncategorized"
              className="font-medium"
            >
              <HelpCircle />
              <span>Uncategorized</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <Separator className="my-2" />
        <SidebarMenu>
          {folders.map((folder) => (
            <SidebarMenuItem key={folder.id}>
              <div className="flex items-center group">
                <SidebarMenuButton
                  onClick={() => setActiveView(folder.id)}
                  isActive={activeView === folder.id}
                  tooltip={folder.name}
                  onDrop={(e) => handleDrop(e, folder.id)}
                  onDragOver={(e) => handleDragOver(e, folder.id)}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "transition-colors flex-1",
                    isDragOver === folder.id && "bg-accent/50"
                  )}
                >
                  <FolderIcon />
                  <span>{folder.name}</span>
                </SidebarMenuButton>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFolder(folder.id);
                  }}
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
        <Separator className="my-2" />
         <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("bin")}
              isActive={activeView === "bin"}
              tooltip="Bin"
              className={cn("text-muted-foreground hover:text-destructive hover:bg-destructive/10", isDragOver === "bin" && "bg-destructive/20")}
              onDrop={(e) => handleDrop(e, 'bin')}
              onDragOver={(e) => handleDragOver(e, 'bin')}
              onDragLeave={handleDragLeave}
            >
              <Trash2 />
              <span>Bin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="space-y-2">
        <Button asChild className="w-full">
            <label htmlFor="file-upload">
                <UploadCloud className="mr-2 h-4 w-4" />
                Upload
                <input id="file-upload" type="file" className="sr-only" onChange={onFileUpload} accept="image/*" />
            </label>
        </Button>
        <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Folder</DialogTitle>
              <DialogDescription>
                Enter a name for your new folder to help organize your images.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="col-span-3"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>
    </>
  );
}
