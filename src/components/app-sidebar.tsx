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
  X,
  User,
  Settings,
  LogOut
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Folder } from "@/lib/types";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSession, signOut } from "next-auth/react";

interface AppSidebarProps {
  folders: Folder[];
  activeView: string;
  setActiveView: (view: string) => void;
  onCreateFolder: (name: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onImageDrop: (folderId: string | null, imageId: string) => void;
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onOpenSettings?: () => void;
}

export default function AppSidebar({ folders, activeView, setActiveView, onCreateFolder, onDeleteFolder, onImageDrop, onFileUpload, onOpenSettings }: AppSidebarProps) {
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolderDialogOpen, setIsNewFolderDialogOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState<string | null>(null);
  const [deleteFolderId, setDeleteFolderId] = useState<string | null>(null);
  const [deleteFolderName, setDeleteFolderName] = useState("");
  const isMobile = useIsMobile();
  const { data: session } = useSession();

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
      
      <SidebarContent className="p-2 sm:p-3 space-y-3 sm:space-y-4">
        {/* Main Navigation */}
        <SidebarMenu className="space-y-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("all")}
              isActive={activeView === "all"}
              tooltip="All Images"
              className={cn(
                "h-10 sm:h-11 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base",
                activeView === "all" && "shadow-sm"
              )}
            >
              <LayoutGrid className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">All Images</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("uncategorized")}
              isActive={activeView === "uncategorized"}
              tooltip="Uncategorized"
              className={cn(
                "h-10 sm:h-11 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base",
                activeView === "uncategorized" && "shadow-sm"
              )}
            >
              <HelpCircle className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Uncategorized</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <Separator className="my-3 sm:my-4" />

        {/* Folders Section */}
        <div className="space-y-2">
          {folders.length > 0 && (
            <h3 className="text-xs sm:text-sm font-medium text-muted-foreground px-2 uppercase tracking-wider">
              Folders
            </h3>
          )}
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
                      "h-10 sm:h-11 rounded-xl font-medium transition-all duration-200 flex-1 text-sm sm:text-base",
                      activeView === folder.id && "shadow-sm",
                      isDragOver === folder.id && "bg-accent/50 scale-[1.02] shadow-lg"
                    )}
                  >
                    <FolderIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate">{folder.name}</span>
                  </SidebarMenuButton>
                  
                  {!isMobile && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(folder.id, folder.name);
                      }}
                      className="h-8 w-8 sm:h-9 sm:w-9 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/20 hover:text-destructive rounded-xl hover:scale-105"
                    >
                      <X className="h-3 w-3 sm:h-4 sm:w-4" />
                    </Button>
                  )}
                </div>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <Separator className="my-3 sm:my-4" />

        {/* Bin Section */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setActiveView("bin")}
              isActive={activeView === "bin"}
              tooltip="Bin"
              className={cn(
                "h-10 sm:h-11 rounded-xl font-medium transition-all duration-200 text-sm sm:text-base",
                "text-muted-foreground hover:text-destructive hover:bg-destructive/10",
                activeView === "bin" && "shadow-sm",
                isDragOver === "bin" && "bg-destructive/20 scale-[1.02] shadow-lg"
              )}
              onDrop={(e) => handleDrop(e, 'bin')}
              onDragOver={(e) => handleDragOver(e, 'bin')}
              onDragLeave={handleDragLeave}
            >
              <Trash2 className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Bin</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Mobile Profile Section */}
        {isMobile && session && (
          <div className="border rounded-xl p-3 bg-card space-y-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                <AvatarFallback className="text-xs">
                  {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{session.user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{session.user?.email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {onOpenSettings && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onOpenSettings}
                  className="flex-1 h-8 text-xs rounded-lg"
                >
                  <Settings className="mr-1 h-3 w-3" />
                  Settings
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                className="flex-1 h-8 text-xs rounded-lg text-destructive hover:text-destructive"
              >
                <LogOut className="mr-1 h-3 w-3" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
        
        <Button asChild className="w-full h-10 sm:h-11 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base">
          <label htmlFor="file-upload" className="cursor-pointer">
            <UploadCloud className="mr-2 h-4 w-4 flex-shrink-0" />
            <span className="truncate">Upload Images</span>
            <input id="file-upload" type="file" className="sr-only" onChange={onFileUpload} accept="image/*" multiple />
          </label>
        </Button>
        
        <Dialog open={isNewFolderDialogOpen} onOpenChange={setIsNewFolderDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-10 sm:h-11 rounded-xl transition-all duration-200 hover:scale-[1.02] text-sm sm:text-base">
              <Plus className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">New Folder</span>
            </Button>
          </DialogTrigger>
          <DialogContent className={`${isMobile ? "max-w-[95vw] w-full" : "sm:max-w-[425px]"} rounded-2xl`}>
            <DialogHeader>
              <DialogTitle className={isMobile ? "text-lg" : ""}>Create New Folder</DialogTitle>
              <DialogDescription className={isMobile ? "text-sm" : ""}>
                Enter a name for your new folder to help organize your images.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className={`grid ${isMobile ? "grid-cols-1 gap-2" : "grid-cols-4 gap-4"} items-center`}>
                <Label htmlFor="name" className={isMobile ? "" : "text-right"}>
                  Name
                </Label>
                <Input
                  id="name"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className={`${isMobile ? "" : "col-span-3"} rounded-xl`}
                  autoFocus
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit" onClick={handleCreate} className="rounded-xl w-full sm:w-auto">
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
