import React, { useState } from 'react';
import styled from 'styled-components';

interface ImageRendererProps {
  src: string;
  alt?: string;
  onError?: () => void;
}

const ImageContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
  max-height: 600px;

  img {
    max-width: 100%;
    max-height: 600px;
    object-fit: contain;
  }
`;

const SkeletonLoader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 300px;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }
`;

export const ImageRenderer: React.FC<ImageRendererProps> = ({
  src,
  alt = 'Imagem',
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    onError?.();
  };

  return (
    <ImageContainer>
      {isLoading && <SkeletonLoader />}
      <img
        src={src}
        alt={alt}
        onLoad={handleLoadingComplete}
        onError={handleError}
        style={{ display: isLoading ? 'none' : 'block' }}
      />
    </ImageContainer>
  );
};
