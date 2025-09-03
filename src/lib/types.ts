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
  data_ai_hint?: string;
}

export interface Folder {
  id: string;
  name: string;
}
