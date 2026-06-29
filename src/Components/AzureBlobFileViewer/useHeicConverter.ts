import { useState, useEffect } from 'react';
import heic2any from 'heic2any';

export const useHeicConverter = (url: string) => {
  const [convertedUrl, setConvertedUrl] = useState<string | null>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let objectUrl: string | null = null;

    const convertHeic = async () => {
      try {
        setIsConverting(true);
        setError(null);

        // Baixar arquivo HEIC como ArrayBuffer
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        // Converter para JPEG
        const converted = await heic2any({
          blob: new Blob([arrayBuffer], { type: 'image/heic' }),
          toType: 'image/jpeg',
        });

        // Criar Object URL do Blob convertido
        const blob = Array.isArray(converted) ? converted[0] : converted;
        objectUrl = URL.createObjectURL(blob);
        setConvertedUrl(objectUrl);
      } catch (err) {
        console.error('Erro ao converter HEIC:', err);
        setError(
          err instanceof Error ? err.message : 'Erro ao converter arquivo HEIC'
        );
      } finally {
        setIsConverting(false);
      }
    };

    if (url) {
      convertHeic();
    }

    // Cleanup: revogar Object URL
    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [url]);

  return { convertedUrl, isConverting, error };
};
