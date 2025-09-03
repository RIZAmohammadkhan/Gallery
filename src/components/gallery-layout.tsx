"use client";

import { useState, useMemo, ChangeEvent, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Folder, StoredImage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

import { generateImageMetadata } from "@/ai/flows/generate-image-metadata-flow";
import { detectDefectiveImages } from "@/ai/flows/detect-defective-images-flow";
import { searchImages } from "@/ai/flows/search-images-flow";
import { categorizeImage } from "@/ai/flows/categorize-images-flow";
import { editImage } from "@/ai/flows/edit-image-flow";

import AppHeader from "./app-header";
import AppSidebar from "./app-sidebar";
import ImageGrid from "./image-grid";
import ImageDetail from "./image-detail";

const initialFolders: Folder[] = [
  { id: "folder-1", name: "Landscapes" },
  { id: "folder-2", name: "Cityscapes" },
  { id: "folder-3", name: "Portraits" },
];

const initialImages: StoredImage[] = [
    { id: '1', name: 'Mountain Lake', dataUri: 'https://picsum.photos/id/10/800/600', metadata: 'A serene mountain lake reflects a clear blue sky.', folderId: 'folder-1', data_ai_hint: 'mountain lake', width: 800, height: 600, tags: ['mountain', 'lake', 'sky'] },
    { id: '2', name: 'Urban Night', dataUri: 'https://picsum.photos/id/20/800/1200', metadata: 'City street at night with light trails from traffic.', folderId: 'folder-2', data_ai_hint: 'city night', width: 800, height: 1200, tags: ['city', 'night', 'traffic'] },
    { id: '3', name: 'Smiling Person', dataUri: 'https://picsum.photos/id/30/800/600', metadata: 'A close-up portrait of a person smiling warmly.', folderId: 'folder-3', data_ai_hint: 'person smiling', width: 800, height: 600, tags: ['portrait', 'person', 'smiling'] },
    { id: '4', name: 'Forest Path', dataUri: 'https://picsum.photos/id/40/800/1000', metadata: 'A sunlit path winding through a dense green forest.', folderId: 'folder-1', data_ai_hint: 'forest path', width: 800, height: 1000, tags: ['forest', 'path', 'nature'] },
    { id: '5', name: 'Blurry Photo', dataUri: 'https://picsum.photos/id/50/800/600', metadata: 'Abstract lights, out of focus.', isDefective: true, defectType: 'Blurry', data_ai_hint: 'blurry lights', width: 800, height: 600 },
    { id: '6', name: 'Modern Architecture', dataUri: 'https://picsum.photos/id/60/800/700', metadata: 'The sharp geometric lines of a modern building against the sky.', folderId: 'folder-2', data_ai_hint: 'modern architecture', width: 800, height: 700, tags: ['architecture', 'modern', 'building'] },
    { id: '7', name: 'Uncategorized Photo', dataUri: 'https://picsum.photos/id/70/800/600', metadata: 'A beautiful shot of a beach.', folderId: null, data_ai_hint: 'beach', width: 800, height: 600, tags: ['beach', 'ocean', 'sand'] },
];

export default function GalleryLayout() {
  const [folders, setFolders] = useState<Folder[]>(initialFolders);
  const [images, setImages] = useState<StoredImage[]>(initialImages);
  const [activeView, setActiveView] = useState<string>("all");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, string | boolean>>({});
  const [isSearching, setIsSearching] = useState(false);

  const { toast } = useToast();
  
  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
        if (searchQuery) {
            performSearch(searchQuery);
        } else {
            setSearchResults(null);
        }
    }, 500); // 500ms delay

    return () => {
        clearTimeout(handler);
    };
  }, [searchQuery, images]);


  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = { id: `folder-${Date.now()}`, name };
    setFolders((prev) => [...prev, newFolder]);
    toast({ title: "Folder Created", description: `Successfully created "${name}".` });
  };

  const readFileAsDataURI = (file: File): Promise<{dataUri: string, width: number, height: number}> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          resolve({
            dataUri: e.target?.result as string,
            width: img.width,
            height: img.height,
          });
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageId = `img-${Date.now()}`;
    setLoadingStates((prev) => ({ ...prev, [imageId]: "Uploading..." }));
    
    try {
      const { dataUri, width, height } = await readFileAsDataURI(file);
      const newImage: StoredImage = { id: imageId, name: file.name, dataUri, width, height, folderId: null };
      setImages((prev) => [newImage, ...prev]);

      setLoadingStates((prev) => ({ ...prev, [imageId]: "Analyzing..." }));
      const [metadataRes, defectRes] = await Promise.all([
        generateImageMetadata({ photoDataUri: dataUri }),
        detectDefectiveImages({ photoDataUri: dataUri }),
      ]);
      
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                name: metadataRes.title,
                metadata: metadataRes.metadata,
                tags: metadataRes.tags,
                isDefective: defectRes.isDefective,
                defectType: defectRes.defectType,
              }
            : img
        )
      );

      // Automatic Categorization
      setLoadingStates((prev) => ({ ...prev, [imageId]: "Categorizing..." }));
      if (!defectRes.isDefective && folders.length > 0) {
        const { category } = await categorizeImage({
          photoDataUri: dataUri,
          folders: folders.map(f => f.name),
        });
        const targetFolder = folders.find(f => f.name === category);
        if (targetFolder) {
          setImages(prev => prev.map(img => img.id === imageId ? { ...img, folderId: targetFolder.id } : img));
          toast({
            title: "Upload Successful",
            description: `${file.name} uploaded and moved to "${category}".`,
          });
        } else {
            toast({
              title: "Upload Successful",
              description: `${file.name} uploaded but couldn't be categorized.`,
            });
        }
      } else {
         toast({
          title: "Upload Successful",
          description: `${file.name} has been uploaded and analyzed.`,
        });
      }

    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: "There was an error processing your image.",
        variant: "destructive",
      });
      setImages(prev => prev.filter(img => img.id !== imageId));
    } finally {
      setLoadingStates((prev) => {
        const next = { ...prev };
        delete next[imageId];
        return next;
      });
    }
  };
  
  const performSearch = async (query: string) => {
    if (!query.trim()) {
        setSearchResults(null);
        return;
    }
    setIsSearching(true);
    try {
        const imageMetadata = images
            .map(img => ({ filename: img.id, description: `${img.name} ${img.metadata} ${img.tags?.join(' ')}` }));

        const res = await searchImages({ query: query.trim(), imageMetadata });
        setSearchResults(res.results);
    } catch (error)
        {
        console.error("Search failed:", error);
        toast({ title: "Search Error", description: "Could not perform search.", variant: "destructive" });
        setSearchResults([]);
    } finally {
        setIsSearching(false);
    }
  };

  const handleManualCategorize = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;

    setLoadingStates(prev => ({ ...prev, [imageId]: "Categorizing..." }));
    try {
      const { category } = await categorizeImage({
        photoDataUri: image.dataUri,
        folders: folders.map(f => f.name),
      });

      const targetFolder = folders.find(f => f.name === category);
      if (targetFolder) {
        setImages(prev => prev.map(img => img.id === imageId ? { ...img, folderId: targetFolder.id } : img));
        toast({ title: "Categorization Complete", description: `Image moved to "${category}".` });
      } else {
         toast({ title: "Categorization Failed", description: `Could not find a folder named "${category}".`, variant: "destructive" });
      }

    } catch (error) {
        console.error("Categorization failed:", error);
        toast({ title: "AI Error", description: "Could not categorize image.", variant: "destructive" });
    } finally {
        setLoadingStates(prev => {
            const next = { ...prev };
            delete next[imageId];
            return next;
        });
    }
  };

  const handleUpdateImage = (imageId: string, updates: Partial<StoredImage>) => {
    setImages(prev => prev.map(img => img.id === imageId ? { ...img, ...updates } : img));
  };
  
  const handleDeleteImage = (imageId: string) => {
      setImages(prev => prev.filter(img => img.id !== imageId));
      setSelectedImageId(null);
  };

  const handleEditImage = async (imageId: string, prompt: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    setLoadingStates(prev => ({...prev, [imageId]: 'Editing...'}));
    try {
        const { editedPhotoDataUri } = await editImage({ photoDataUri: image.dataUri, editDescription: prompt });
        handleUpdateImage(imageId, { dataUri: editedPhotoDataUri });
        toast({ title: "Image Edited", description: "Your image has been updated with AI edits." });
    } catch (error) {
        console.error("Edit failed:", error);
        toast({ title: "Edit Failed", description: "Could not apply AI edits.", variant: "destructive" });
    } finally {
        setLoadingStates(prev => {
            const next = { ...prev };
            delete next[imageId];
            return next;
        });
    }
  };

  const handleImageDrop = (folderId: string | null, imageId: string) => {
    if (folderId === 'bin') {
      handleUpdateImage(imageId, { isDefective: true, defectType: 'Manual', folderId: null });
      toast({ title: "Image Moved", description: "Image moved to Bin." });
    } else {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        handleUpdateImage(imageId, { folderId, isDefective: false });
        toast({ title: "Image Moved", description: `Image moved to "${folder.name}".` });
      } else if (folderId === null) {
        // Dropped on "Uncategorized"
         handleUpdateImage(imageId, { folderId: null, isDefective: false });
         toast({ title: "Image Moved", description: `Image moved to "Uncategorized".` });
      }
    }
  };

  const displayedImages = useMemo(() => {
    const sourceImages = searchResults
      ? images.filter(img => new Set(searchResults).has(img.id))
      : images;
      
    if (searchQuery && searchResults) {
        return sourceImages;
    }

    if (activeView === "bin") {
      return images.filter((img) => img.isDefective);
    }
    if (activeView === "uncategorized") {
        return images.filter((img) => !img.isDefective && !img.folderId);
    }
    if (activeView !== "all") {
      return images.filter((img) => !img.isDefective && img.folderId === activeView);
    }
    
    // Default to 'all'
    return images.filter((img) => !img.isDefective);

  }, [images, activeView, searchResults, searchQuery]);

  const selectedImage = useMemo(() => images.find(img => img.id === selectedImageId), [images, selectedImageId]);

  return (
    <SidebarProvider>
      <Sidebar>
        <AppSidebar
          folders={folders}
          activeView={activeView}
          setActiveView={setActiveView}
          onCreateFolder={handleCreateFolder}
          onImageDrop={handleImageDrop}
        />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <AppHeader
            onFileUpload={handleFileUpload}
            onSearch={setSearchQuery}
            isSearching={isSearching}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <ImageGrid
              images={displayedImages}
              loadingStates={loadingStates}
              onImageClick={(id) => setSelectedImageId(id)}
            />
          </main>
        </div>
      </SidebarInset>

      {selectedImage && (
        <ImageDetail
          image={selectedImage}
          folders={folders}
          onOpenChange={() => setSelectedImageId(null)}
          onCategorize={handleManualCategorize}
          onUpdateImage={handleUpdateImage}
          onDeleteImage={handleDeleteImage}
          onEditImage={handleEditImage}
          loadingState={loadingStates[selectedImage.id]}
        />
      )}
    </SidebarProvider>
  );
}
