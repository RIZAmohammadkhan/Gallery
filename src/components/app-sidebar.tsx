"use client";

import type { ChangeEvent } from 'react';
import { useState } from "react";
import { 
  Folder as FolderIcon, 
  Plus, 
  Trash2, 
  LayoutGrid, 
  HelpCircle, 
  UploadCloud, 
  X
} from "lucide-react";
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
import { DeleteFolderDialog } from "./delete-folder-dialog";

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
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [deleteFolderName, setDeleteFolderName] = useState("");

  const handleCreate = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim());
      setNewFolderName("");
      setIsNewFolderDialogOpen(false);
    }
  };

  const handleDeleteClick = (folderId: string, folderName: string) => {
    setDeleteFolderId(folderId);
    setDeleteFolderName(folderName);
  };

  const handleConfirmDelete = () => {
    if (deleteFolderId) {
      onDeleteFolder(deleteFolderId);
      setDeleteFolderId(null);
      setDeleteFolderName("");
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
      
      <SidebarContent className="p-3 space-y-4">
        {/* Main Navigation */}
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("all")}
              isActive={activeView === "all"}
              tooltip="All Images"
              className={cn(
                "h-11 rounded-xl font-medium transition-all duration-200",
                activeView === "all" && "shadow-sm"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
              <span>All Images</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("uncategorized")}
              isActive={activeView === "uncategorized"}
              tooltip="Uncategorized"
              className={cn(
                "h-11 rounded-xl font-medium transition-all duration-200",
                activeView === "uncategorized" && "shadow-sm"
              )}
            >
              <HelpCircle className="h-4 w-4" />
              <span>Uncategorized</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator className="my-4" />

        {/* Folders Section */}
        <SidebarMenu className="space-y-1">
          {folders.map((folder) => (
            <SidebarMenuItem key={folder.id}>
              <div className="flex items-center group gap-1">
                <SidebarMenuButton
                  onClick={() => setActiveView(folder.id)}
                  isActive={activeView === folder.id}
                  tooltip={folder.name}
                  onDrop={(e) => handleDrop(e, folder.id)}
                  onDragOver={(e) => handleDragOver(e, folder.id)}
                  onDragLeave={handleDragLeave}
                  className={cn(
                    "h-11 rounded-xl font-medium transition-all duration-200 flex-1",
                    activeView === folder.id && "shadow-sm",
                    isDragOver === folder.id && "bg-accent/50 scale-[1.02] shadow-lg"
                  )}
                >
                  <FolderIcon className="h-4 w-4" />
                  <span className="truncate">{folder.name}</span>
                </SidebarMenuButton>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(folder.id, folder.name);
                  }}
                  className="h-9 w-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/20 hover:text-destructive rounded-xl hover:scale-105"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <Separator className="my-4" />

        {/* Bin Section */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("bin")}
              isActive={activeView === "bin"}
              tooltip="Bin"
              className={cn(
                "h-11 rounded-xl font-medium transition-all duration-200",
                "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                activeView === "bin" && "shadow-sm",
                isDragOver === "bin" && "bg-destructive/20 scale-[1.02] shadow-lg"
              )}
              onDrop={(e) => handleDrop(e, 'bin')}
              onDragOver={(e) => handleDragOver(e, 'bin')}
              onDragLeave={handleDragLeave}
            >
              <Trash2 className="h-4 w-4" />
              <span>Bin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-3 space-y-3">
        <Button asChild className="w-full h-11 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02]">
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mr-2 h-4 w-4" />
            Upload Images
            <input id="file-upload" type="file" className="sr-only" onChange={onFileUpload} accept="image/*" multiple />
          </label>
        </Button>
        
        <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-11 rounded-xl transition-all duration-200 hover:scale-[1.02]">
              <Plus className="mr-2 h-4 w-4" />
              New Folder
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-2xl">
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
                  className="col-span-3 rounded-xl"
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate} className="rounded-xl">
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarFooter>

      <DeleteFolderDialog
        isOpen={deleteFolderId !== null}
        onOpenChange={() => {
          setDeleteFolderId(null);
          setDeleteFolderName("");
        }}
        onConfirm={handleConfirmDelete}
        folderName={deleteFolderName}
      />
    </>
  );
}
