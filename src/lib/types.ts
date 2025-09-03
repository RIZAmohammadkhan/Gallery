export interface StoredImage {
  id: string;
  name: string;
  dataUri: string;
  metadata?: string;
  tags?: string[];
  folderId?: string | null;
  isDefective?: boolean;
  defectType?: string;
  width?: number;
  height?: number;
}

export interface Folder {
  id: string;
  name: string;
}
