import { useEffect, useState } from "react";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { MeetingArc } from "../../../../../../Context/Classroom/Meeting/MeetingListRegistration/type";
import { Padding } from "../../../../../../Styles/styles";
import AzureBlobFileViewer from "../../../../../../Components/AzureBlobFileViewer";
import styled from "styled-components";

interface ModalFilesProps {
  item: MeetingArc[];
  onHide: () => void;
  visible: boolean;
  index: number;
}

const FileNavigationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background: #f8fafc;
  border-radius: 8px;
`;

const FileInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const FileName = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: #334155;
  margin: 0;
  word-break: break-word;
`;

const FileCounter = styled.p`
  font-size: 12px;
  color: #64748b;
  margin: 0;
`;

const NavigationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ModalFiles = ({ item, onHide, visible, index }: ModalFilesProps) => {
  const [currentIndex, setCurrentIndex] = useState(index);

  // Sincroniza quando o usuário clica num arquivo diferente
  useEffect(() => {
    setCurrentIndex(index);
  }, [index]);

  if (!item || item.length === 0) {
    return (
      <Dialog onHide={onHide} visible={visible} header="Evidências do encontro">
        <Padding>
          <p>Nenhum arquivo disponível</p>
        </Padding>
      </Dialog>
    );
  }

  const currentFile = item[currentIndex];
  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? item.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === item.length - 1 ? 0 : prev + 1));
  };

  return (
    <Dialog
      onHide={onHide}
      visible={visible}
      header="Evidências do encontro"
      style={{ width: "90vw" }}
      maximizable
    >
      <Padding>
        {item.length > 1 && (
          <FileNavigationContainer>
            <FileInfo>
              <FileName>{currentFile?.original_name}</FileName>
              <FileCounter>
                Arquivo {currentIndex + 1} de {item.length}
              </FileCounter>
            </FileInfo>
            <NavigationButtons>
              <Button
                icon="pi pi-chevron-left"
                rounded
                text
                onClick={handlePrevious}
                title="Arquivo anterior"
              />
              <Button
                icon="pi pi-chevron-right"
                rounded
                text
                onClick={handleNext}
                title="Próximo arquivo"
              />
            </NavigationButtons>
          </FileNavigationContainer>
        )}

        <div style={{ marginTop: "16px" }}>
          <AzureBlobFileViewer
            url={currentFile?.archive_url}
            filename={currentFile?.original_name}
            onError={(error) =>
              console.error("Erro ao carregar arquivo:", error)
            }
          />
        </div>
      </Padding>
    </Dialog>
  );
};

export default ModalFiles;