import { useState, useEffect } from 'react';

type FileType = 'image-native' | 'image-heic' | 'pdf' | 'unknown';

const NATIVE_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp'];
const HEIC_EXTENSIONS = ['.heic', '.heif'];
const PDF_EXTENSIONS = ['.pdf'];

const CONTENT_TYPE_MAP: Record<string, FileType> = {
  'image/jpeg': 'image-native',
  'image/png': 'image-native',
  'image/gif': 'image-native',
  'image/webp': 'image-native',
  'image/svg+xml': 'image-native',
  'image/bmp': 'image-native',
  'image/heic': 'image-heic',
  'image/heif': 'image-heic',
  'application/pdf': 'pdf',
};

export const useFileType = (url: string, contentType?: string) => {
  const [fileType, setFileType] = useState<FileType>('unknown');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const detectType = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Etapa 1: Tentar extrair extensão da URL
        const urlObj = new URL(url);
        const pathname = urlObj.pathname.toLowerCase();
        const queryIndex = pathname.lastIndexOf('?');
        const pathWithoutQuery =
          queryIndex !== -1 ? pathname.substring(0, queryIndex) : pathname;
        const lastDot = pathWithoutQuery.lastIndexOf('.');
        const extension = lastDot !== -1 ? pathWithoutQuery.substring(lastDot) : '';

        // Checagem rápida se extensão é conhecida
        if (extension) {
          if (NATIVE_IMAGE_EXTENSIONS.includes(extension)) {
            setFileType('image-native');
            setIsLoading(false);
            return;
          }
          if (HEIC_EXTENSIONS.includes(extension)) {
            setFileType('image-heic');
            setIsLoading(false);
            return;
          }
          if (PDF_EXTENSIONS.includes(extension)) {
            setFileType('pdf');
            setIsLoading(false);
            return;
          }
        }

        // Etapa 2: Usar contentType se fornecido
        if (contentType) {
          const type = CONTENT_TYPE_MAP[contentType.toLowerCase()];
          if (type) {
            setFileType(type);
            setIsLoading(false);
            return;
          }
        }

        // Etapa 3: Fallback — HEAD request para Content-Type
        const response = await fetch(url, { method: 'HEAD' });
        const ct = response.headers.get('content-type')?.toLowerCase() || '';

        const detectedType = CONTENT_TYPE_MAP[ct] || 'unknown';
        setFileType(detectedType);
      } catch (err) {
        console.error('Erro ao detectar tipo de arquivo:', err);
        // Se falhar o HEAD, tenta carregar como imagem nativa (fallback)
        setFileType('unknown');
        setError(
          err instanceof Error ? err.message : 'Erro ao detectar tipo de arquivo'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (url) {
      detectType();
    }
  }, [url, contentType]);

  return { fileType, isLoading, error };
};
