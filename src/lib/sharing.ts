// Sharing utility functions for image galleries

export interface SharedGallery {
  id: string;
  title: string;
  images: Array<{
    id: string;
    name: string;
    dataUri: string;
  }>;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
}

// In a real application, this would be a database
const sharedGalleries = new Map<string, SharedGallery>();

export function generateShareId(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createSharedGallery(
  title: string,
  images: Array<{ id: string; name: string; dataUri: string }>,
  expirationDays?: number
): string {
  const shareId = generateShareId();
  const now = new Date();
  const expiresAt = expirationDays 
    ? new Date(now.getTime() + expirationDays * 24 * 60 * 60 * 1000)
    : undefined;

  const sharedGallery: SharedGallery = {
    id: shareId,
    title,
    images,
    createdAt: now,
    expiresAt,
    accessCount: 0
  };

  sharedGalleries.set(shareId, sharedGallery);
  
  // In a real app, save to database here
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sharedGalleries') || '{}';
      const galleries = JSON.parse(stored);
      galleries[shareId] = {
        ...sharedGallery,
        createdAt: sharedGallery.createdAt.toISOString(),
        expiresAt: sharedGallery.expiresAt?.toISOString()
      };
      localStorage.setItem('sharedGalleries', JSON.stringify(galleries));
    } catch (error) {
      console.warn('Failed to save shared gallery to localStorage:', error);
    }
  }

  return shareId;
}

export function getSharedGallery(shareId: string): SharedGallery | null {
  // First check in-memory cache
  let gallery = sharedGalleries.get(shareId);
  
  // If not in memory, try to load from localStorage
  if (!gallery && typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sharedGalleries') || '{}';
      const galleries = JSON.parse(stored);
      const storedGallery = galleries[shareId];
      
      if (storedGallery) {
        const loadedGallery: SharedGallery = {
          ...storedGallery,
          createdAt: new Date(storedGallery.createdAt),
          expiresAt: storedGallery.expiresAt ? new Date(storedGallery.expiresAt) : undefined
        };
        sharedGalleries.set(shareId, loadedGallery);
        gallery = loadedGallery;
      }
    } catch (error) {
      console.warn('Failed to load shared gallery from localStorage:', error);
      return null;
    }
  }

  if (!gallery) {
    return null;
  }

  // Check if gallery has expired
  if (gallery.expiresAt && gallery.expiresAt < new Date()) {
    deleteSharedGallery(shareId);
    return null;
  }

  // Increment access count - gallery is guaranteed to be defined here
  const updatedGallery = { ...gallery, accessCount: gallery.accessCount + 1 };
  sharedGalleries.set(shareId, updatedGallery);
  
  // Update localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sharedGalleries') || '{}';
      const galleries = JSON.parse(stored);
      if (galleries[shareId]) {
        galleries[shareId].accessCount = updatedGallery.accessCount;
        localStorage.setItem('sharedGalleries', JSON.stringify(galleries));
      }
    } catch (error) {
      console.warn('Failed to update access count in localStorage:', error);
    }
  }

  return updatedGallery;
}

export function deleteSharedGallery(shareId: string): boolean {
  const deleted = sharedGalleries.delete(shareId);
  
  // Remove from localStorage
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sharedGalleries') || '{}';
      const galleries = JSON.parse(stored);
      delete galleries[shareId];
      localStorage.setItem('sharedGalleries', JSON.stringify(galleries));
    } catch (error) {
      console.warn('Failed to delete shared gallery from localStorage:', error);
    }
  }
  
  return deleted;
}

export function listSharedGalleries(): SharedGallery[] {
  // Load from localStorage if not in memory
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem('sharedGalleries') || '{}';
      const galleries = JSON.parse(stored);
      
      Object.entries(galleries).forEach(([shareId, storedGallery]: [string, any]) => {
        if (!sharedGalleries.has(shareId)) {
          const gallery: SharedGallery = {
            ...storedGallery,
            createdAt: new Date(storedGallery.createdAt),
            expiresAt: storedGallery.expiresAt ? new Date(storedGallery.expiresAt) : undefined
          };
          sharedGalleries.set(shareId, gallery);
        }
      });
    } catch (error) {
      console.warn('Failed to load shared galleries from localStorage:', error);
    }
  }

  return Array.from(sharedGalleries.values())
    .filter(gallery => !gallery.expiresAt || gallery.expiresAt > new Date())
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export function cleanupExpiredGalleries(): number {
  const now = new Date();
  let cleanedCount = 0;
  
  for (const [shareId, gallery] of sharedGalleries.entries()) {
    if (gallery.expiresAt && gallery.expiresAt < now) {
      deleteSharedGallery(shareId);
      cleanedCount++;
    }
  }
  
  return cleanedCount;
}

export function getShareUrl(shareId: string, baseUrl?: string): string {
  const base = baseUrl || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/share/${shareId}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
  if (typeof window === 'undefined' || !navigator.clipboard) {
    return Promise.resolve(false);
  }
  
  return navigator.clipboard.writeText(text)
    .then(() => true)
    .catch(() => false);
}
