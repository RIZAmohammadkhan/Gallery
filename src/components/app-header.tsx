"use client";

import type { ChangeEvent } from 'react';
import { GalleryHorizontal, Search, UploadCloud, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from './ui/sidebar';

interface AppHeaderProps {
  onFileUpload: (event: ChangeEvent<HTMLInputElement>) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export default function AppHeader({ onFileUpload, onSearch, isSearching }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
       <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <GalleryHorizontal className="h-6 w-6 text-primary" />
        <h1 className="text-lg font-semibold md:text-xl">Gemini Gallery</h1>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search images by description..."
              className="pl-8 sm:w-[300px] md:w-[200px] lg:w-[300px]"
              onChange={(e) => onSearch(e.target.value)}
            />
            {isSearching && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </form>
        <Button asChild>
          <label htmlFor="file-upload">
            <UploadCloud className="h-4 w-4 mr-2" />
            Upload
            <input id="file-upload" type="file" className="sr-only" onChange={onFileUpload} accept="image/*" />
          </label>
        </Button>
      </div>
    </header>
  );
}
