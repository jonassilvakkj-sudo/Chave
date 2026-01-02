
export enum ExportFormat {
  PNG = 'image/png',
  JPEG = 'image/jpeg',
  WEBP = 'image/webp',
  BMP = 'image/bmp'
}

export interface ImageState {
  file: File | null;
  previewUrl: string | null;
  originalWidth: number;
  originalHeight: number;
  width: number;
  height: number;
  aspectRatio: number;
  format: ExportFormat;
  maintainAspectRatio: boolean;
}

export interface ProcessingResult {
  blob: Blob;
  url: string;
  name: string;
}
