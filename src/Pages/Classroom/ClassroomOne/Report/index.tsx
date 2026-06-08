import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import Present from "../../../../Assets/images/status-approved.svg";
import NotPresent from "../../../../Assets/images/status-desapproved.svg";
import ContentPage from "../../../../Components/ContentPage";
import {
  StatusEnum,
  StatusTermEnum,
  formatarData,
} from "../../../../Controller/controllerGlobal";
import http from "../../../../Services/axios";
import { useFetchRequestClassroomReport } from "../../../../Services/Classroom/query";
import color from "../../../../Styles/colors";
import { ReportClassroom } from "./Pdf";

const ReportWrapper = styled.div`
  width: 100%;

  .report-table {
    border: 1px solid ${color.grayClearOne};
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(15, 23, 42, 0.06);
  }

  .report-table .p-datatable-wrapper {
    overflow: auto;
  }

  .report-table .p-datatable-header {
    background: linear-gradient(180deg, ${color.white} 0%, #f8fafc 100%);
    border-bottom: 1px solid ${color.grayClearOne};
    padding: 0.75rem 1rem;
  }

  .report-table .p-datatable-thead > tr > th {
    background: #f8fafc;
    color: ${color.colorsBaseInkNormal};
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 0.8rem 0.9rem;
    white-space: nowrap;
  }

  .report-table .p-datatable-tbody > tr > td {
    padding: 0.7rem 0.9rem;
    font-size: 0.9rem;
    color: ${color.colorsBaseInkNormalActive};
    vertical-align: middle;
    white-space: nowrap;
  }

  .report-table .p-datatable-tbody > tr:nth-child(even) {
    background: #fbfdff;
  }

  .report-table .p-datatable-tbody > tr:hover {
    background: #eef4ff;
  }

  .report-table .p-column-title {
    white-space: nowrap;
  }

  .report-table .beneficiary-cell {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 220px;
  }

  .report-table .beneficiary-name {
    font-weight: 700;
    color: ${color.colorsBaseInkNormal};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .report-table .status-pill,
  .report-table .attendance-pill,
  .report-table .total-pill {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.35rem;
    min-height: 30px;
    border-radius: 999px;
    padding: 0.35rem 0.75rem;
    font-size: 0.78rem;
    font-weight: 700;
    white-space: nowrap;
  }

  .report-table .status-pill {
    background: ${color.colorCard};
    color: ${color.colorsBaseInkNormal};
  }

  .report-table .status-pill.is-success {
    background: rgba(40, 161, 56, 0.12);
    color: ${color.green};
  }

  .report-table .status-pill.is-warning {
    background: rgba(252, 173, 9, 0.16);
    color: #9a6700;
  }

  .report-table .status-pill.is-danger {
    background: rgba(237, 90, 104, 0.12);
    color: ${color.red};
  }

  .report-table .attendance-pill {
    min-width: 38px;
    padding: 0.3rem 0.45rem;
    background: ${color.colorCard};
  }

  .report-table .attendance-pill img {
    width: 16px;
    height: 16px;
  }

  .report-table .attendance-pill.is-present {
    background: rgba(40, 161, 56, 0.12);
  }

  .report-table .attendance-pill.is-absent {
    background: rgba(237, 90, 104, 0.12);
  }

  .report-table .total-pill {
    min-width: 72px;
    color: ${color.white};
  }

  .report-table .total-pill.is-success {
    background: ${color.green};
  }

  .report-table .total-pill.is-danger {
    background: ${color.red};
  }

  .report-summary {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 0.85rem;
  }

  .report-summary-card {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
    min-width: 160px;
    padding: 0.85rem 1rem;
    border: 1px solid ${color.grayClearOne};
    border-radius: 14px;
    background: ${color.white};
  }

  .report-summary-card small {
    color: ${color.colorsBaseInkLight};
    font-size: 0.72rem;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-weight: 700;
  }

  .report-summary-card strong {
    color: ${color.colorsBaseInkNormal};
    font-size: 1rem;
  }

  .report-note {
    margin-top: 0.6rem;
    font-size: 0.78rem;
    color: ${color.colorsBaseInkLight};
  }
`;

const Report = () => {
  return <ReportPage />;
};

const ReportPage = () => {
  const { id } = useParams();

  const { data } = useFetchRequestClassroomReport(parseInt(id!));

  const { generatePDF, generateImagesZip, isGeneratingImagesZip } =
    ReportClassroom();

  const getLatestTermStatus = (rowData: any) => {
    const latestTerm = rowData?.registration?.register_term?.[0];
    if (!latestTerm?.status) return "Sem termo de adesão";
    return StatusTermEnum[latestTerm.status] ?? latestTerm.status;
  };

  const getRegistrationStatusLabel = (status?: string) => {
    if (!status) return "-";
    return StatusEnum[status] ?? status;
  };

  const getStatusTone = (label?: string) => {
    const normalized = label?.toLowerCase() ?? "";

    if (normalized.includes("aprov") || normalized.includes("ativ")) {
      return "is-success";
    }

    if (normalized.includes("pend") || normalized.includes("aguard")) {
      return "is-warning";
    }

    if (
      normalized.includes("reprov") ||
      normalized.includes("cancel") ||
      normalized.includes("inativ")
    ) {
      return "is-danger";
    }

    return "";
  };

  const getAttendancePercentage = (rowData: any) => {
    const meetings = data?.meeting ?? [];
    const absences = meetings.reduce((count: number, meeting: any) => {
      const found = meeting?.fouls?.find(
        (props: any) => props.registration_fk === rowData.registration_fk
      );

      return found ? count + 1 : count;
    }, 0);

    return meetings.length !== 0
      ? ((meetings.length - absences) / meetings.length) * 100
      : 0;
  };

  const bodyMeeting = (rowData: any, options: any) => {
    const meeting = data?.meeting?.[parseInt(options?.column.props.columnKey)];
    const verifyFouls = meeting?.fouls?.find(
      (props: any) => props.registration_fk === rowData.registration_fk
    );

    return (
      <span
        className={`attendance-pill ${verifyFouls ? "is-absent" : "is-present"}`}
        title={verifyFouls ? "Faltou" : "Presente"}
      >
        <img
          alt={verifyFouls ? "Faltou" : "Presente"}
          src={verifyFouls ? NotPresent : Present}
        />
      </span>
    );
  };

  const bodyTotal = (rowData: any) => {
    const attendance = getAttendancePercentage(rowData);
    const approvalPercentage = data?.project?.approval_percentage ?? 0;
    const isApproved = approvalPercentage <= attendance;

    return (
      <div
        className={`total-pill ${isApproved ? "is-success" : "is-danger"}`}
        title={`Presença: ${attendance.toFixed(0)}% | Limite: ${approvalPercentage}%`}
      >
        {attendance.toFixed(0)}%
      </div>
    );
  };

  const downloadCSV = async () => {
    try {
      const response = await http.get(
        "/classroom-bff/frequency-csv?classroomId=" + id
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${data.name}.csv`);
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Erro ao baixar o arquivo:", error);
    }
  };

  const header = (
    <div className="flex align-items-center justify-content-end gap-2">
      <Button
        type="button"
        icon="pi pi-file-excel"
        severity="success"
        rounded
        onClick={downloadCSV}
        data-pr-tooltip="CSV"
      />
      <Button
        type="button"
        icon="pi pi-image"
        severity="info"
        rounded
        onClick={generateImagesZip}
        loading={isGeneratingImagesZip}
        data-pr-tooltip="Imagens (ZIP)"
      />
      <Button
        type="button"
        icon="pi pi-file-pdf"
        severity="danger"
        rounded
        onClick={generatePDF}
        data-pr-tooltip="PDF"
      />
    </div>
  );

  return (
    <ContentPage
      title="Relatório de Frequência "
      description="Consulte ou gere um relatório de presença dos alunos da sua turma."
    >
      <ReportWrapper>
        <div id="center" style={{ width: "100%", maxWidth: "100%" }}>
          <div className="report-summary">
            <div className="report-summary-card">
              <small>Alunos</small>
              <strong>{data?.register_classroom?.length ?? 0}</strong>
            </div>
            <div className="report-summary-card">
              <small>Encontros</small>
              <strong>{data?.meeting?.length ?? 0}</strong>
            </div>
            <div className="report-summary-card">
              <small>Critério de aprovação</small>
              <strong>{data?.project?.approval_percentage ?? 0}%</strong>
            </div>
          </div>

          <DataTable
            className="report-table"
            value={data?.register_classroom}
            scrollable
            scrollHeight="60vh"
            header={header}
            paginator
            rows={10}
            rowHover
            stripedRows
            emptyMessage="Nenhum aluno encontrado para esta turma."
            tableStyle={{
              minWidth: `${Math.max(
                980,
                (data?.meeting?.length ?? 0) * 96 + 520
              )}px`,
            }}
          >
            <Column
              field={"registration.name"}
              frozen
              alignFrozen="left"
              header={"Beneficiário"}
              style={{ minWidth: "260px" }}
              body={(rowData) => (
                <div
                  className="beneficiary-cell"
                  title={rowData?.registration?.name}
                >
                  <span className="beneficiary-name">
                    {rowData?.registration?.name ?? "-"}
                  </span>
                </div>
              )}
            />
            <Column
              header={"Status da matrícula"}
              style={{ width: "180px" }}
              body={(rowData) => {
                const label = getRegistrationStatusLabel(rowData?.status);

                return (
                  <span className={`status-pill ${getStatusTone(label)}`}>
                    {label}
                  </span>
                );
              }}
            />
            <Column
              header={"Status do termo de adesão"}
              style={{ width: "180px" }}
              body={(rowData) => {
                const label = getLatestTermStatus(rowData);

                return (
                  <span className={`status-pill ${getStatusTone(label)}`}>
                    {label}
                  </span>
                );
              }}
            />
            {data?.meeting?.map((item: any, index: number) => (
              <Column
                align={"center"}
                key={index}
                columnKey={index.toString()}
                body={bodyMeeting}
                header={formatarData(item.meeting_date)}
                style={{ width: "96px" }}
              />
            ))}
            <Column
              body={bodyTotal}
              header={"Total"}
              frozen
              alignFrozen="right"
              style={{ width: "104px" }}
            />
          </DataTable>
          <div className="report-note">
            No PDF, são exportados apenas alunos com matrícula aprovadas e com termo de adesão assinado.
          </div>
        </div>
      </ReportWrapper>
    </ContentPage>
  );
};

export default Report;
