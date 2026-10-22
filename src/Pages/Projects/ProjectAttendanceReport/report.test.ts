import { ProjectRegistrationFrequencyReport } from "../../../Services/Project/frequency.types";
import {
  attendanceResultDescription,
  buildProjectFrequencyPdfDefinition,
  buildProjectFrequencyPdfRows,
  projectFrequencyPdfFileName,
} from "./report";

const report: ProjectRegistrationFrequencyReport = {
  project: {
    id: 9,
    name: "Plano Educação 2026",
    approvalPercentage: 70,
    requiresActiveAdhesionTerm: true,
  },
  data: [
    {
      registration: {
        id: 1,
        thpId: "THP-1",
        name: "João Neves",
        status: "ACTIVE",
        adhesionTermStatus: "ACTIVE_TERM",
      },
      classrooms: [
        {
          registerClassroomId: 10,
          classroomId: 100,
          classroomName: "Turma A",
          year: 2026,
          registrationStatus: "APPROVED",
          classroomStatus: "APPROVED",
          meetings: 5,
          presences: 4,
          absences: 1,
          attendancePercentage: 80,
          requiredPercentage: 70,
          result: "APPROVED",
          notEvaluatedReason: null,
        },
        {
          registerClassroomId: 11,
          classroomId: 101,
          classroomName: "Turma B",
          year: 2026,
          registrationStatus: "PENDING",
          classroomStatus: "APPROVED",
          meetings: 2,
          presences: null,
          absences: null,
          attendancePercentage: null,
          requiredPercentage: 70,
          result: "NOT_EVALUATED",
          notEvaluatedReason: "REGISTRATION_PENDING",
        },
      ],
    },
  ],
};

describe("project frequency report helpers", () => {
  it("creates PDF rows only for eligible classroom registrations", () => {
    expect(buildProjectFrequencyPdfRows(report)).toEqual([
      [
        "João Neves",
        "THP-1",
        "Turma A",
        "2026",
        "Aprovada",
        "5",
        "4",
        "1",
        "80%",
        "Aprovado",
      ],
    ]);
  });

  it("requires an active adhesion term for projects governed by the term rule", () => {
    const reportWithoutActiveTerm: ProjectRegistrationFrequencyReport = {
      ...report,
      data: [
        {
          ...report.data[0],
          registration: {
            ...report.data[0].registration,
            adhesionTermStatus: "TERM_ANALYSIS",
          },
        },
      ],
    };

    expect(buildProjectFrequencyPdfRows(reportWithoutActiveTerm)).toEqual([]);
  });

  it("keeps the term exception for projects before 2026", () => {
    const legacyReport: ProjectRegistrationFrequencyReport = {
      ...report,
      project: {
        ...report.project,
        requiresActiveAdhesionTerm: false,
      },
      data: [
        {
          ...report.data[0],
          registration: {
            ...report.data[0].registration,
            adhesionTermStatus: null,
          },
        },
      ],
    };

    expect(buildProjectFrequencyPdfRows(legacyReport)).toHaveLength(1);
  });

  it("explains why a classroom was not evaluated", () => {
    expect(attendanceResultDescription(report.data[0].classrooms[1])).toBe(
      "Não avaliado — Matrícula pendente"
    );
  });

  it("creates a safe and descriptive PDF file name", () => {
    expect(projectFrequencyPdfFileName("Plano Educação 2026")).toBe(
      "relatorio-frequencia-plano-educacao-2026.pdf"
    );
  });

  it("uses the classroom report branding and result colors", () => {
    const definition = buildProjectFrequencyPdfDefinition(
      report,
      {},
      {
        logoBase64: "data:image/png;base64,logo",
        sideLogoBase64: "data:image/png;base64,side",
        rulerBase64: "data:image/png;base64,ruler",
      },
      new Date("2026-10-22T12:00:00.000Z")
    );
    const styles = definition.styles as Record<string, { color?: string }>;
    const footer = (definition.footer as Function)(1, 1);
    const background = (definition.background as Function)(1, {
      width: 842,
      height: 595,
      orientation: "landscape",
    });

    expect(styles.statusApproved.color).toBe("#28A138");
    expect(styles.statusRejected.color).toBe("#ED5A68");
    expect(footer.image).toBe("data:image/png;base64,ruler");
    expect(background.image).toBe("data:image/png;base64,side");
  });
});
