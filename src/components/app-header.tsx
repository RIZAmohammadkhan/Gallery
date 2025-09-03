"use client";

import { GalleryHorizontal, Search, Share2, X, History, Trash2, Download, CheckSquare, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";

interface AppHeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchQuery: string;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedImageCount: number;
  onShare: () => void;
  onOpenSharedGalleries: () => void;
  onBulkDelete: () => void;
  onBulkExport: () => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  totalVisibleImages: number;
  allSelected: boolean;
  onOpenSettings: () => void;
  activeView: string;
}

export default function AppHeader({ 
  onSearch, 
  isSearching, 
  searchQuery, 
  selectionMode, 
  onToggleSelectionMode,
  selectedImageCount,
  onShare,
  onOpenSharedGalleries,
  onBulkDelete,
  onBulkExport,
  onSelectAll,
  onUnselectAll,
  totalVisibleImages,
  allSelected,
  onOpenSettings,
  activeView
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      {/* Logo/Title */}
      <div className="flex items-center gap-2 min-w-0">
        <GalleryHorizontal className="h-6 w-6 text-primary flex-shrink-0" />
        <h1 className="text-xl font-headline font-semibold tracking-tight md:text-2xl truncate">Gallery</h1>
      </div>
      
      {/* Search Bar - Repositioned based on selection mode */}
      <div className={`flex-1 flex justify-center transition-all duration-200 ease-in-out ${
        selectionMode ? 'md:justify-start md:ml-4' : 'justify-center'
      }`}>
        <form className="w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex items-center w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
            <Input
              type="search"
              placeholder="Search images..."
              className="pl-10 w-full bg-background/80 rounded-full border-border/50 focus:border-border transition-colors"
              onChange={(e) => onSearch(e.target.value)}
              value={searchQuery}
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {selectionMode ? (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={allSelected ? onUnselectAll : onSelectAll}
              className="hidden sm:flex"
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {allSelected ? 'None' : 'All'} ({totalVisibleImages})
            </Button>
            
            {selectedImageCount > 0 && (
              <>
                <Button variant="outline" size="sm" onClick={onShare} className="hidden md:flex">
                  <Share2 className="mr-1.5 h-4 w-4" />
                  <span className="hidden lg:inline">Share</span>
                  <span className="ml-1">({selectedImageCount})</span>
                </Button>
                
                <Button variant="outline" size="sm" onClick={onBulkExport} className="hidden md:flex">
                  <Download className="mr-1.5 h-4 w-4" />
                  <span className="hidden lg:inline">Export</span>
                  <span className="ml-1">({selectedImageCount})</span>
                </Button>
                
                <Button variant="destructive" size="sm" onClick={onBulkDelete}>
                  <Trash2 className="mr-1.5 h-4 w-4" />
                  <span className="hidden sm:inline">{activeView === "bin" ? "Delete" : "Bin"}</span>
                  <span className="ml-1">({selectedImageCount})</span>
                </Button>
              </>
            )}
            
            <Button variant="ghost" size="sm" onClick={onToggleSelectionMode}>
              <X className="h-4 w-4" />
              <span className="sr-only">Exit selection mode</span>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onOpenSharedGalleries} className="hidden sm:flex">
              <History className="mr-2 h-4 w-4" />
              Shared
            </Button>
            <Button variant="outline" size="sm" onClick={onToggleSelectionMode}>
              Select
            </Button>
            <UserMenu onOpenSettings={onOpenSettings} />
          </div>
        )}
      </div>
    </header>
  );
}
