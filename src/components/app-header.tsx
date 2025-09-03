"use client";

import { GalleryHorizontal, Search, Share2, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";

interface AppHeaderProps {
  onSearch: (query: string) => void;
  isSearching: boolean;
  searchQuery: string;
  selectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedImageCount: number;
  onShare: () => void;
}

export default function AppHeader({ 
  onSearch, 
  isSearching, 
  searchQuery, 
  selectionMode, 
  onToggleSelectionMode,
  selectedImageCount,
  onShare
}: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
      <div className="flex items-center gap-2">
        <GalleryHorizontal className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-headline font-semibold tracking-tight md:text-2xl">Gallery</h1>
      </div>
      
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <form className="w-full" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex items-center w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search images..."
              className="pl-10 w-full md:w-[300px] lg:w-[400px] bg-background rounded-full"
              onChange={(e) => onSearch(e.target.value)}
              value={searchQuery}
            />
             {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <span className="h-1.5 w-1.5 animate-pulse-fast rounded-full bg-muted-foreground" />
                <span className="h-1.5 w-1.5 animate-pulse-fast-delay rounded-full bg-muted-foreground" />
                <span className="h-1.5 w-1.5 animate-pulse-fast-delay-2 rounded-full bg-muted-foreground" />
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="flex items-center gap-2">
        {selectionMode ? (
          <>
            <Button variant="outline" size="sm" onClick={onShare} disabled={selectedImageCount === 0}>
              <Share2 className="mr-2 h-4 w-4" />
              Share ({selectedImageCount})
            </Button>
            <Button variant="ghost" size="icon" onClick={onToggleSelectionMode} className="h-9 w-9">
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={onToggleSelectionMode}>Select</Button>
        )}
      </div>
    </header>
  );
}
