import { ConfirmDialog } from "primereact/confirmdialog";
import { useContext, useState } from "react";
import styled, { keyframes } from "styled-components";
import Icon from "../../../../../../Components/Icon";
import {
  MeetingArc,
  MeetingListRegisterTypes,
} from "../../../../../../Context/Classroom/Meeting/MeetingListRegistration/type";
import { MeetingListRegistrationContext } from "../../../../../../Context/Classroom/Meeting/MeetingListRegistration/context";
import { Status } from "../../../../../../Controller/controllerGlobal";
import { usePermissions } from "../../../../../../hooks/usePermissions";
import styles from "../../../../../../Styles";
import { useHeicConverter } from "../../../../../../Components/AzureBlobFileViewer/useHeicConverter";

const NATIVE_IMAGE_EXTS = new Set([
  "jpg", "jpeg", "png", "gif", "webp", "svg", "bmp",
]);
const HEIC_EXTS = new Set(["heic", "heif"]);

const getExt = (filename: string) =>
  filename.toLowerCase().split(".").pop() || "";

const isNativeImage = (filename: string) => NATIVE_IMAGE_EXTS.has(getExt(filename));
const isHeicImage  = (filename: string) => HEIC_EXTS.has(getExt(filename));

const EXTENSION_CONFIG: Record<
  string,
  { icon: string; color: string; bg: string }
> = {
  pdf:  { icon: "pi pi-file-pdf",   color: "#dc2626", bg: "#fee2e2" },
  jpg:  { icon: "pi pi-image",      color: "#0284c7", bg: "#e0f2fe" },
  jpeg: { icon: "pi pi-image",      color: "#0284c7", bg: "#e0f2fe" },
  png:  { icon: "pi pi-image",      color: "#0284c7", bg: "#e0f2fe" },
  gif:  { icon: "pi pi-image",      color: "#0284c7", bg: "#e0f2fe" },
  webp: { icon: "pi pi-image",      color: "#0284c7", bg: "#e0f2fe" },
  heic: { icon: "pi pi-image",      color: "#7c3aed", bg: "#ede9fe" },
  heif: { icon: "pi pi-image",      color: "#7c3aed", bg: "#ede9fe" },
  mp4:  { icon: "pi pi-video",      color: "#d97706", bg: "#fef3c7" },
  mov:  { icon: "pi pi-video",      color: "#d97706", bg: "#fef3c7" },
  doc:  { icon: "pi pi-file",       color: "#1d4ed8", bg: "#dbeafe" },
  docx: { icon: "pi pi-file",       color: "#1d4ed8", bg: "#dbeafe" },
  xls:  { icon: "pi pi-file-excel", color: "#166534", bg: "#dcfce7" },
  xlsx: { icon: "pi pi-file-excel", color: "#166534", bg: "#dcfce7" },
};

const DEFAULT_EXT_CONFIG = {
  icon: "pi pi-file",
  color: styles.colors.colorGrayElephant,
  bg: styles.colors.colorsBaseCloudNormal,
};

const getExtensionConfig = (filename: string) => {
  const ext = filename.toLowerCase().split(".").pop() || "";
  return EXTENSION_CONFIG[ext] ?? DEFAULT_EXT_CONFIG;
};

const formatFileSize = (bytes: number) => {
  if (!bytes || bytes === 0) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getExtensionLabel = (filename: string) => {
  return (filename.toLowerCase().split(".").pop() || "").toUpperCase();
};

const shimmer = keyframes`
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
`;

const ThumbnailWrapper = styled.div<{ bg: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${(p) => p.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
`;

const ThumbnailImg = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
`;

const ThumbnailSkeleton = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const HeicThumbnail = ({ url, bg }: { url: string; bg: string }) => {
  const { convertedUrl, isConverting } = useHeicConverter(url);

  if (isConverting) {
    return (
      <ThumbnailWrapper bg={bg}>
        <ThumbnailSkeleton />
      </ThumbnailWrapper>
    );
  }

  if (convertedUrl) {
    return (
      <ThumbnailWrapper bg={bg}>
        <ThumbnailImg src={convertedUrl} alt="" />
      </ThumbnailWrapper>
    );
  }

  return (
    <ThumbnailWrapper bg={bg}>
      <i className="pi pi-image" style={{ color: "#7c3aed", fontSize: 18 }} />
    </ThumbnailWrapper>
  );
};

const NativeImageThumbnail = ({
  url,
  bg,
  icon,
  color,
}: {
  url: string;
  bg: string;
  icon: string;
  color: string;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <ThumbnailWrapper bg={bg}>
      {!loaded && !error && <ThumbnailSkeleton />}
      {!error ? (
        <ThumbnailImg
          src={url}
          alt=""
          style={{ display: loaded ? "block" : "none" }}
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
        />
      ) : (
        <i className={icon} style={{ color, fontSize: 18 }} />
      )}
    </ThumbnailWrapper>
  );
};

const FileCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: ${styles.colors.colorCard};
  border: 1.5px solid ${styles.colors.colorBorderCard};
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover {
    border-color: ${styles.colors.blue};
    background: ${styles.colors.colorsBaseProductLighter};
  }
`;

const FileIconWrapper = styled.div<{ bg: string; color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background: ${(p) => p.bg};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  i {
    color: ${(p) => p.color};
    font-size: 18px;
  }
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  color: ${styles.colors.colorsBaseInkNormal};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 3px;
`;

const FileTag = styled.span<{ color: string; bg: string }>`
  padding: 1px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.04em;
  background: ${(p) => p.bg};
  color: ${(p) => p.color};
`;

const FileSize = styled.span`
  font-size: 11px;
  color: ${styles.colors.colorsBaseInkLight};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
`;

const IconButton = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s;
  cursor: pointer;

  &:hover {
    background: ${styles.colors.colorsBaseCloudNormal};
  }
`;

const ListArchivesAttendanceList = ({ item }: { item: MeetingArc }) => {
  const [visible, setVisible] = useState(false);
  const props = useContext(
    MeetingListRegistrationContext
  ) as MeetingListRegisterTypes;
  const { can } = usePermissions();
  const canUpload = can("meeting.uploadFiles");

  const extConfig = getExtensionConfig(item.original_name);
  const extLabel = getExtensionLabel(item.original_name);
  const fileSize = formatFileSize(item.size);

  return (
    <>
      <FileCard>
        {isNativeImage(item.original_name) ? (
          <NativeImageThumbnail
            url={item.archive_url}
            bg={extConfig.bg}
            icon={extConfig.icon}
            color={extConfig.color}
          />
        ) : isHeicImage(item.original_name) ? (
          <HeicThumbnail url={item.archive_url} bg={extConfig.bg} />
        ) : (
          <FileIconWrapper bg={extConfig.bg} color={extConfig.color}>
            <i className={extConfig.icon} />
          </FileIconWrapper>
        )}

        <FileInfo>
          <FileName title={item.original_name}>{item.original_name}</FileName>
          <FileMeta>
            <FileTag color={extConfig.color} bg={extConfig.bg}>
              {extLabel}
            </FileTag>
            {fileSize && <FileSize>{fileSize}</FileSize>}
          </FileMeta>
        </FileInfo>

        <Actions>
          <IconButton
            title="Baixar"
            onClick={(e) => {
              e.stopPropagation();
              window.open(item.archive_url, "_blank", "noopener,noreferrer");
            }}
          >
            <Icon
              icon="pi pi-download"
              color={styles.colors.colorGrayElephant}
              size="0.9rem"
              fontWeight="700"
            />
          </IconButton>

          {canUpload && props.meeting?.status !== Status.APPROVED && (
            <IconButton
              title="Excluir"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(true);
              }}
            >
              <Icon
                icon="pi pi-trash"
                color={styles.colors.red}
                size="0.9rem"
                fontWeight="700"
              />
            </IconButton>
          )}
        </Actions>
      </FileCard>

      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja excluir este arquivo?"
        header="Excluir arquivo"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteArchiveMeeting(item.id)}
        reject={() => setVisible(false)}
      />
    </>
  );
};

export default ListArchivesAttendanceList;
