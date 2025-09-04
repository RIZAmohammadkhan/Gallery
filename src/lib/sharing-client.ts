// Client-safe sharing utility functions

export interface SharedGallery {
  id: string;
  title: string;
  images: Array<{
    id: string;
    name: string;
    dataUri: string;
    metadata?: string;
    tags?: string[];
    isDefective?: boolean;
    defectType?: string;
  }>;
  createdAt: Date;
  expiresAt?: Date;
  accessCount: number;
  ownerId?: string;
  isOwner?: boolean;
}

export function generateShareId(): string {
  return `share_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
