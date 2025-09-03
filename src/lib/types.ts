export interface StoredImage {
  id: string;
  name: string;
  dataUri: string;
  metadata?: string;
  folderId?: string | null;
  isDefective?: boolean;
  defectType?: string;
}

export interface Folder {
  id: string;
  name: string;
}
