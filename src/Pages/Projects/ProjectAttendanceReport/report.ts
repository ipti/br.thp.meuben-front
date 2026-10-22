import type { TDocumentDefinitions } from "pdfmake/interfaces";
import {
  AdhesionTermStatus,
  ClassroomAttendanceNotEvaluatedReason,
  ClassroomAttendanceResult,
  ClassroomFrequency,
  ProjectRegistrationFrequencyReport,
  RegisterClassroomStatus,
  RegistrationStatus,
} from "../../../Services/Project/frequency.types";

export const ATTENDANCE_RESULT_LABELS: Record<
  ClassroomAttendanceResult,
  string
> = {
  APPROVED: "Aprovado",
  REPROVED: "Reprovado",
  NOT_EVALUATED: "Não avaliado",
};

export const NOT_EVALUATED_REASON_LABELS: Record<
  ClassroomAttendanceNotEvaluatedReason,
  string
> = {
  CLASSROOM_CANCELED: "Turma cancelada",
  REGISTRATION_PENDING: "Matrícula pendente",
  REGISTRATION_REPROVED: "Matrícula reprovada",
  NO_APPROVED_MEETINGS: "Sem encontros aprovados",
};

export const REGISTER_CLASSROOM_STATUS_LABELS: Record<
  RegisterClassroomStatus,
  string
> = {
  APPROVED: "Aprovada",
  PENDING: "Pendente",
  REPROVED: "Reprovada",
};

export const REGISTRATION_STATUS_LABELS: Record<RegistrationStatus, string> = {
  ACTIVE: "Ativo",
  INACTIVE: "Inativo",
  PENDING: "Pendente",
};

export const ADHESION_TERM_STATUS_LABELS: Record<AdhesionTermStatus, string> = {
  PENDING_TERM: "Aguardando assinatura",
  TERM_ANALYSIS: "Em análise",
  ACTIVE_TERM: "Termo ativo",
  INACTIVE_TERM: "Termo inativo",
  INVALID_TERM: "Termo inválido",
};

export const adhesionTermStatusLabel = (status: AdhesionTermStatus | null) =>
  status ? ADHESION_TERM_STATUS_LABELS[status] : "Sem termo de adesão";

export const formatAttendancePercentage = (value: number | null) =>
  value === null
    ? "—"
    : `${value.toLocaleString("pt-BR", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      })}%`;

export const attendanceResultDescription = (classroom: ClassroomFrequency) => {
  const result = ATTENDANCE_RESULT_LABELS[classroom.result];
  if (classroom.result !== "NOT_EVALUATED" || !classroom.notEvaluatedReason) {
    return result;
  }
  return `${result} — ${
    NOT_EVALUATED_REASON_LABELS[classroom.notEvaluatedReason]
  }`;
};

export interface ProjectFrequencyPdfFilters {
  search?: string;
  year?: number;
  classroomName?: string;
}

export interface ProjectFrequencyPdfBranding {
  logoBase64?: string;
  sideLogoBase64?: string;
  rulerBase64?: string | null;
}

const getExportableFrequencyEntries = (
  report: ProjectRegistrationFrequencyReport
) =>
  report.data.flatMap(({ registration, classrooms }) =>
    classrooms
      .filter(
        (classroom) =>
          classroom.registrationStatus === "APPROVED" &&
          (!report.project.requiresActiveAdhesionTerm ||
            registration.adhesionTermStatus === "ACTIVE_TERM")
      )
      .map((classroom) => ({ registration, classroom }))
  );

export const buildProjectFrequencyPdfRows = (
  report: ProjectRegistrationFrequencyReport
): string[][] =>
  getExportableFrequencyEntries(report).map(({ registration, classroom }) => [
    registration.name,
    registration.thpId,
    classroom.classroomName,
    String(classroom.year),
    REGISTER_CLASSROOM_STATUS_LABELS[classroom.registrationStatus],
    String(classroom.meetings),
    classroom.presences === null ? "—" : String(classroom.presences),
    classroom.absences === null ? "—" : String(classroom.absences),
    formatAttendancePercentage(classroom.attendancePercentage),
    attendanceResultDescription(classroom),
  ]);

const buildFilterDescription = (filters: ProjectFrequencyPdfFilters) => {
  const activeFilters = [
    filters.search?.trim() ? `Busca: ${filters.search.trim()}` : null,
    filters.year ? `Ano: ${filters.year}` : null,
    filters.classroomName ? `Turma: ${filters.classroomName}` : null,
  ].filter(Boolean);

  return activeFilters.length > 0
    ? activeFilters.join("  •  ")
    : "Todas as turmas e participantes";
};

export const buildProjectFrequencyPdfDefinition = (
  report: ProjectRegistrationFrequencyReport,
  filters: ProjectFrequencyPdfFilters,
  branding: ProjectFrequencyPdfBranding = {},
  generatedAt = new Date()
): TDocumentDefinitions => {
  const header = [
    "Participante",
    "Código THP",
    "Turma",
    "Ano",
    "Matrícula",
    "Encontros",
    "Presenças",
    "Faltas",
    "Frequência",
    "Resultado",
  ];
  const exportableEntries = getExportableFrequencyEntries(report);
  const rows = buildProjectFrequencyPdfRows(report);
  const results = exportableEntries.map(({ classroom }) => classroom.result);
  const totalClassrooms = exportableEntries.length;
  const totalParticipants = new Set(
    exportableEntries.map(({ registration }) => registration.id)
  ).size;

  const tableBody = rows.map((row, rowIndex) =>
    row.map((text, columnIndex) => {
      if (columnIndex !== row.length - 1) {
        return { text, style: "tableCell" };
      }

      const result = results[rowIndex];
      return {
        text,
        style:
          result === "APPROVED"
            ? "statusApproved"
            : result === "REPROVED"
            ? "statusRejected"
            : "statusNotEvaluated",
      };
    })
  );
  const rowsPerPage = 18;
  const rowPages = Array.from(
    { length: Math.ceil(tableBody.length / rowsPerPage) },
    (_, pageIndex) =>
      tableBody.slice(pageIndex * rowsPerPage, (pageIndex + 1) * rowsPerPage)
  );
  const createSummary = (): any => ({
    marginTop: 8,
    table: {
      widths: ["*", "*"],
      body: [
        [
          {
            text: `Critério mínimo de aprovação: ${report.project.approvalPercentage}%\nParticipantes: ${totalParticipants}`,
            style: "summaryCell",
          },
          {
            text: `Vínculos com turmas: ${totalClassrooms}\nResultado calculado individualmente por turma`,
            style: "summaryCell",
          },
        ],
      ],
    },
    layout: {
      fillColor: () => "#F3F4F6",
      hLineColor: () => "#D1D5DB",
      vLineColor: () => "#D1D5DB",
    },
  });

  const docDefinition: TDocumentDefinitions = {
    pageSize: "A4",
    pageOrientation: "landscape",
    pageMargins: [40, 100, 40, 60],
    info: {
      title: `Relatório de frequência - ${report.project.name}`,
      subject: "Frequência dos participantes por turma",
    },
    content: [
      {
        text: report.project.name,
        style: "project",
        alignment: "center",
        marginTop: -32,
      },
      {
        text: "Relatório de Frequência do Plano de Trabalho",
        style: "title",
        alignment: "center",
      },
      {
        text: `Meta de frequência: ${
          report.project.approvalPercentage
        }%  •  Gerado em ${generatedAt.toLocaleString("pt-BR")}`,
        style: "metadata",
        alignment: "center",
      },
      {
        text: buildFilterDescription(filters),
        style: "filters",
        alignment: "center",
      },
      ...rowPages.flatMap((pageRows, pageIndex) => [
        {
          table: {
            headerRows: 1,
            widths: ["*", 50, "*", 28, 52, 42, 42, 36, 48, 84],
            body: [
              header.map((text) => ({ text, style: "tableHeader" })),
              ...pageRows,
            ],
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0
                ? "#E5E7EB"
                : rowIndex % 2 === 0
                ? "#F9FAFB"
                : null,
            hLineColor: () => "#D1D5DB",
            vLineColor: () => "#D1D5DB",
            paddingLeft: () => 4,
            paddingRight: () => 4,
            paddingTop: () => 3,
            paddingBottom: () => 3,
          },
          pageBreak: pageIndex === 0 ? undefined : "before",
        },
        createSummary(),
      ]),
    ],
    styles: {
      title: {
        fontSize: 8,
        bold: true,
        color: "#111827",
        margin: [0, 3, 0, 3],
      },
      project: {
        fontSize: 10,
        bold: true,
        color: "#111827",
        margin: [0, 0, 0, 3],
      },
      metadata: { fontSize: 6, color: "#596579" },
      filters: { fontSize: 6, color: "#596579", margin: [0, 2, 0, 8] },
      tableHeader: {
        bold: true,
        color: "#111827",
        fontSize: 6,
        margin: [0, 2, 0, 2],
      },
      tableCell: {
        color: "#111827",
        fontSize: 6,
        margin: [0, 2, 0, 2],
      },
      statusApproved: {
        color: "#28A138",
        fontSize: 6,
        bold: true,
        margin: [0, 2, 0, 2],
      },
      statusRejected: {
        color: "#ED5A68",
        fontSize: 6,
        bold: true,
        margin: [0, 2, 0, 2],
      },
      statusNotEvaluated: {
        color: "#9A6700",
        fontSize: 6,
        bold: true,
        margin: [0, 2, 0, 2],
      },
      summaryCell: {
        color: "#111827",
        fontSize: 6,
        margin: [0, 2, 0, 2],
      },
    },
    defaultStyle: { fontSize: 6, color: "#111827" },
  };

  if (branding.logoBase64) {
    docDefinition.header = () => ({
      image: branding.logoBase64!,
      alignment: "center",
      marginTop: 32,
      marginBottom: 128,
      fit: [400, 400],
    });
  }

  const footerImage = branding.rulerBase64 || branding.logoBase64;
  if (footerImage) {
    docDefinition.footer = () => ({
      image: footerImage,
      alignment: "center",
      margin: [0, 0, 20, 20],
      fit: [400, 400],
    });
  }

  if (branding.sideLogoBase64) {
    docDefinition.background = (currentPage) => {
      const sideLogo = {
        image: branding.sideLogoBase64!,
        width: 16,
        absolutePosition: { x: 8, y: 360 },
      };

      if (currentPage === 1) return sideLogo;

      return [
        {
          text: report.project.name,
          fontSize: 10,
          italics: true,
          alignment: "right",
          opacity: 0.5,
          margin: [0, 10, 10, 0],
        },
        {
          text: "Relatório de Frequência do Plano de Trabalho",
          fontSize: 8,
          italics: true,
          alignment: "right",
          opacity: 0.5,
          margin: [0, 2, 10, 0],
        },
        sideLogo,
      ];
    };
  }

  return docDefinition;
};

export const projectFrequencyPdfFileName = (projectName: string) => {
  const safeName = projectName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();

  return `relatorio-frequencia-${safeName || "plano-de-trabalho"}.pdf`;
};
