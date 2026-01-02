
import { ExportFormat, ProcessingResult } from '../types';

export const loadImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
};

export const transformImage = async (
  imageUrl: string,
  width: number,
  height: number,
  format: ExportFormat,
  originalName: string
): Promise<ProcessingResult> => {
  const img = await loadImage(imageUrl);
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  
  const ctx = canvas.getContext('2d', { alpha: format !== ExportFormat.JPEG });
  if (!ctx) throw new Error('Falha crítica no contexto do Canvas');

  // Ajuste de qualidade e suavização
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Fundo opaco para JPEG (não suporta transparência)
  if (format === ExportFormat.JPEG) {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
  }

  // Renderização final com escala
  ctx.drawImage(img, 0, 0, width, height);

  return new Promise((resolve, reject) => {
    // Verificamos o suporte nativo do navegador para o formato
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Falha na geração do Blob de saída.'));
          return;
        }
        
        const url = URL.createObjectURL(blob);
        const extension = format.split('/')[1].replace('jpeg', 'jpg');
        const baseName = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;
        const newName = `${baseName}_dt.${extension}`;
        
        resolve({ blob, url, name: newName });
      },
      format,
      format === ExportFormat.PNG ? undefined : 0.95
    );
  });
};
