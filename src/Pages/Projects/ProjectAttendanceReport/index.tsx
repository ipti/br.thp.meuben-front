import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import Swal from "sweetalert2";
import logoMeuBen from "../../../Assets/images/logothp.png";
import sideLogoMeuBen from "../../../Assets/images/logoleftpdf.png";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import {
  convertImageUrlToBase64,
  loadImageFileAsBase64,
} from "../../../Controller/controllerGlobal";
import { Classroom } from "../../../Context/Project/ProjectOne/type";
import {
  useFetchRequestProjectOne,
  useProjectRegistrationFrequency,
} from "../../../Services/Project/query";
import { requestProjectRegistrationFrequencyReport } from "../../../Services/Project/request";
import {
  ClassroomFrequency,
  ProjectRegistrationFrequencyFilters,
  RegistrationFrequency,
} from "../../../Services/Project/frequency.types";
import {
  ATTENDANCE_RESULT_LABELS,
  NOT_EVALUATED_REASON_LABELS,
  REGISTER_CLASSROOM_STATUS_LABELS,
  REGISTRATION_STATUS_LABELS,
  adhesionTermStatusLabel,
  buildProjectFrequencyPdfDefinition,
  buildProjectFrequencyPdfRows,
  formatAttendancePercentage,
  projectFrequencyPdfFileName,
} from "./report";
import {
  EmptyHint,
  ExpansionContent,
  FilterField,
  FilterGrid,
  FilterPanel,
  ReportActions,
  ReportSummary,
  SummaryItem,
  UpdatingHint,
} from "./styles";

pdfMake.vfs = pdfFonts.vfs;

type ReportTableRow = RegistrationFrequency & { id: number };

const ProjectAttendanceReport = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const projectId = Number(id);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [year, setYear] = useState<number | null>(null);
  const [classroomId, setClassroomId] = useState<number | null>(null);
  const [expandedRows, setExpandedRows] = useState<any>(null);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const filters = useMemo<ProjectRegistrationFrequencyFilters>(
    () => ({
      ...(search ? { search } : {}),
      ...(year !== null ? { year } : {}),
      ...(classroomId !== null ? { classroomId } : {}),
    }),
    [search, year, classroomId]
  );
  const query = useMemo(
    () => ({ ...filters, page, limit }),
    [filters, page, limit]
  );

  const { data, isLoading, isFetching, isError, refetch } =
    useProjectRegistrationFrequency(projectId, query);
  const { data: projectDetails } = useFetchRequestProjectOne(projectId);

  const classrooms = useMemo<Classroom[]>(
    () => projectDetails?.project?.classrooms ?? [],
    [projectDetails]
  );
  const yearOptions = useMemo(
    () => [
      { label: "Todos os anos", value: null },
      ...Array.from(new Set(classrooms.map((classroom) => classroom.year)))
        .sort((a, b) => b - a)
        .map((classroomYear) => ({
          label: String(classroomYear),
          value: classroomYear,
        })),
    ],
    [classrooms]
  );
  const classroomOptions = useMemo(
    () => [
      { label: "Todas as turmas", value: null },
      ...classrooms
        .filter((classroom) => year === null || classroom.year === year)
        .slice()
        .sort(
          (a, b) => b.year - a.year || a.name.localeCompare(b.name, "pt-BR")
        )
        .map((classroom) => ({
          label: `${classroom.name} (${classroom.year})`,
          value: classroom.id,
        })),
    ],
    [classrooms, year]
  );
  const tableRows = useMemo<ReportTableRow[]>(
    () =>
      (data?.data ?? []).map((item) => ({
        ...item,
        id: item.registration.id,
      })),
    [data]
  );

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setYear(null);
    setClassroomId(null);
    setPage(1);
  };

  const handleExport = async () => {
    try {
      setIsExporting(true);
      const report = await requestProjectRegistrationFrequencyReport(
        projectId,
        filters
      );
      const rows = buildProjectFrequencyPdfRows(report).length;

      if (rows === 0) {
        await Swal.fire({
          icon: "info",
          title: "Nenhuma matrícula elegível para exportação",
          text: report.project.requiresActiveAdhesionTerm
            ? "Para sair no PDF, a matrícula deve estar aprovada e o termo de adesão deve estar ativo."
            : "Para sair no PDF, a matrícula deve estar aprovada.",
          confirmButtonText: "Entendi",
        });
        return;
      }

      const classroomName = classroomOptions.find(
        (option) => option.value === classroomId
      )?.label;
      const rulerUrl = projectDetails?.project?.ruler_url;
      const [logoBase64, sideLogoBase64, rulerBase64] = await Promise.all([
        loadImageFileAsBase64(logoMeuBen),
        loadImageFileAsBase64(sideLogoMeuBen),
        rulerUrl
          ? convertImageUrlToBase64(rulerUrl).catch(() => null)
          : Promise.resolve(null),
      ]);
      const definition = buildProjectFrequencyPdfDefinition(
        report,
        {
          search: search || undefined,
          year: year ?? undefined,
          classroomName:
            classroomId === null ? undefined : classroomName ?? undefined,
        },
        { logoBase64, sideLogoBase64, rulerBase64 }
      );
      pdfMake
        .createPdf(definition)
        .download(projectFrequencyPdfFileName(report.project.name));
    } catch (error) {
      await Swal.fire({
        icon: "error",
        title: "Não foi possível exportar o relatório",
        text: "Tente novamente em alguns instantes.",
        confirmButtonText: "Fechar",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const resultBody = (classroom: ClassroomFrequency) => {
    const reason = classroom.notEvaluatedReason
      ? NOT_EVALUATED_REASON_LABELS[classroom.notEvaluatedReason]
      : undefined;
    return (
      <Tag
        value={ATTENDANCE_RESULT_LABELS[classroom.result]}
        severity={
          classroom.result === "APPROVED"
            ? "success"
            : classroom.result === "REPROVED"
            ? "danger"
            : "warning"
        }
        title={reason}
      />
    );
  };

  const registrationStatusBody = (row: ReportTableRow) => (
    <Tag
      value={REGISTRATION_STATUS_LABELS[row.registration.status]}
      severity={
        row.registration.status === "ACTIVE"
          ? "success"
          : row.registration.status === "INACTIVE"
          ? "danger"
          : "warning"
      }
    />
  );

  const adhesionTermStatusBody = (row: ReportTableRow) => {
    const status = row.registration.adhesionTermStatus;
    return (
      <Tag
        value={adhesionTermStatusLabel(status)}
        severity={
          status === "ACTIVE_TERM"
            ? "success"
            : status === "INACTIVE_TERM" || status === "INVALID_TERM"
            ? "danger"
            : status
            ? "warning"
            : undefined
        }
      />
    );
  };

  const rowExpansionTemplate = (row: ReportTableRow) => (
    <ExpansionContent>
      <h4>Resultado por turma</h4>
      <DataTable
        value={row.classrooms}
        size="small"
        responsiveLayout="scroll"
        emptyMessage="Nenhuma turma encontrada para este participante."
        tableStyle={{ minWidth: "64rem" }}
      >
        <Column field="classroomName" header="Turma" />
        <Column field="year" header="Ano" style={{ width: "5rem" }} />
        <Column
          header="Matrícula"
          body={(classroom: ClassroomFrequency) => (
            <Tag
              value={
                REGISTER_CLASSROOM_STATUS_LABELS[classroom.registrationStatus]
              }
              severity={
                classroom.registrationStatus === "APPROVED"
                  ? "success"
                  : classroom.registrationStatus === "REPROVED"
                  ? "danger"
                  : "warning"
              }
            />
          )}
        />
        <Column field="meetings" header="Encontros" />
        <Column
          header="Presenças"
          body={(classroom: ClassroomFrequency) =>
            classroom.presences ?? <EmptyHint>—</EmptyHint>
          }
        />
        <Column
          header="Faltas"
          body={(classroom: ClassroomFrequency) =>
            classroom.absences ?? <EmptyHint>—</EmptyHint>
          }
        />
        <Column
          header="Frequência"
          body={(classroom: ClassroomFrequency) =>
            formatAttendancePercentage(classroom.attendancePercentage)
          }
        />
        <Column
          header="Meta"
          body={(classroom: ClassroomFrequency) =>
            `${classroom.requiredPercentage}%`
          }
        />
        <Column header="Resultado" body={resultBody} />
        <Column
          header="Observação"
          body={(classroom: ClassroomFrequency) =>
            classroom.notEvaluatedReason ? (
              NOT_EVALUATED_REASON_LABELS[classroom.notEvaluatedReason]
            ) : (
              <EmptyHint>—</EmptyHint>
            )
          }
        />
      </DataTable>
    </ExpansionContent>
  );

  if (!Number.isInteger(projectId) || projectId <= 0) {
    return (
      <ContentPage
        title="Relatório de frequência"
        description="Plano de trabalho inválido."
      >
        <Message severity="error" text="Plano de trabalho inválido." />
      </ContentPage>
    );
  }

  return (
    <ContentPage
      title="Relatório de frequência"
      description={
        data?.project.name ??
        projectDetails?.project?.name ??
        "Participantes e resultados por turma"
      }
    >
      <ReportActions>
        <Button
          label="Voltar ao plano de trabalho"
          icon="pi pi-arrow-left"
          severity="secondary"
          text
          onClick={() => navigate(`/projetos/${projectId}`)}
        />
        <Button
          label="Exportar relatório em PDF"
          icon="pi pi-file-pdf"
          severity="danger"
          loading={isExporting}
          disabled={!data || data.pagination.totalItems === 0}
          onClick={handleExport}
        />
      </ReportActions>

      <FilterPanel aria-label="Filtros do relatório">
        <FilterGrid>
          <FilterField>
            <label htmlFor="frequency-search">Participante</label>
            <InputText
              id="frequency-search"
              value={searchInput}
              placeholder="Buscar por nome ou código THP"
              onChange={(event) => setSearchInput(event.target.value)}
              style={{ width: "100%" }}
            />
          </FilterField>
          <FilterField>
            <label htmlFor="frequency-year">Ano</label>
            <Dropdown
              inputId="frequency-year"
              value={year}
              options={yearOptions}
              onChange={(event) => {
                setYear(event.value ?? null);
                setClassroomId(null);
                setPage(1);
              }}
              style={{ width: "100%" }}
            />
          </FilterField>
          <FilterField>
            <label htmlFor="frequency-classroom">Turma</label>
            <Dropdown
              inputId="frequency-classroom"
              value={classroomId}
              options={classroomOptions}
              onChange={(event) => {
                setClassroomId(event.value ?? null);
                setPage(1);
              }}
              filter
              style={{ width: "100%" }}
            />
          </FilterField>
          <Button
            label="Limpar filtros"
            icon="pi pi-filter-slash"
            severity="secondary"
            outlined
            disabled={!searchInput && year === null && classroomId === null}
            onClick={clearFilters}
          />
        </FilterGrid>
      </FilterPanel>

      {data && (
        <ReportSummary>
          <SummaryItem>
            Meta por turma
            <strong>{data.project.approvalPercentage}%</strong>
          </SummaryItem>
          <SummaryItem>
            Participantes encontrados
            <strong>{data.pagination.totalItems}</strong>
          </SummaryItem>
          {isFetching && !isLoading && (
            <UpdatingHint>Atualizando resultados…</UpdatingHint>
          )}
        </ReportSummary>
      )}

      {data && (
        <Message
          severity="info"
          text={
            data.project.requiresActiveAdhesionTerm
              ? "No PDF, são exportadas somente matrículas aprovadas com termo de adesão ativo."
              : "No PDF, são exportadas somente matrículas aprovadas. Para este plano anterior a 2026, o termo ativo não é obrigatório."
          }
          style={{ width: "100%", marginBottom: "1rem" }}
        />
      )}

      {isLoading ? (
        <Loading />
      ) : isError ? (
        <div>
          <Message
            severity="error"
            text="Não foi possível carregar o relatório."
          />
          <Button
            label="Tentar novamente"
            icon="pi pi-refresh"
            text
            onClick={() => refetch()}
          />
        </div>
      ) : (
        <>
          <DataTable
            value={tableRows}
            dataKey="id"
            expandedRows={expandedRows}
            onRowToggle={(event) => setExpandedRows(event.data)}
            rowExpansionTemplate={rowExpansionTemplate}
            responsiveLayout="scroll"
            stripedRows
            emptyMessage="Nenhum participante encontrado para os filtros informados."
            tableStyle={{ minWidth: "62rem" }}
          >
            <Column expander style={{ width: "3.5rem" }} />
            <Column field="registration.name" header="Participante" />
            <Column field="registration.thpId" header="Código THP" />
            <Column header="Situação" body={registrationStatusBody} />
            <Column
              header="Status do termo de adesão"
              body={adhesionTermStatusBody}
            />
            <Column
              header="Turmas"
              body={(row: ReportTableRow) => row.classrooms.length}
            />
          </DataTable>

          <Paginator
            first={(page - 1) * limit}
            rows={limit}
            totalRecords={data?.pagination.totalItems ?? 0}
            rowsPerPageOptions={[10, 20, 50, 100]}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="Exibindo {first}–{last} de {totalRecords} participantes"
            onPageChange={(event) => {
              setPage(Math.floor(event.first / event.rows) + 1);
              setLimit(event.rows);
              setExpandedRows(null);
            }}
          />
        </>
      )}
    </ContentPage>
  );
};

export default ProjectAttendanceReport;
