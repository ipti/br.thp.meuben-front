import { ConfirmDialog } from "primereact/confirmdialog";
import Icon from "../../../../../../Components/Icon";
import {
  MeetingArc,
  MeetingListRegisterTypes,
} from "../../../../../../Context/Classroom/Meeting/MeetingListRegistration/type";
import styles from "../../../../../../Styles";
import { Column, Padding, Row } from "../../../../../../Styles/styles";
import { useContext, useState } from "react";
import { MeetingListRegistrationContext } from "../../../../../../Context/Classroom/Meeting/MeetingListRegistration/context";
import { Status } from "../../../../../../Controller/controllerGlobal";
import { usePermissions } from "../../../../../../hooks/usePermissions";

const ListArchivesAttendanceList = ({ item }: { item: MeetingArc }) => {
  const [visible, setVisible] = useState(false);
  const props = useContext(
    MeetingListRegistrationContext
  ) as MeetingListRegisterTypes;
  const { can } = usePermissions();
  const canUpload = can("meeting.uploadFiles");

  return (
    <>
      <div
        style={{
          padding: "22px 16px",
          background: "#ECF2FF",
          cursor: "pointer",
          borderRadius: "4px",
          marginBottom: "8px",
        }}
        onClick={() => {
          // window.open(
          //   item.archive_url ??
          //     process.env.REACT_APP_API_PATH +
          //       `archive-meeting-bff/${item.id}/` +
          //       item.original_name
          // );
        }}
      >
        <Row id="space-between">
          <Row>
            <img
              style={{ width: "30px", height: "30px" }}
              alt=""
              src={
                item.archive_url ??
                process.env.REACT_APP_API_PATH +
                  `archive-meeting-bff/${item.id}/` +
                  item.original_name
              }
            />
            <Padding />
            <Column id="center">{item.original_name}</Column>
          </Row>
          {canUpload && props.meeting?.status !== Status.APPROVED && (
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(true);
              }}
            >
              <Icon
                icon="pi pi-trash"
                color={styles.colors.colorGrayElephant}
                size="1rem"
                fontWeight="900"
              />
            </div>
          )}
        </Row>
      </div>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteArchiveMeeting(item.id)}
        reject={() => setVisible(false)}
      />
    </>
  );
};

export default ListArchivesAttendanceList;
