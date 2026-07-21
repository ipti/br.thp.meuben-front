import { useState, useEffect } from 'react';
import heic2any from 'heic2any';

const isSafari = () =>
  /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

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

        // Safari suporta HEIC nativamente — usar URL direta
        if (isSafari()) {
          setConvertedUrl(url);
          return;
        }

        // Baixar arquivo HEIC como ArrayBuffer
        const response = await fetch(url, { mode: 'cors' });
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();

        // Converter para JPEG
        const converted = await heic2any({
          blob: new Blob([arrayBuffer], { type: 'image/heic' }),
          toType: 'image/jpeg',
          quality: 0.85,
        });

        // Criar Object URL do Blob convertido
        const blob = Array.isArray(converted) ? converted[0] : converted;
        objectUrl = URL.createObjectURL(blob);
        setConvertedUrl(objectUrl);
      } catch (err) {
        console.error('Erro ao converter HEIC:', err);
        // heic2any throws plain objects like { code: 1, message: '...' }, not Error instances
        let errorMsg = 'Erro ao converter arquivo HEIC';
        if (err instanceof Error) {
          errorMsg = err.message;
        } else if (err && typeof err === 'object' && 'message' in err) {
          errorMsg = String((err as { message: unknown }).message);
        } else if (typeof err === 'string') {
          errorMsg = err;
        }
        setError(errorMsg);
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
