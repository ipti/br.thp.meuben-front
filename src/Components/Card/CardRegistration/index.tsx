import { ConfirmDialog } from "primereact/confirmdialog";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import avatar from "../../../Assets/images/avatar.svg";
import { RegistrationClassroomContext } from "../../../Context/Classroom/RegistrationsList/context";
import { RegistrationClassroomTypes } from "../../../Context/Classroom/RegistrationsList/type";
import { Status, StatusEnum, StatusTermEnum } from "../../../Controller/controllerGlobal";
import { usePermissions } from "../../../hooks/usePermissions";
import color from "../../../Styles/colors";

const termColors: Record<string, { bg: string; text: string }> = {
  ACTIVE_TERM:   { bg: "rgba(40,161,56,0.12)",   text: color.green },
  TERM_ANALYSIS: { bg: "rgba(252,173,9,0.16)",    text: "#9a6700" },
  INACTIVE_TERM: { bg: "rgba(237,90,104,0.12)",   text: color.red },
  INVALID_TERM:  { bg: "rgba(237,90,104,0.12)",   text: color.red },
};

const enrollmentBg: Record<string, string> = {
  [Status.APPROVED]:     color.green,
  [Status.PENDING_TERM]: color.colorCardOrange,
  [Status.PENDING]:      color.red,
};

const CardRegistration = ({
  title,
  subtitle,
  idRegistration,
  status,
  avatar_url,
  adhesion_term_status,
  has_other_terms,
}: {
  title: string;
  subtitle: string;
  idRegistration: number;
  status: string;
  avatar_url: string;
  adhesion_term_status?: string;
  has_other_terms?: boolean;
}) => {
  const [visible, setVisible] = useState(false);
  const history = useNavigate();
  const { id } = useParams();
  const { can } = usePermissions();

  const props = useContext(RegistrationClassroomContext) as RegistrationClassroomTypes;

  const canEdit = can("registration.view");

  const termStyle = adhesion_term_status
    ? termColors[adhesion_term_status] ?? { bg: "rgba(237,90,104,0.12)", text: color.red }
    : { bg: "#f0f0f0", text: "#999" };

  return (
    <>
      <div
        onClick={() => canEdit && history(`/turma/${id}/aluno/${idRegistration}`)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "12px 14px",
          borderRadius: "12px",
          border: `1px solid rgba(219,230,255,1)`,
          background: color.colorCard,
          cursor: canEdit ? "pointer" : "default",
          transition: "box-shadow 0.15s",
          position: "relative",
        }}
        onMouseEnter={(e) => {
          if (canEdit) (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
        }}
      >
        <img
          src={avatar_url ?? avatar}
          alt=""
          style={{ width: 44, height: 44, borderRadius: "50%", flexShrink: 0, objectFit: "cover" }}
        />

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{
            display: "block",
            fontWeight: 700,
            fontSize: "0.88rem",
            color: color.colorsBaseInkNormal,
            wordBreak: "break-word",
            lineHeight: 1.3,
          }}>
            {subtitle}
          </span>

          <div style={{ fontSize: "0.72rem", color: color.colorsBaseInkLight, marginTop: 2 }}>
            {title}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
            <span style={{
              fontSize: "0.7rem",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "999px",
              color: "#fff",
              backgroundColor: enrollmentBg[status] ?? color.colorCardOrange,
              whiteSpace: "nowrap",
            }}>
              {StatusEnum[status] ?? StatusEnum["PENDING"]}
            </span>
            <span style={{
              fontSize: "0.7rem",
              fontWeight: 600,
              padding: "2px 8px",
              borderRadius: "999px",
              background: termStyle.bg,
              color: termStyle.text,
            }}>
              {adhesion_term_status
                ? `Adesão: ${StatusTermEnum[adhesion_term_status] ?? adhesion_term_status}`
                : "Sem termo de adesão"}
            </span>
            {has_other_terms && (
              <span style={{ fontSize: "0.68rem", color: color.colorsBaseInkLight }}>
                + outros termos
              </span>
            )}
          </div>
        </div>

        {canEdit && (
          <div
            onClick={(e) => { e.stopPropagation(); setVisible(true); }}
            style={{ color: "#ccc", flexShrink: 0, padding: "4px" }}
            className="cursor-pointer"
          >
            <i className="pi pi-trash" style={{ fontSize: "0.85rem" }} />
          </div>
        )}
      </div>

      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmação"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteRegistration(idRegistration)}
        reject={() => setVisible(false)}
      />
    </>
  );
};

export default CardRegistration;
