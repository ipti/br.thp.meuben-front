import styles from "../../../Styles";
import { Column, Padding, Row } from "../../../Styles/styles";
import Icon from "../../Icon";
import IconClassroom from "./../../../Assets/images/ts_card.svg";
import { Container } from "./style";

const areaOfActivityLabels: Record<string, string> = {
  NO_SPECIFICATION: "Sem especificação",
  ENTREPRENEURSHIP: "Empreendedorismo",
  HEALTH: "Saúde",
  EDUCATION: "Educação",
};

const CardTs = ({
  title,
  id,
  onEdit,
  onDelete,
  isAdmin,
  area_of_activity,
}: {
  title: string;
  meetingCount?: number;
  registrationCount?: number;
  id: number;
  onEdit?: (id: number, title: string) => void;
  onDelete?: (id: number, title: string) => void;
  isAdmin?: boolean;
  area_of_activity?: string;
}) => {
  return (
    <Container className="card" onClick={() => {}}>
      <Row id="space-between">
        <Row>
          <div className={`boxQuantity`}>
            <img src={IconClassroom} alt="" style={{ height: 32 }} />
          </div>
          <Padding padding="4px" />
          <Column id="center">
            <h3>{title}</h3>
            {area_of_activity && (
              <p style={{ fontSize: "0.85rem", color: styles.colors.colorGrayElephant }}>
                {areaOfActivityLabels[area_of_activity] ?? area_of_activity}
              </p>
            )}
          </Column>
        </Row>
        {isAdmin && (
          <div style={{ display: "flex", gap: 12 }}>
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(id, title);
              }}
            >
              <Icon icon="pi pi-pencil" color={styles.colors.colorGrayElephant} size="1rem" fontWeight="900" />
            </div>
            <div
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(id, title);
              }}
            >
              <Icon icon="pi pi-trash" color={styles.colors.colorError ?? "#ef4444"} size="1rem" fontWeight="900" />
            </div>
          </div>
        )}
      </Row>
    </Container>
  );
};

export default CardTs;
