import React, { useMemo } from 'react';
import styled from 'styled-components';
import { useFileType } from './useFileType';
import { useHeicConverter } from './useHeicConverter';
import { ImageRenderer } from './ImageRenderer';
import { PdfRenderer } from './PdfRenderer';
import { FallbackRenderer } from './FallbackRenderer';

interface AzureBlobFileViewerProps {
  url: string;
  filename?: string;
  contentType?: string;
  className?: string;
  onError?: (error: Error) => void;
}

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 300px;
  padding: 24px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
  background: #f8fafc;
  border-radius: 8px;
`;

const SkeletonLoader = styled.div`
  width: 100%;
  height: 300px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
  border-radius: 8px;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #fee2e2;
  border-radius: 8px;
  border: 1.5px solid #fca5a5;
  color: #991b1b;
  text-align: center;
`;

const ErrorIcon = styled.div`
  font-size: 32px;
`;

const ErrorTitle = styled.p`
  font-size: 14px;
  font-weight: 600;
  margin: 0;
`;

const ErrorMessage = styled.p`
  font-size: 12px;
  color: #7c2d12;
  margin: 0;
`;

const HeicConvertingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 300px;
  padding: 24px;
  background: #fdf4ff;
  border-radius: 8px;
  border: 1.5px solid #d8b4fe;
  color: #7e22ce;
  text-align: center;
`;

const ConvertingText = styled.p`
  font-size: 13px;
  font-weight: 600;
  margin: 0;
`;

const ConvertingLoader = styled.div`
  width: 24px;
  height: 24px;
  border: 2px solid #d8b4fe;
  border-top-color: #7e22ce;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export const AzureBlobFileViewer: React.FC<AzureBlobFileViewerProps> = ({
  url,
  filename,
  contentType,
  className,
  onError,
}) => {
  const { fileType, isLoading: isTypeLoading, error: typeError } = useFileType(
    url,
    contentType
  );

  const { convertedUrl, isConverting, error: conversionError } = useHeicConverter(
    fileType === 'image-heic' ? url : ''
  );

  const finalImageUrl = useMemo(
    () => (fileType === 'image-heic' ? convertedUrl : url),
    [fileType, convertedUrl, url]
  );

  const hasError = typeError || conversionError;

  // Se está detectando tipo
  if (isTypeLoading) {
    return (
      <Container className={className}>
        <SkeletonLoader />
      </Container>
    );
  }

  // Se houve erro na detecção
  if (hasError && !isTypeLoading) {
    return (
      <Container className={className}>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <div>
            <ErrorTitle>Erro ao carregar arquivo</ErrorTitle>
            <ErrorMessage>{hasError}</ErrorMessage>
          </div>
          {filename && (
            <a
              href={url}
              download={filename}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                background: '#991b1b',
                color: 'white',
                borderRadius: '6px',
                textDecoration: 'none',
                fontSize: '12px',
                fontWeight: '600',
              }}
            >
              ↓ Baixar arquivo
            </a>
          )}
        </ErrorContainer>
      </Container>
    );
  }

  // Se está convertendo HEIC
  if (fileType === 'image-heic' && isConverting) {
    return (
      <Container className={className}>
        <HeicConvertingContainer>
          <ConvertingLoader />
          <ConvertingText>Convertendo HEIC…</ConvertingText>
        </HeicConvertingContainer>
      </Container>
    );
  }

  // Se falhou conversão HEIC
  if (fileType === 'image-heic' && conversionError && !convertedUrl) {
    return (
      <Container className={className}>
        <ErrorContainer>
          <ErrorIcon>⚠️</ErrorIcon>
          <div>
            <ErrorTitle>Erro ao converter imagem HEIC</ErrorTitle>
            <ErrorMessage>{conversionError}</ErrorMessage>
          </div>
          <a
            href={url}
            download={filename}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: '#7e22ce',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            ↓ Baixar HEIC
          </a>
        </ErrorContainer>
      </Container>
    );
  }

  // Renderizar de acordo com o tipo
  switch (fileType) {
    case 'image-native':
      return (
        <Container className={className}>
          <ImageRenderer src={url} alt={filename} onError={() => onError?.(new Error('Erro ao carregar imagem'))} />
        </Container>
      );

    case 'image-heic':
      if (!finalImageUrl) {
        return (
          <Container className={className}>
            <LoadingContainer>Convertendo HEIC…</LoadingContainer>
          </Container>
        );
      }
      return (
        <Container className={className}>
          <ImageRenderer src={finalImageUrl} alt={filename} onError={() => onError?.(new Error('Erro ao carregar imagem HEIC convertida'))} />
        </Container>
      );

    case 'pdf':
      return (
        <Container className={className}>
          <PdfRenderer src={url} onError={() => onError?.(new Error('Erro ao carregar PDF'))} />
        </Container>
      );

    case 'unknown':
    default:
      return (
        <Container className={className}>
          <FallbackRenderer url={url} filename={filename} />
        </Container>
      );
  }
};

export default AzureBlobFileViewer;
