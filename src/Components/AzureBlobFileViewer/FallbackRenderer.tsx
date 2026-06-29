import React from 'react';
import styled from 'styled-components';

interface FallbackRendererProps {
  url: string;
  filename?: string;
}

const FallbackContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 32px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1.5px dashed #cbd5e1;
  text-align: center;
`;

const FileIcon = styled.div`
  font-size: 48px;
`;

const FileName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  word-break: break-all;
`;

const FileType = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
`;

const DownloadButton = styled.a`
  padding: 8px 16px;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  text-decoration: none;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  border: 1.5px solid #3b82f6;

  &:hover {
    background: #2563eb;
    border-color: #2563eb;
  }

  &:active {
    transform: scale(0.98);
  }
`;

const getFileIcon = (filename?: string) => {
  if (!filename) return '📄';

  const ext = filename.toLowerCase().split('.').pop() || '';
  const iconMap: Record<string, string> = {
    pdf: '📕',
    doc: '📄',
    docx: '📄',
    xls: '📊',
    xlsx: '📊',
    zip: '📦',
    rar: '📦',
    txt: '📝',
    csv: '📊',
  };

  return iconMap[ext] || '📄';
};

export const FallbackRenderer: React.FC<FallbackRendererProps> = ({
  url,
  filename = 'arquivo',
}) => {
  return (
    <FallbackContainer>
      <FileIcon>{getFileIcon(filename)}</FileIcon>
      <div>
        <FileName>{filename}</FileName>
        <FileType>Tipo de arquivo não suportado para visualização</FileType>
      </div>
      <DownloadButton
        href={url}
        download={filename}
        target="_blank"
        rel="noopener noreferrer"
      >
        ↓ Baixar arquivo
      </DownloadButton>
    </FallbackContainer>
  );
};
