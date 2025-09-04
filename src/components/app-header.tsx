"use client";

import { GalleryHorizontal, Search, Share2, X, History, Trash2, Download, CheckSquare, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "./ui/button";
import { UserMenu } from "./user-menu";
import { MobileMenu } from "./mobile-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { signOut } from "next-auth/react";

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
  const isMobile = useIsMobile();

  const handleSignOut = () => {
    signOut({ callbackUrl: '/auth/signin' });
  };
  
  return (
    <header className="sticky top-0 z-50 flex h-14 sm:h-16 shrink-0 items-center gap-2 sm:gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-2 sm:px-4 md:px-6">
      {/* Mobile sidebar trigger */}
      {isMobile && (
        <SidebarTrigger className="flex-shrink-0" />
      )}
      
      {/* Logo/Title */}
      <div className="flex items-center gap-2 min-w-0">
        <GalleryHorizontal className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
        <h1 className="text-lg sm:text-xl md:text-2xl font-headline font-semibold tracking-tight truncate">
          Gallery
        </h1>
      </div>
      
      {/* Search Bar - Responsive positioning */}
      <div className="flex-1 flex justify-center">
        <form className="w-full max-w-md" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex items-center w-full">
            <Search className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground z-10" />
            <Input
              type="search"
              placeholder={isMobile ? "Search..." : "Search images..."}
              className="pl-8 sm:pl-10 w-full bg-background/80 rounded-full border-border/50 focus:border-border transition-colors text-sm sm:text-base"
              onChange={(e) => onSearch(e.target.value)}
              value={searchQuery}
            />
            {isSearching && (
              <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex items-center space-x-1">
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.2s]" />
                <span className="h-1 w-1 sm:h-1.5 sm:w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:0.4s]" />
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
        {isMobile ? (
          <>
            {/* Mobile Menu for all actions */}
            <MobileMenu
              selectionMode={selectionMode}
              selectedImageCount={selectedImageCount}
              totalVisibleImages={totalVisibleImages}
              allSelected={allSelected}
              activeView={activeView}
              onShare={onShare}
              onBulkExport={onBulkExport}
              onBulkDelete={onBulkDelete}
              onOpenSharedGalleries={onOpenSharedGalleries}
              onOpenSettings={onOpenSettings}
              onSelectAll={onSelectAll}
              onUnselectAll={onUnselectAll}
              onSignOut={handleSignOut}
            />
            {!selectionMode && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onToggleSelectionMode}
              >
                Select
              </Button>
            )}
            {selectionMode && (
              <Button variant="ghost" size="sm" onClick={onToggleSelectionMode}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          /* Desktop Layout */
          selectionMode ? (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={allSelected ? onUnselectAll : onSelectAll}
                className="hidden sm:flex"
              >
                <CheckSquare className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">{allSelected ? 'None' : 'All'}</span>
                <span className="ml-1">({totalVisibleImages})</span>
              </Button>
              
              {selectedImageCount > 0 && (
                <>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onShare} 
                    className="hidden sm:flex"
                  >
                    <Share2 className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Share</span>
                    <span className="ml-1">({selectedImageCount})</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onBulkExport} 
                    className="hidden sm:flex"
                  >
                    <Download className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden lg:inline">Export</span>
                    <span className="ml-1">({selectedImageCount})</span>
                  </Button>
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={onBulkDelete}
                  >
                    <Trash2 className="mr-1 sm:mr-1.5 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">{activeView === "bin" ? "Delete" : "Bin"}</span>
                    <span className="ml-1">({selectedImageCount})</span>
                  </Button>
                </>
              )}
              
              <Button variant="ghost" size="sm" onClick={onToggleSelectionMode}>
                <X className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="sr-only">Exit selection mode</span>
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onOpenSharedGalleries} 
                className="hidden sm:flex"
              >
                <History className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden md:inline">Shared</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onToggleSelectionMode}
              >
                <span className="text-xs sm:text-sm">Select</span>
              </Button>
              <UserMenu onOpenSettings={onOpenSettings} />
            </div>
          )
        )}
      </div>
    </header>
  );
}
