import { ConfirmDialog } from "primereact/confirmdialog";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MeetingListContext } from "../../../Context/Classroom/Meeting/MeetingList/context";
import { MeetingListTypes } from "../../../Context/Classroom/Meeting/MeetingList/type";
import { formatarData, Status } from "../../../Controller/controllerGlobal";
import color from "../../../Styles/colors";
import { usePermissions } from "../../../hooks/usePermissions";
import IconMeeting from "./../../../Assets/images/meeting_card.svg";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  [Status.PENDING]:  { label: "Pendente",  bg: "rgba(252,173,9,0.16)",  text: "#9a6700" },
  [Status.APPROVED]: { label: "Aprovado",  bg: "rgba(40,161,56,0.12)",  text: color.green },
  [Status.REPROVED]: { label: "Reprovado", bg: "rgba(237,90,104,0.12)", text: color.red },
};

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

  const statusStyle = statusConfig[status] ?? { label: status, bg: "#f0f0f0", text: "#999" };

  return (
    <>
      <div
        onClick={() => history(`/turma/${id}/encontros/${idMeeting}`)}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "14px 16px",
          borderRadius: 12,
          border: "1px solid rgba(219,230,255,1)",
          background: color.colorCard,
          cursor: "pointer",
          transition: "box-shadow 0.15s",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
            <img src={IconMeeting} alt="" style={{ height: 28, flexShrink: 0 }} />
            <span style={{
              fontWeight: 700,
              fontSize: "0.92rem",
              color: color.colorsBaseInkNormal,
              wordBreak: "break-word",
              lineHeight: 1.3,
            }}>
              {title}
            </span>
          </div>

          {can("meeting.delete") && (
            <div
              onClick={(e) => { e.stopPropagation(); setVisible(true); }}
              style={{ color: "#ccc", flexShrink: 0, padding: "2px 4px" }}
              className="cursor-pointer"
            >
              <i className="pi pi-trash" style={{ fontSize: "0.85rem" }} />
            </div>
          )}
        </div>

        <span style={{
          display: "flex", alignItems: "center", gap: 4,
          fontSize: "0.72rem", color: color.colorsBaseInkLight,
        }}>
          <i className="pi pi-calendar" style={{ fontSize: "0.72rem" }} />
          {formatarData(data)}
        </span>

        <div>
          <span style={{
            fontSize: "0.7rem",
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: "999px",
            background: statusStyle.bg,
            color: statusStyle.text,
          }}>
            {statusStyle.label}
          </span>
        </div>
      </div>

      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmação"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteMeeting(idMeeting)}
        reject={() => setVisible(false)}
      />
    </>
  );
};

export default CardMeeting;
