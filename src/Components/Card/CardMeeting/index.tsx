import { useNavigate, useParams } from "react-router-dom";
import { Container } from "./style";
import { Column, Padding, Row } from "../../../Styles/styles";
import Icon from "../../Icon";
import {
  formatarData,
  ROLE,
  Status,
} from "../../../Controller/controllerGlobal";
import { useContext, useState } from "react";
import { MeetingListContext } from "../../../Context/Classroom/Meeting/MeetingList/context";
import { MeetingListTypes } from "../../../Context/Classroom/Meeting/MeetingList/type";
import { ConfirmDialog } from "primereact/confirmdialog";
import { usePermissions } from "../../../hooks/usePermissions";
import IconMeeting from "./../../../Assets/images/meeting_card.svg";
import IconCalendar from "./../../../Assets/images/calendar.svg";
import IconStatus from "./../../../Assets/images/published_with_changes.svg";

const CardMeeting = ({
  title,
  data,
  status,
  idMeeting,
}: {
  title: string;
  data: string;
  status: string;
  idMeeting: number;
}) => {
  const history = useNavigate();
  const [visible, setVisible] = useState(false);
  const { can } = usePermissions();

  const { id } = useParams();

  const props = useContext(MeetingListContext) as MeetingListTypes;

  return (
    <>
      <Container
        className="card"
        onClick={() => history(`/turma/${id}/encontros/${idMeeting}`)}
      >
        <Row id="space-between">
          <Row>
            <div className={`boxQuantity`}>
              <img src={IconMeeting} alt="" style={{ height: 32 }} />
            </div>
            <Padding padding="4px" />
            <Column id="center">
              <h3>{title}</h3>
            </Column>
          </Row>
          {can("meeting.delete") && (
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setVisible(true);
              }}
            >
              <Icon icon="pi pi-trash" size="1rem" />
            </div>
          )}
        </Row>
        <Padding padding="8px" />
        <Row id="space-between">
          <Column>
            <div className={"boxYear"}>
              <Column id="center" style={{ height: "100%" }}>
                <Row>
                  <img
                    src={IconCalendar}
                    alt=""
                    style={{ height: 16, marginRight: 2 }}
                  />
                  <p style={{ fontSize: "14px" }}>Data: {formatarData(data)}</p>
                </Row>
              </Column>
            </div>
          </Column>
          <Row>
            <img
              src={IconStatus}
              alt=""
              style={{ height: 16, marginRight: 2 }}
            />
            <Row style={{ fontSize: "14px" }}>
              Status: {" "}<Padding padding="2px" />
              {status === Status.PENDING ? (
                <p style={{ fontWeight: "600" }}> Pendente</p>
              ) : status === Status.APPROVED ? (
                <p style={{ fontWeight: "600" }}> Aprovado</p>
              ) : status === Status.REPROVED ? (
                <p style={{ fontWeight: "600" }}> Reprovado</p>
              ) : null}
            </Row>
          </Row>
        </Row>
      </Container>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteMeeting(idMeeting)}
        reject={() => setVisible(false)}
      />
    </>
  );
};

export default CardMeeting;
