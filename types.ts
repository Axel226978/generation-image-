export interface GeneratedImage {
  id: string; // Unique ID for each generated image
  url: string | null;
  prompt: string;
  loading: boolean;
  error?: string;
}

export interface SeoResult {
  title: string;
  titleOptions: string[]; // 5 titres alternatifs
  description: string;
  tags: string;
  category: string;
}

export interface ImageDimension {
  width: number;
  height: number;
}

export interface UploadedImage {
  data: string; // Base64 string without prefix
  mimeType: string;
  id: string; // To handle UI keys
}