import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import ContentPage from "../../../../Components/ContentPage";
import Loading from "../../../../Components/Loading";
import { usePermissions } from "../../../../hooks/usePermissions";
import { profileTypeLabel } from "../../../../Controller/controllerGlobal";
import { Padding } from "../../../../Styles/styles";
import { accessRequestTypeLabel } from "../../../../Services/AccessRequest/labels";
import { useAdminAccessRequestList } from "../../../../Services/AccessRequestAdmin/query";
import type { AdminListItem, AdminListFilters } from "../../../../Services/AccessRequestAdmin/types";

const STATUS_OPTIONS = [
  { label: "Todos os status", value: "" },
  { label: "Aguardando análise", value: "PENDING_REVIEW" },
  { label: "Em análise", value: "IN_REVIEW" },
  { label: "Informações solicitadas", value: "NEEDS_INFORMATION" },
  { label: "Aprovada — aguardando ativação", value: "APPROVED_PENDING_ACTIVATION" },
  { label: "Concluída", value: "COMPLETED" },
  { label: "Recusada", value: "REJECTED" },
  { label: "Cancelada", value: "CANCELLED" },
  { label: "Expirada", value: "EXPIRED" },
];

const ORIGIN_OPTIONS = [
  { label: "Todas as origens", value: "" },
  { label: "Local", value: "LOCAL" },
  { label: "Microsoft", value: "MICROSOFT" },
];

const PROFILE_TYPE_OPTIONS = [
  { label: "Todos os tipos", value: "" },
  { label: "Coordenador", value: "COORDINATOR" },
  { label: "Apoio à coordenação", value: "COORDINATION_SUPPORT" },
  { label: "Reaplicador", value: "REAPPLICATOR" },
  { label: "Oficineiro", value: "OFICINEIRO" },
  { label: "Comunicação", value: "COMMUNICATION" },
  { label: "Prestação de contas", value: "ACCOUNTABILITY" },
  { label: "Outro", value: "OTHER" },
];

const STATUS_SEVERITY: Record<string, "success" | "info" | "warning" | "danger" | undefined> = {
  DRAFT: "info",
  PENDING_REVIEW: "info",
  IN_REVIEW: "info",
  NEEDS_INFORMATION: "warning",
  APPROVED_PENDING_ACTIVATION: "success",
  COMPLETED: "success",
  REJECTED: "danger",
  CANCELLED: "danger",
  EXPIRED: "danger",
};

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Aguardando análise",
  IN_REVIEW: "Em análise",
  NEEDS_INFORMATION: "Informações solicitadas",
  APPROVED_PENDING_ACTIVATION: "Aprovada",
  COMPLETED: "Concluída",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

const EMAIL_EVIDENCE_LABEL: Record<string, string> = {
  MICROSOFT_AUTHENTICATED: "Autenticado (MS)",
  DECLARED: "Declarado",
  NOT_PROVIDED: "Não fornecido",
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}

let debounceTimer: ReturnType<typeof setTimeout>;

const AccessRequestAdminList = () => {
  const navigate = useNavigate();
  const { can } = usePermissions();

  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [textSearch, setTextSearch] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [status, setStatus] = useState("");
  const [origin, setOrigin] = useState("");
  const [profileType, setProfileType] = useState("");

  const filters: AdminListFilters = {
    page,
    perPage,
    status: status || undefined,
    origin: origin || undefined,
    profileType: profileType || undefined,
    name: debouncedText || undefined,
  };

  const { data, isLoading } = useAdminAccessRequestList(filters);

  const handleTextChange = useCallback((value: string) => {
    setTextSearch(value);
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      setDebouncedText(value);
      setPage(1);
    }, 400);
  }, []);

  const handleFilterChange = (setter: (v: string) => void) => (e: any) => {
    setter(e.value ?? "");
    setPage(1);
  };

  if (!can("accessRequest.view")) {
    return (
      <ContentPage title="Solicitações de acesso" description="Acesso restrito.">
        <Padding padding="16px" />
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  const statusBody = (row: AdminListItem) => (
    <Tag
      value={STATUS_LABELS[row.status] ?? row.status}
      severity={STATUS_SEVERITY[row.status]}
    />
  );

  const originBody = (row: AdminListItem) => (
    <span>
      {row.origin === "MICROSOFT" ? (
        <span title="Microsoft">
          <i className="pi pi-microsoft" style={{ marginRight: 4 }} />
          Microsoft
        </span>
      ) : (
        "Local"
      )}
    </span>
  );

  const requestTypeBody = (row: AdminListItem) => (
    <span>{accessRequestTypeLabel(row.type)}</span>
  );

  const emailBody = (row: AdminListItem) => (
    <span>
      {row.institutionalEmail ?? "—"}
      {row.institutionalEmail && (
        <Tag
          value={EMAIL_EVIDENCE_LABEL[row.emailEvidence] ?? row.emailEvidence}
          severity={
            row.emailEvidence === "MICROSOFT_AUTHENTICATED"
              ? "success"
              : row.emailEvidence === "DECLARED"
              ? "info"
              : "warning"
          }
          style={{ marginLeft: 6, fontSize: 10 }}
        />
      )}
    </span>
  );

  const profileTypeBody = (row: AdminListItem) =>
    row.profileTypeUnknown ? (
      <span style={{ color: "#aaa" }}>Não informado</span>
    ) : row.profileType ? (
      <span>{profileTypeLabel[row.profileType] ?? row.profileType}</span>
    ) : (
      <span style={{ color: "#aaa" }}>—</span>
    );

  const actionsBody = (row: AdminListItem) => (
    <Button
      icon="pi pi-eye"
      rounded
      text
      tooltip="Ver detalhe"
      tooltipOptions={{ position: "top" }}
      onClick={() => navigate(`/solicitacoes-acesso/${row.id}`)}
    />
  );

  return (
    <ContentPage
      title="Solicitações de acesso"
      description="Acompanhe a fila atual e consulte todo o histórico de solicitações"
    >
      <Padding padding="8px" />

      <div className="grid mb-3">
        <div className="col-12 md:col-4">
          <InputText
            placeholder="Buscar por nome, e-mail ou protocolo…"
            value={textSearch}
            onChange={(e) => handleTextChange(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <div className="col-6 md:col-3">
          <Dropdown
            value={status}
            options={STATUS_OPTIONS}
            optionLabel="label"
            optionValue="value"
            placeholder="Status"
            style={{ width: "100%", height: 44 }}
            onChange={handleFilterChange(setStatus)}
          />
        </div>
        <div className="col-6 md:col-2">
          <Dropdown
            value={origin}
            options={ORIGIN_OPTIONS}
            optionLabel="label"
            optionValue="value"
            placeholder="Origem"
            style={{ width: "100%", height: 44 }}
            onChange={handleFilterChange(setOrigin)}
          />
        </div>
        <div className="col-6 md:col-3">
          <Dropdown
            value={profileType}
            options={PROFILE_TYPE_OPTIONS}
            optionLabel="label"
            optionValue="value"
            placeholder="Tipo de perfil"
            style={{ width: "100%", height: 44 }}
            onChange={handleFilterChange(setProfileType)}
          />
        </div>
      </div>

      {isLoading ? (
        <Loading />
      ) : (
        <>
          <DataTable
            value={data?.items ?? []}
            tableStyle={{ minWidth: "80rem" }}
            emptyMessage="Nenhuma solicitação encontrada."
          >
            <Column field="protocol" header="Protocolo" />
            <Column field="fullName" header="Solicitante" />
            <Column header="E-mail" body={emailBody} />
            <Column field="type" header="Tipo" body={requestTypeBody} />
            <Column header="Origem" body={originBody} />
            <Column header="Tipo de perfil" body={profileTypeBody} />
            <Column header="Status" body={statusBody} />
            <Column
              header="Criado em"
              body={(row: AdminListItem) => formatDate(row.createdAt)}
            />
            <Column
              header="Atualizado em"
              body={(row: AdminListItem) => formatDate(row.updatedAt)}
            />
            <Column header="Ação" body={actionsBody} />
          </DataTable>

          <Paginator
            first={(page - 1) * perPage}
            rows={perPage}
            totalRecords={data?.total ?? 0}
            rowsPerPageOptions={[10, 20, 50]}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown CurrentPageReport"
            currentPageReportTemplate="Exibindo {first}–{last} de {totalRecords} solicitações"
            onPageChange={(e) => {
              setPage(Math.floor(e.first / e.rows) + 1);
              setPerPage(e.rows);
            }}
          />
        </>
      )}
    </ContentPage>
  );
};

export default AccessRequestAdminList;
