"use client";

import { useState } from "react";
import { MoreVertical, Share2, Download, History, Settings, LogOut, Trash2, CheckSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MobileMenuProps {
  selectionMode: boolean;
  selectedImageCount: number;
  totalVisibleImages: number;
  allSelected: boolean;
  activeView: string;
  onShare: () => void;
  onBulkExport: () => void;
  onBulkDelete: () => void;
  onOpenSharedGalleries: () => void;
  onOpenSettings: () => void;
  onSelectAll: () => void;
  onUnselectAll: () => void;
  onSignOut?: () => void;
}

export function MobileMenu({
  selectionMode,
  selectedImageCount,
  totalVisibleImages,
  allSelected,
  activeView,
  onShare,
  onBulkExport,
  onBulkDelete,
  onOpenSharedGalleries,
  onOpenSettings,
  onSelectAll,
  onUnselectAll,
  onSignOut,
}: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleAction = (action: () => void) => {
    action();
    setIsOpen(false);
  };

  if (selectionMode) {
    return (
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="relative">
            <MoreVertical className="h-4 w-4" />
            {selectedImageCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {selectedImageCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="flex items-center justify-between">
            Selection Mode
            <Badge variant="outline">{selectedImageCount} selected</Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          <DropdownMenuItem onClick={() => handleAction(allSelected ? onUnselectAll : onSelectAll)}>
            <CheckSquare className="mr-2 h-4 w-4" />
            {allSelected ? `Unselect All` : `Select All (${totalVisibleImages})`}
          </DropdownMenuItem>

          {selectedImageCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction(onShare)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share ({selectedImageCount})
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => handleAction(onBulkExport)}>
                <Download className="mr-2 h-4 w-4" />
                Export ({selectedImageCount})
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => handleAction(onBulkDelete)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {activeView === "bin" ? "Delete" : "Move to Bin"} ({selectedImageCount})
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Gallery Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleAction(onOpenSharedGalleries)}>
          <History className="mr-2 h-4 w-4" />
          Shared Galleries
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={() => handleAction(onOpenSettings)}>
          <Settings className="mr-2 h-4 w-4" />
          Settings
        </DropdownMenuItem>
        
        {onSignOut && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => handleAction(onSignOut)}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
