import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';
import styled from 'styled-components';

// Worker copiado para public/ — compatível com react-pdf v10 / pdfjs v5
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

interface PdfRendererProps {
  src: string;
  onError?: () => void;
}

const PdfContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  max-height: 800px;
  overflow-y: auto;
`;

const PageControls = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
`;

const PageButton = styled.button`
  padding: 6px 12px;
  border-radius: 6px;
  border: 1px solid #cbd5e1;
  background: white;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #f1f5f9;
    border-color: #94a3b8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  font-size: 12px;
  color: #475569;
  font-weight: 500;
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #64748b;
  font-size: 14px;
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 24px;
  background: #fee2e2;
  border-radius: 8px;
  color: #991b1b;
  text-align: center;
`;

export const PdfRenderer: React.FC<PdfRendererProps> = ({ src, onError }) => {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
  };

  const onDocumentLoadError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  if (hasError) {
    return (
      <ErrorContainer>
        <div>Erro ao carregar PDF</div>
        <a href={src} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', textDecoration: 'underline' }}>
          Abrir em nova aba
        </a>
      </ErrorContainer>
    );
  }

  return (
    <PdfContainer>
      {isLoading && <LoadingContainer>Carregando PDF…</LoadingContainer>}
      <Document
        file={src}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={null}
      >
        <Page pageNumber={currentPage} width={600} />
      </Document>

      {numPages && numPages > 1 && (
        <PageControls>
          <PageButton
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
          >
            ← Anterior
          </PageButton>
          <PageInfo>
            {currentPage} / {numPages}
          </PageInfo>
          <PageButton
            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
            disabled={currentPage === numPages}
          >
            Próximo →
          </PageButton>
        </PageControls>
      )}
    </PdfContainer>
  );
};
