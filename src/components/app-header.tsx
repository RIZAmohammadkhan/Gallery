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
  searchQuery: string;
}

export default function AppHeader({ onFileUpload, onSearch, isSearching, searchQuery }: AppHeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
       <SidebarTrigger className="md:hidden" />
      <div className="flex items-center gap-2">
        <GalleryHorizontal className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-headline font-semibold tracking-tight md:text-2xl">Gallery</h1>
      </div>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <form className="ml-auto flex-1 sm:flex-initial" onSubmit={(e) => e.preventDefault()}>
          <div className="relative flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search images..."
              className="pl-10 sm:w-[300px] md:w-[200px] lg:w-[300px] bg-background rounded-full"
              onChange={(e) => onSearch(e.target.value)}
              value={searchQuery}
            />
            {isSearching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />}
          </div>
        </form>
        <Button asChild className="rounded-full">
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
