"use client";

import { useState, useMemo, ChangeEvent, useEffect } from "react";
import { SidebarProvider, Sidebar, SidebarInset, SidebarRail } from "@/components/ui/sidebar";
import { Folder, StoredImage } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { getShareUrl, copyToClipboard } from "@/lib/sharing-client";


import { generateImageMetadata } from "@/ai/flows/generate-image-metadata-flow";
import { detectDefectiveImages } from "@/ai/flows/detect-defective-images-flow";
import { advancedSearchImages } from "@/ai/flows/advanced-search-images-flow";
import { categorizeImage } from "@/ai/flows/categorize-images-flow";
import { editImage } from "@/ai/flows/edit-image-flow";

import AppHeader from "./app-header";
import AppSidebar from "./app-sidebar";
import ImageGrid from "./image-grid";
import ImageDetail from "./image-detail";
import { ShareDialog } from "./share-dialog";
import { SharedGalleriesManager } from "./shared-galleries-manager";
import { BulkDeleteDialog } from "./bulk-delete-dialog";
import { BulkExportDialog } from "./bulk-export-dialog";
import { SettingsDialog } from "./settings-dialog-new";
import { exportImagesAsZip } from "@/lib/bulk-operations";

// Helper function to convert file URL to data URI for AI processing
const convertFileUrlToDataUri = async (fileUrl: string): Promise<string> => {
  try {
    const response = await fetch(fileUrl);
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting file URL to data URI:', error);
    throw error;
  }
};

export default function GalleryLayout() {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [images, setImages] = useState<StoredImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeView, setActiveView] = useState<string>("all");
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<string[] | null>(null);
  const [loadingStates, setLoadingStates] = useState<Record<string, string | boolean>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedImageIds, setSelectedImageIds] = useState<Set<string>>(new Set());
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isSharedGalleriesOpen, setIsSharedGalleriesOpen] = useState(false);
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);
  const [isBulkExportDialogOpen, setIsBulkExportDialogOpen] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [isExportComplete, setIsExportComplete] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  // Load data from database on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [imagesResponse, foldersResponse] = await Promise.all([
          fetch('/api/images'),
          fetch('/api/folders')
        ]);

        if (imagesResponse.ok) {
          const imagesData = await imagesResponse.json();
          setImages(imagesData);
        } else {
          console.error('Failed to load images');
          toast({
            title: "Error Loading Images",
            description: "Failed to load your images from the database.",
            variant: "destructive"
          });
        }

        if (foldersResponse.ok) {
          const foldersData = await foldersResponse.json();
          setFolders(foldersData);
        } else {
          console.error('Failed to load folders');
          toast({
            title: "Error Loading Folders",
            description: "Failed to load your folders from the database.",
            variant: "destructive"
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        toast({
          title: "Error Loading Data",
          description: "Failed to connect to the database. Please try refreshing the page.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [toast]);

  // Process images without AI info on load
  useEffect(() => {
    const processImagesWithoutAI = async () => {
      const imagesToProcess = images.filter(img => 
        !img.metadata || img.metadata.trim() === '' || 
        !img.tags || img.tags.length === 0
      );

      if (imagesToProcess.length === 0) return;

      console.log(`Processing ${imagesToProcess.length} images without AI info...`);
      
      // Show toast notification for automatic processing
      if (imagesToProcess.length > 1) {
        toast({
          title: "Background Processing",
          description: `Automatically processing ${imagesToProcess.length} images to add AI information.`,
        });
      }

      // Process in batches of 3 to avoid overwhelming the API
      const batchSize = 3;
      for (let i = 0; i < imagesToProcess.length; i += batchSize) {
        const batch = imagesToProcess.slice(i, i + batchSize);
        
        // Process batch in parallel
        const batchPromises = batch.map(async (image) => {
          if (loadingStates[image.id]) return; // Skip if already processing

          setLoadingStates(prev => ({ ...prev, [image.id]: "Generating AI info..." }));

          try {
            // Convert file URL to data URI for AI processing
            const imageDataUri = await convertFileUrlToDataUri(image.dataUri);
            
            const [metadataRes, defectRes] = await Promise.all([
              generateImageMetadata({ photoDataUri: imageDataUri }),
              detectDefectiveImages({ photoDataUri: imageDataUri }),
            ]);
            
            // Update image with AI analysis results
            const imageUpdates = {
              name: metadataRes.title,
              metadata: metadataRes.metadata,
              tags: metadataRes.tags,
              isDefective: defectRes.isDefective,
              defectType: defectRes.defectType,
            };

            // Update in database
            const updateResponse = await fetch('/api/images', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageId: image.id,
                ...imageUpdates
              }),
            });

            if (updateResponse.ok) {
              // Update local state
              setImages(prev => prev.map(img => 
                img.id === image.id ? { ...img, ...imageUpdates } : img
              ));
            }
          } catch (error) {
            console.error(`Failed to process image ${image.id}:`, error);
          } finally {
            setLoadingStates(prev => {
              const next = { ...prev };
              delete next[image.id];
              return next;
            });
          }
        });

        // Wait for current batch to complete before starting next batch
        await Promise.all(batchPromises);
        
        // Small delay between batches to be respectful to the API
        if (i + batchSize < imagesToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    };

    if (images.length > 0 && !isLoading) {
      processImagesWithoutAI();
    }
  }, [images, isLoading, loadingStates, toast]);
  
  // Debounce search
  useEffect(() => {
    setIsSearching(!!searchQuery);
    const handler = setTimeout(() => {
        if (searchQuery) {
            performSearch(searchQuery);
        } else {
            setSearchResults(null);
            setIsSearching(false);
        }
    }, 500); // 500ms delay

    return () => {
        clearTimeout(handler);
    };
  }, [searchQuery, images]);


  const handleCreateFolder = async (name: string) => {
    try {
      const response = await fetch('/api/folders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name }),
      });

      if (response.ok) {
        const newFolder = await response.json();
        setFolders((prev) => [...prev, newFolder]);
        toast({ title: "Folder Created", description: `Successfully created "${name}".` });
      } else {
        const error = await response.json();
        toast({ 
          title: "Error Creating Folder", 
          description: error.error || "Failed to create folder.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      toast({ 
        title: "Error Creating Folder", 
        description: "Failed to connect to the server.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    try {
      const response = await fetch(`/api/folders?folderId=${folderId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove folder from local state
        setFolders((prev) => prev.filter(f => f.id !== folderId));
        
        // Move images from this folder to uncategorized
        setImages(prev => prev.map(img => 
          img.folderId === folderId ? { ...img, folderId: null } : img
        ));
        
        // If we're currently viewing this folder, switch to "all"
        if (activeView === folderId) {
          setActiveView('all');
        }
        
        toast({ title: "Folder Deleted", description: "Folder and its images moved to uncategorized." });
      } else {
        const error = await response.json();
        toast({ 
          title: "Error Deleting Folder", 
          description: error.error || "Failed to delete folder.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
      toast({ 
        title: "Error Deleting Folder", 
        description: "Failed to connect to the server.",
        variant: "destructive"
      });
    }
  };
  
  const handleChangeActiveView = (view: string) => {
    if (searchQuery) {
        setSearchQuery("");
        setSearchResults(null);
    }
    setActiveView(view);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const tempImageId = `temp-${Date.now()}`;
    setLoadingStates((prev) => ({ ...prev, [tempImageId]: "Uploading..." }));
    
    let uploadedImageId: string | undefined;
    
    try {
      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadedImage = await uploadResponse.json();
      uploadedImageId = uploadedImage.id;
      
      // Add the uploaded image to local state with server response data
      const newImage: StoredImage = {
        id: uploadedImage.id,
        name: uploadedImage.name,
        dataUri: uploadedImage.dataUri,
        width: uploadedImage.width,
        height: uploadedImage.height,
        folderId: null,
        metadata: '',
        tags: [],
        isDefective: false
      };

      setImages((prev) => [newImage, ...prev]);

      // Now run AI analysis and update the image
      setLoadingStates((prev) => ({ ...prev, [uploadedImage.id]: "Analyzing..." }));
      
      // Convert file URL to data URI for AI processing
      const imageDataUri = await convertFileUrlToDataUri(uploadedImage.dataUri);
      
      const [metadataRes, defectRes] = await Promise.all([
        generateImageMetadata({ photoDataUri: imageDataUri }),
        detectDefectiveImages({ photoDataUri: imageDataUri }),
      ]);
      
      // Update image with AI analysis results
      const imageUpdates = {
        name: metadataRes.title,
        metadata: metadataRes.metadata,
        tags: metadataRes.tags,
        isDefective: defectRes.isDefective,
        defectType: defectRes.defectType,
      };

      // Update in database
      const updateResponse = await fetch('/api/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: uploadedImage.id,
          ...imageUpdates
        }),
      });

      if (updateResponse.ok) {
        // Update local state
        setImages((prev) =>
          prev.map((img) =>
            img.id === uploadedImage.id
              ? { ...img, ...imageUpdates }
              : img
          )
        );

        // Automatic Categorization if not defective
        if (!defectRes.isDefective && folders.length > 0) {
          setLoadingStates((prev) => ({ ...prev, [uploadedImage.id]: "Categorizing..." }));
          
          const { category } = await categorizeImage({
            photoDataUri: imageDataUri,
            folders: folders.map(f => f.name),
          });
          
          const targetFolder = folders.find(f => f.name === category);
          if (targetFolder) {
            // Update folder assignment in database
            const folderUpdateResponse = await fetch('/api/images', {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageId: uploadedImage.id,
                folderId: targetFolder.id
              }),
            });

            if (folderUpdateResponse.ok) {
              setImages(prev => prev.map(img => 
                img.id === uploadedImage.id ? { ...img, folderId: targetFolder.id } : img
              ));
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
              description: `${file.name} uploaded but couldn't be categorized.`,
            });
          }
        } else if (defectRes.isDefective) {
          toast({
            title: "Upload Successful",
            description: `${file.name} has been uploaded and moved to Bin.`,
          });
        } else {
          toast({
            title: "Upload Successful",
            description: `${file.name} has been uploaded and analyzed.`,
          });
        }
      } else {
        throw new Error('Failed to update image metadata');
      }

    } catch (error) {
      console.error("Upload failed:", error);
      toast({
        title: "Upload Failed",
        description: error instanceof Error ? error.message : "There was an error processing your image.",
        variant: "destructive",
      });
      
      // Remove the temporary image from state if it was added
      setImages(prev => prev.filter(img => img.id !== tempImageId));
    } finally {
      setLoadingStates((prev) => {
        const next = { ...prev };
        delete next[tempImageId];
        if (uploadedImageId) {
          delete next[uploadedImageId];
        }
        return next;
      });
    }
  };
  
  const performSearch = async (query: string) => {
    if (!query.trim()) {
        setSearchResults(null);
        return;
    }
    
    try {
        const imageMetadata = images.map(img => ({ 
            filename: img.id, 
            description: `${img.name} ${img.metadata}`,
            tags: img.tags,
            isDefective: img.isDefective,
            defectType: img.defectType,
        }));

        const res = await advancedSearchImages({ query: query.trim(), imageMetadata });
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
      // Convert file URL to data URI for AI processing
      const imageDataUri = await convertFileUrlToDataUri(image.dataUri);
      
      const { category } = await categorizeImage({
        photoDataUri: imageDataUri,
        folders: folders.map(f => f.name),
      });

      const targetFolder = folders.find(f => f.name === category);
      if (targetFolder) {
        await handleUpdateImage(imageId, { folderId: targetFolder.id });
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

  const handleUpdateImage = async (imageId: string, updates: Partial<StoredImage>) => {
    try {
      // Update in database first
      const response = await fetch('/api/images', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId,
          ...updates
        }),
      });

      if (response.ok) {
        // Update local state if database update successful
        setImages(prev => prev.map(img => img.id === imageId ? { ...img, ...updates } : img));
      } else {
        const error = await response.json();
        toast({
          title: "Update Failed",
          description: error.error || "Failed to update image.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error updating image:', error);
      toast({
        title: "Update Failed",
        description: "Failed to connect to the server.",
        variant: "destructive"
      });
    }
  };
  
  const handleDeleteImage = async (imageId: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    try {
      if (image.isDefective) {
        // Permanently delete if image is in bin
        const response = await fetch(`/api/images?imageId=${imageId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          setImages(prev => prev.filter(img => img.id !== imageId));
          toast({ 
            title: "Image Permanently Deleted", 
            description: "The image has been permanently deleted." 
          });
        } else {
          const error = await response.json();
          toast({
            title: "Delete Failed",
            description: error.error || "Failed to delete image.",
            variant: "destructive"
          });
        }
      } else {
        // Move to bin if image is not in bin
        await handleUpdateImage(imageId, { isDefective: true, defectType: 'Manual', folderId: null });
        toast({ 
          title: "Image Moved to Bin", 
          description: "The image has been moved to Bin." 
        });
      }
      
      setSelectedImageId(null);
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to connect to the server.",
        variant: "destructive"
      });
    }
  };

  const handleEditImage = async (imageId: string, prompt: string) => {
    const image = images.find(img => img.id === imageId);
    if (!image) return;
    
    setLoadingStates(prev => ({...prev, [imageId]: 'Editing...'}));
    
    try {
        // Convert file URL to data URI for AI processing
        const imageDataUri = await convertFileUrlToDataUri(image.dataUri);
        
        const { editedPhotoDataUri } = await editImage({ photoDataUri: imageDataUri, editDescription: prompt });
        
        // Create new image data
        const newImageName = `${image.name} (AI Edited)`;
        const newImageMetadata = `${image.metadata || ''} (AI edited: ${prompt})`;
        const newImageTags = [...(image.tags || []), 'ai-edited'];

        // Upload the edited image as a new image
        const blob = await fetch(editedPhotoDataUri).then(r => r.blob());
        const file = new File([blob], `${newImageName}.jpg`, { type: 'image/jpeg' });
        
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadResponse.ok) {
          throw new Error('Failed to upload edited image');
        }

        const uploadedImage = await uploadResponse.json();
        
        // Update the new image with metadata and folder assignment
        const updateResponse = await fetch('/api/images', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            imageId: uploadedImage.id,
            name: newImageName,
            metadata: newImageMetadata,
            tags: newImageTags,
            folderId: image.folderId,
            isDefective: false
          }),
        });

        if (updateResponse.ok) {
          // Add the new edited image to local state
          const newImage: StoredImage = {
            id: uploadedImage.id,
            name: newImageName,
            dataUri: uploadedImage.dataUri,
            width: uploadedImage.width || image.width,
            height: uploadedImage.height || image.height,
            folderId: image.folderId,
            metadata: newImageMetadata,
            tags: newImageTags,
            isDefective: false
          };
          
          setImages(prev => [newImage, ...prev]);
          toast({ title: "Image Edited", description: "A new AI-edited image has been added to your gallery." });
        } else {
          throw new Error('Failed to update image metadata');
        }
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

  const handleImageDrop = async (folderId: string | null, imageId: string) => {
    if (folderId === 'bin') {
      await handleUpdateImage(imageId, { isDefective: true, defectType: 'Manual', folderId: null });
      toast({ title: "Image Moved", description: "Image moved to Bin." });
    } else {
      const folder = folders.find(f => f.id === folderId);
      if (folder) {
        await handleUpdateImage(imageId, { folderId, isDefective: false });
        toast({ title: "Image Moved", description: `Image moved to "${folder.name}".` });
      } else if (folderId === null) {
        // Dropped on "Uncategorized"
        await handleUpdateImage(imageId, { folderId: null, isDefective: false });
        toast({ title: "Image Moved", description: `Image moved to "Uncategorized".` });
      }
    }
  };

  const handleToggleSelectionMode = () => {
    setSelectionMode(prev => !prev);
    setSelectedImageIds(new Set());
  };

  const handleImageSelection = (imageId: string) => {
    setSelectedImageIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(imageId)) {
        newSet.delete(imageId);
      } else {
        newSet.add(imageId);
      }
      return newSet;
    });
  };

  const handleImageClick = (imageId: string) => {
    if (selectionMode) {
      handleImageSelection(imageId);
    } else {
      setSelectedImageId(imageId);
    }
  };


  const handleBulkDelete = () => {
    setIsBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    const selectedIds = Array.from(selectedImageIds);
    
    try {
      if (activeView === "bin") {
        // Permanently delete images when in bin view
        const deletePromises = selectedIds.map(imageId => 
          fetch(`/api/images?imageId=${imageId}`, { method: 'DELETE' })
        );
        
        const results = await Promise.all(deletePromises);
        const successCount = results.filter(r => r.ok).length;
        
        if (successCount > 0) {
          setImages(prev => prev.filter(img => !selectedIds.includes(img.id)));
          toast({ 
            title: "Images Permanently Deleted", 
            description: `Successfully deleted ${successCount} ${successCount === 1 ? 'image' : 'images'} permanently.` 
          });
        }
        
        if (successCount < selectedIds.length) {
          toast({
            title: "Some deletions failed",
            description: `${selectedIds.length - successCount} images could not be deleted.`,
            variant: "destructive"
          });
        }
      } else {
        // Mark selected images as defective (move to bin) when not in bin view
        const updatePromises = selectedIds.map(imageId => 
          fetch('/api/images', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageId,
              isDefective: true,
              defectType: 'Manual',
              folderId: null
            })
          })
        );
        
        const results = await Promise.all(updatePromises);
        const successCount = results.filter(r => r.ok).length;
        
        if (successCount > 0) {
          setImages(prev => prev.map(img => 
            selectedIds.includes(img.id) 
              ? { ...img, isDefective: true, defectType: 'Manual', folderId: null }
              : img
          ));
          
          toast({ 
            title: "Images Moved to Bin", 
            description: `Successfully moved ${successCount} ${successCount === 1 ? 'image' : 'images'} to Bin.` 
          });
        }
        
        if (successCount < selectedIds.length) {
          toast({
            title: "Some moves failed",
            description: `${selectedIds.length - successCount} images could not be moved to bin.`,
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Bulk delete failed:', error);
      toast({
        title: "Bulk Delete Failed",
        description: "Failed to connect to the server.",
        variant: "destructive"
      });
    }
    
    setSelectionMode(false);
    setSelectedImageIds(new Set());
    setIsBulkDeleteDialogOpen(false);
  };

  const handleBulkExport = async () => {
    if (selectedImageIds.size === 0) return;
    
    const selectedImages = images.filter(img => selectedImageIds.has(img.id));
    setIsBulkExportDialogOpen(true);
    setExportProgress(0);
    setIsExportComplete(false);
    
    try {
      await exportImagesAsZip(selectedImages, (progress) => {
        setExportProgress(progress);
      });
      
      setIsExportComplete(true);
      toast({ 
        title: "Export Complete", 
        description: `Successfully exported ${selectedImages.length} ${selectedImages.length === 1 ? 'image' : 'images'}.` 
      });
      
      setSelectionMode(false);
      setSelectedImageIds(new Set());
    } catch (error) {
      console.error('Export failed:', error);
      toast({ 
        title: "Export Failed", 
        description: "There was an error exporting the images. Please try again.", 
        variant: "destructive" 
      });
      setIsBulkExportDialogOpen(false);
    }
  };

  const handleProcessAllImages = async () => {
    const imagesToProcess = images.filter(img => 
      !img.metadata || img.metadata.trim() === '' || 
      !img.tags || img.tags.length === 0
    );

    if (imagesToProcess.length === 0) {
      toast({
        title: "All Images Processed",
        description: "All images already have AI-generated information.",
      });
      return;
    }

    toast({
      title: "Processing Images",
      description: `Starting AI processing for ${imagesToProcess.length} images. This may take a few minutes.`,
    });

    let processedCount = 0;
    const batchSize = 3; // Process in smaller batches for better UX
    
    for (let i = 0; i < imagesToProcess.length; i += batchSize) {
      const batch = imagesToProcess.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (image) => {
        if (loadingStates[image.id]) return; // Skip if already processing

        setLoadingStates(prev => ({ ...prev, [image.id]: "Generating AI info..." }));

        try {
          // Convert file URL to data URI for AI processing
          const imageDataUri = await convertFileUrlToDataUri(image.dataUri);
          
          const [metadataRes, defectRes] = await Promise.all([
            generateImageMetadata({ photoDataUri: imageDataUri }),
            detectDefectiveImages({ photoDataUri: imageDataUri }),
          ]);
          
          // Update image with AI analysis results
          const imageUpdates = {
            name: metadataRes.title,
            metadata: metadataRes.metadata,
            tags: metadataRes.tags,
            isDefective: defectRes.isDefective,
            defectType: defectRes.defectType,
          };

          // Update in database
          const updateResponse = await fetch('/api/images', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              imageId: image.id,
              ...imageUpdates
            }),
          });

          if (updateResponse.ok) {
            // Update local state
            setImages(prev => prev.map(img => 
              img.id === image.id ? { ...img, ...imageUpdates } : img
            ));
            processedCount++;
          }
        } catch (error) {
          console.error(`Failed to process image ${image.id}:`, error);
        } finally {
          setLoadingStates(prev => {
            const next = { ...prev };
            delete next[image.id];
            return next;
          });
        }
      });

      // Wait for current batch to complete
      await Promise.all(batchPromises);
      
      // Show progress update
      if (i + batchSize < imagesToProcess.length) {
        toast({
          title: "Processing Progress",
          description: `Processed ${Math.min(i + batchSize, imagesToProcess.length)} of ${imagesToProcess.length} images...`,
        });
        // Small delay between batches
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    toast({
      title: "Processing Complete",
      description: `Successfully processed ${processedCount} of ${imagesToProcess.length} images.`,
    });
  };

  const displayedImages = useMemo(() => {
    const sourceImages = searchResults
      ? images.filter(img => searchResults.includes(img.id))
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

  const handleSelectAll = () => {
    if (!selectionMode) {
      setSelectionMode(true);
    }
    const allVisibleIds = new Set(displayedImages.map(img => img.id));
    setSelectedImageIds(allVisibleIds);
  };

  const handleUnselectAll = () => {
    setSelectedImageIds(new Set());
  };

  const allSelected = selectionMode && selectedImageIds.size > 0 && selectedImageIds.size === displayedImages.length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only handle shortcuts when not typing in inputs
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Ctrl/Cmd + A - Toggle select all/none
      if ((event.ctrlKey || event.metaKey) && event.key === 'a') {
        event.preventDefault();
        if (allSelected) {
          handleUnselectAll();
        } else {
          handleSelectAll();
        }
        return;
      }

      // Only handle these shortcuts in selection mode
      if (!selectionMode || selectedImageIds.size === 0) return;

      // Delete key - Move to bin
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        handleBulkDelete();
        return;
      }

      // Ctrl/Cmd + E - Bulk export
      if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        handleBulkExport();
        return;
      }

      // Escape - Exit selection mode
      if (event.key === 'Escape') {
        event.preventDefault();
        setSelectionMode(false);
        setSelectedImageIds(new Set());
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectionMode, selectedImageIds, displayedImages, handleBulkDelete, handleBulkExport, handleSelectAll, handleUnselectAll, allSelected]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading your gallery...</p>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <AppSidebar
          folders={folders}
          activeView={activeView}
          setActiveView={handleChangeActiveView}
          onCreateFolder={handleCreateFolder}
          onDeleteFolder={handleDeleteFolder}
          onImageDrop={handleImageDrop}
          onFileUpload={handleFileUpload}
        />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <div className="flex flex-col h-screen">
          <AppHeader
            onSearch={setSearchQuery}
            isSearching={isSearching}
            searchQuery={searchQuery}
            selectionMode={selectionMode}
            onToggleSelectionMode={handleToggleSelectionMode}
            selectedImageCount={selectedImageIds.size}
            onShare={() => setIsShareDialogOpen(true)}
            onOpenSharedGalleries={() => setIsSharedGalleriesOpen(true)}
            onBulkDelete={handleBulkDelete}
            onBulkExport={handleBulkExport}
            onSelectAll={handleSelectAll}
            onUnselectAll={handleUnselectAll}
            totalVisibleImages={displayedImages.length}
            allSelected={allSelected}
            onOpenSettings={() => setIsSettingsOpen(true)}
            activeView={activeView}
          />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            <ImageGrid
              images={displayedImages}
              loadingStates={loadingStates}
              onImageClick={handleImageClick}
              selectionMode={selectionMode}
              selectedImageIds={selectedImageIds}
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
      <ShareDialog
        isOpen={isShareDialogOpen}
        onOpenChange={setIsShareDialogOpen}
        selectedImages={images.filter(img => selectedImageIds.has(img.id)).map(img => ({
          id: img.id,
          dataUri: img.dataUri,
          name: img.name
        }))}
        selectedImageCount={selectedImageIds.size}
      />
      <SharedGalleriesManager
        isOpen={isSharedGalleriesOpen}
        onOpenChange={setIsSharedGalleriesOpen}
      />
      <BulkDeleteDialog
        isOpen={isBulkDeleteDialogOpen}
        onOpenChange={setIsBulkDeleteDialogOpen}
        onConfirm={handleConfirmBulkDelete}
        imageCount={selectedImageIds.size}
        isPermanent={activeView === "bin"}
      />
      <BulkExportDialog
        isOpen={isBulkExportDialogOpen}
        onOpenChange={setIsBulkExportDialogOpen}
        progress={exportProgress}
        isComplete={isExportComplete}
        imageCount={selectedImageIds.size}
      />
      <SettingsDialog
        isOpen={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        onProcessImages={handleProcessAllImages}
      />
    </SidebarProvider>
  );
}
