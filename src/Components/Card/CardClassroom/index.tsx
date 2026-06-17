import { ConfirmDialog } from "primereact/confirmdialog";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClassroomContext } from "../../../Context/Classroom/context";
import { ClassroomTypes } from "../../../Context/Classroom/type";
import { Status } from "../../../Controller/controllerGlobal";
import { menuItem } from "../../../Services/localstorage";
import color from "../../../Styles/colors";
import { usePermissions } from "../../../hooks/usePermissions";
import IconClassroom from "./../../../Assets/images/cardturmas.svg";

const statusConfig: Record<string, { label: string; bg: string; text: string }> = {
  [Status.PENDING]:   { label: "Em andamento", bg: "rgba(252,173,9,0.16)",   text: "#9a6700" },
  [Status.APPROVED]:  { label: "Finalizada",   bg: "rgba(40,161,56,0.12)",   text: color.green },
  [Status.CANCELED]:  { label: "Cancelada",    bg: "rgba(237,90,104,0.12)",  text: color.red },
};

const CardClassroom = ({
  title,
  meetingCount,
  registrationCount,
  id,
  status,
}: {
  title: string;
  meetingCount?: number;
  registrationCount?: number;
  id: number;
  status?: string;
}) => {
  const history = useNavigate();
  const [visible, setVisible] = useState(false);
  const { can } = usePermissions();
  const props = useContext(ClassroomContext) as ClassroomTypes;

  const statusStyle = status
    ? statusConfig[status] ?? { label: status, bg: "#f0f0f0", text: "#999" }
    : null;

  return (
    <>
      <div
        onClick={() => { menuItem("4"); history(`/turma/${id}`); }}
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
            <img src={IconClassroom} alt="" style={{ height: 28, flexShrink: 0 }} />
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

          {can("classroom.delete") && (
            <div
              onClick={(e) => { e.stopPropagation(); setVisible(true); }}
              style={{ color: "#ccc", flexShrink: 0, padding: "2px 4px" }}
              className="cursor-pointer"
            >
              <i className="pi pi-trash" style={{ fontSize: "0.85rem" }} />
            </div>
          )}
        </div>


        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: "0.72rem", color: color.colorsBaseInkLight,
          }}>
            <i className="pi pi-users" style={{ fontSize: "0.72rem" }} />
            {registrationCount ?? 0} matriculado{registrationCount !== 1 ? "s" : ""}
          </span>

          <span style={{
            display: "flex", alignItems: "center", gap: 4,
            fontSize: "0.72rem", color: color.colorsBaseInkLight,
          }}>
            <i className="pi pi-calendar" style={{ fontSize: "0.72rem" }} />
            {meetingCount ?? 0} encontro{meetingCount !== 1 ? "s" : ""}
          </span>
        </div>

        {statusStyle && (
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
        )}
      </div>

      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmação"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteClassroom(id)}
        reject={() => setVisible(false)}
      />
    </>
  );
};

export default CardClassroom;
