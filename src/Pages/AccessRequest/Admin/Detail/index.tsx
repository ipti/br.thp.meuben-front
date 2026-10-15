import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "react-query";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { ConfirmDialog } from "primereact/confirmdialog";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { InputTextarea } from "primereact/inputtextarea";
import { Message } from "primereact/message";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
import ContentPage from "../../../../Components/ContentPage";
import Loading from "../../../../Components/Loading";
import { usePermissions } from "../../../../hooks/usePermissions";
import { profileTypeLabel } from "../../../../Controller/controllerGlobal";
import { formatCalendarDate } from "../../date";
import { Padding } from "../../../../Styles/styles";
import {
  accessRequestConflictLabel,
  accessRequestConflictMessage,
  accessRequestEventLabel,
  accessRequestFieldLabel,
  accessRequestMatchSignalLabel,
  accessRequestTypeLabel,
} from "../../../../Services/AccessRequest/labels";
import {
  ADMIN_ACCESS_REQUEST_KEYS,
  useAdminAccessRequestDetail,
} from "../../../../Services/AccessRequestAdmin/query";
import {
  requestAdminStartReview,
  requestAdminRequestInformation,
  requestAdminCompleteManually,
  requestAdminReject,
  requestAdminCancel,
} from "../../../../Services/AccessRequestAdmin/request";
import type {
  AdminDetail,
  UserCandidate,
  ProfileCandidate,
} from "../../../../Services/AccessRequestAdmin/types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  PENDING_REVIEW: "Aguardando análise",
  IN_REVIEW: "Em análise",
  NEEDS_INFORMATION: "Informações solicitadas",
  APPROVED_PENDING_ACTIVATION: "Aprovada — aguardando ativação",
  COMPLETED: "Concluída",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

const STATUS_SEVERITY: Record<string, "success" | "info" | "warning" | "danger" | undefined> = {
  PENDING_REVIEW: "info",
  IN_REVIEW: "info",
  NEEDS_INFORMATION: "warning",
  APPROVED_PENDING_ACTIVATION: "success",
  COMPLETED: "success",
  REJECTED: "danger",
  CANCELLED: "danger",
  EXPIRED: "danger",
};

const RESOLUTION_LABELS: Record<string, string> = {
  CREATE_USER_AND_PROFILE: "Criar usuário e perfil",
  CREATE_USER_FOR_PROFILE: "Criar usuário para perfil existente",
  RESET_EXISTING_USER_PASSWORD: "Redefinir senha de usuário existente",
  LINK_MICROSOFT: "Vincular Microsoft a usuário existente",
};

const SEX_LABEL: Record<number, string> = { 0: "Não declarado", 1: "Masculino", 2: "Feminino" };
const COLOR_RACE_LABEL: Record<number, string> = {
  0: "Não declarada", 1: "Branca", 2: "Preta", 3: "Parda", 4: "Amarela", 5: "Indígena",
};
const EMAIL_EVIDENCE_LABEL: Record<string, string> = {
  MICROSOFT_AUTHENTICATED: "Autenticado via Microsoft",
  DECLARED: "Declarado pelo solicitante",
  NOT_PROVIDED: "Não fornecido",
};

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR");
}
function formatDateTime(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("pt-BR");
}
function getApiError(err: any): string {
  return (
    err?.response?.data?.message ||
    err?.response?.data?.error ||
    "Erro ao processar a solicitação."
  );
}

const DataField = ({ label, value }: { label: string; value?: string | number | null }) =>
  value != null && value !== "" ? (
    <div className="col-6 md:col-4" style={{ marginBottom: 10 }}>
      <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{label}</p>
      <p style={{ margin: 0 }}>{String(value)}</p>
    </div>
  ) : null;

// ─── Modals ───────────────────────────────────────────────────────────────────

interface RequestInfoModalProps {
  id: number;
  visible: boolean;
  onHide: () => void;
  onSuccess: (updated: AdminDetail) => void;
}

const RequestInfoModal = ({ id, visible, onHide, onSuccess }: RequestInfoModalProps) => {
  const [publicMessage, setPublicMessage] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const FIELD_OPTIONS = [
    "fullName", "institutionalEmail", "phone", "profileType",
    "birthday", "sex", "colorRace", "socialTechnologyIds",
  ];
  const [selectedFields, setSelectedFields] = useState<string[]>([]);

  const toggleField = (f: string) =>
    setSelectedFields((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );

  const handleSubmit = async () => {
    if (!publicMessage.trim()) {
      setError("A mensagem pública é obrigatória.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updated = await requestAdminRequestInformation(id, {
        publicMessage: publicMessage.trim(),
        requestedFields: selectedFields.length ? selectedFields : undefined,
        internalNote: internalNote.trim() || undefined,
      });
      setPublicMessage("");
      setInternalNote("");
      setSelectedFields([]);
      onSuccess(updated);
      onHide();
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Solicitar informações"
      visible={visible}
      onHide={onHide}
      className="w-full md:w-8 lg:w-6"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={onHide} disabled={loading} />
          <Button label="Enviar solicitação" icon="pi pi-send" loading={loading} onClick={handleSubmit} />
        </div>
      }
    >
      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Mensagem pública *</label>
        <InputTextarea
          value={publicMessage}
          onChange={(e) => setPublicMessage(e.target.value)}
          rows={4}
          style={{ width: "100%" }}
          placeholder="Mensagem visível para o solicitante"
        />
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ display: "block", marginBottom: 8 }}>Campos solicitados</label>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {FIELD_OPTIONS.map((f) => (
            <Button
              key={f}
              label={accessRequestFieldLabel(f)}
              size="small"
              outlined={!selectedFields.includes(f)}
              onClick={() => toggleField(f)}
              type="button"
            />
          ))}
        </div>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", marginBottom: 6 }}>Nota interna (não visível ao solicitante)</label>
        <InputTextarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          rows={2}
          style={{ width: "100%" }}
          placeholder="Anotação de auditoria"
        />
      </div>

      {error && <Message severity="error" text={error} style={{ width: "100%" }} />}
    </Dialog>
  );
};

interface RejectModalProps {
  id: number;
  visible: boolean;
  onHide: () => void;
  onSuccess: (updated: AdminDetail) => void;
}

const RejectModal = ({ id, visible, onHide, onSuccess }: RejectModalProps) => {
  const [justification, setJustification] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!justification.trim()) {
      setError("A justificativa pública é obrigatória.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updated = await requestAdminReject(id, justification.trim());
      setJustification("");
      onSuccess(updated);
      onHide();
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Recusar solicitação"
      visible={visible}
      onHide={onHide}
      className="w-full md:w-6"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" outlined onClick={onHide} disabled={loading} />
          <Button label="Recusar" icon="pi pi-times" severity="danger" loading={loading} onClick={handleSubmit} />
        </div>
      }
    >
      <p style={{ color: "#666", marginBottom: 16 }}>
        A justificativa será visível para o solicitante. Explique claramente o motivo da recusa.
      </p>
      <InputTextarea
        value={justification}
        onChange={(e) => setJustification(e.target.value)}
        rows={5}
        style={{ width: "100%" }}
        placeholder="Justificativa pública obrigatória"
      />
      {error && <Message severity="error" text={error} style={{ marginTop: 12, width: "100%" }} />}
    </Dialog>
  );
};

interface CancelModalProps {
  id: number;
  visible: boolean;
  onHide: () => void;
  onSuccess: (updated: AdminDetail) => void;
}

const CancelModal = ({ id, visible, onHide, onSuccess }: CancelModalProps) => {
  const [auditReason, setAuditReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!auditReason.trim()) {
      setError("O motivo é obrigatório.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const updated = await requestAdminCancel(id, auditReason.trim());
      setAuditReason("");
      onSuccess(updated);
      onHide();
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Cancelar administrativamente"
      visible={visible}
      onHide={onHide}
      className="w-full md:w-6"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Voltar" severity="secondary" outlined onClick={onHide} disabled={loading} />
          <Button label="Confirmar cancelamento" severity="danger" loading={loading} onClick={handleSubmit} />
        </div>
      }
    >
      <p style={{ color: "#666", marginBottom: 16 }}>
        Informe o motivo de auditoria. Esta informação não é visível ao solicitante.
      </p>
      <InputTextarea
        value={auditReason}
        onChange={(e) => setAuditReason(e.target.value)}
        rows={4}
        style={{ width: "100%" }}
        placeholder="Motivo interno obrigatório"
      />
      {error && <Message severity="error" text={error} style={{ marginTop: 12, width: "100%" }} />}
    </Dialog>
  );
};

interface ManualCompleteModalProps {
  detail: AdminDetail;
  visible: boolean;
  onHide: () => void;
  onSuccess: (updated: AdminDetail) => void;
}

const ManualCompleteModal = ({
  detail,
  visible,
  onHide,
  onSuccess,
}: ManualCompleteModalProps) => {
  const [resolutionNote, setResolutionNote] = useState("");
  const [publicMessage, setPublicMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleHide = () => {
    setResolutionNote("");
    setPublicMessage("");
    setError(null);
    onHide();
  };

  const handleSubmit = async () => {
    if (resolutionNote.trim().length < 3) {
      setError("Informe resumidamente o que foi realizado no cadastro.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const updated = await requestAdminCompleteManually(detail.id, {
        resolutionNote: resolutionNote.trim(),
        publicMessage: publicMessage.trim() || undefined,
      });
      onSuccess(updated);
      handleHide();
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      header="Marcar solicitação como concluída"
      visible={visible}
      onHide={handleHide}
      className="w-full md:w-8 lg:w-6"
      footer={
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Button label="Cancelar" severity="secondary" text onClick={handleHide} disabled={loading} />
          <Button
            label="Marcar como concluída"
            icon="pi pi-check-circle"
            severity="success"
            loading={loading}
            onClick={handleSubmit}
          />
        </div>
      }
    >
      <Message
        severity="info"
        text="Esta ação apenas encerra a solicitação. Ela não cria usuários, não altera perfis e não redefine senhas automaticamente."
        style={{ width: "100%", marginBottom: 16 }}
      />

      <div style={{ marginBottom: 16 }}>
        <label htmlFor="manual-resolution-note" style={{ display: "block", marginBottom: 6 }}>
          O que foi realizado? *
        </label>
        <InputTextarea
          id="manual-resolution-note"
          value={resolutionNote}
          onChange={(event) => setResolutionNote(event.target.value)}
          rows={4}
          style={{ width: "100%" }}
          placeholder="Ex.: cadastro conferido e senha alterada na página do usuário"
        />
        <small style={{ color: "#667085" }}>
          Registro interno para auditoria e acompanhamento administrativo.
        </small>
      </div>

      <div>
        <label htmlFor="manual-public-message" style={{ display: "block", marginBottom: 6 }}>
          Mensagem para o solicitante (opcional)
        </label>
        <InputTextarea
          id="manual-public-message"
          value={publicMessage}
          onChange={(event) => setPublicMessage(event.target.value)}
          rows={3}
          style={{ width: "100%" }}
          placeholder="Ex.: sua solicitação foi atendida; entraremos em contato com as orientações"
        />
      </div>

      {error && <Message severity="error" text={error} style={{ width: "100%", marginTop: 14 }} />}
    </Dialog>
  );
};

// ─── Main detail page ─────────────────────────────────────────────────────────

const AccessRequestAdminDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { can } = usePermissions();
  const numId = parseInt(id!, 10);

  const { data: detail, isLoading, refetch } = useAdminAccessRequestDetail(numId);

  const [startingReview, setStartingReview] = useState(false);
  const [showRequestInfo, setShowRequestInfo] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showCancel, setShowCancel] = useState(false);
  const [showManualComplete, setShowManualComplete] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const handleUpdate = (updated: AdminDetail) => {
    queryClient.setQueryData(ADMIN_ACCESS_REQUEST_KEYS.detail(numId), updated);
    queryClient.invalidateQueries(ADMIN_ACCESS_REQUEST_KEYS.counts);
    queryClient.invalidateQueries(['adminAccessRequestList']);
    setGlobalError(null);
  };

  const handleStartReview = async () => {
    setStartingReview(true);
    setGlobalError(null);
    try {
      const updated = await requestAdminStartReview(numId);
      handleUpdate(updated);
    } catch (err: any) {
      const msg = getApiError(err);
      if (err?.response?.status === 409) {
        setGlobalError(`Conflito: ${msg} Recarregando…`);
        refetch();
      } else {
        setGlobalError(msg);
      }
    } finally {
      setStartingReview(false);
    }
  };

  if (!can("accessRequest.view")) {
    return (
      <ContentPage title="Solicitação de acesso" description="Acesso restrito.">
        <Padding padding="16px" />
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  if (isLoading) return <Loading />;

  if (!detail) {
    return (
      <ContentPage title="Solicitação não encontrada" description="">
        <Button label="Voltar à lista" icon="pi pi-arrow-left" onClick={() => navigate("/solicitacoes-acesso")} />
      </ContentPage>
    );
  }

  const actions = detail.allowedActions;

  return (
    <ContentPage
      title={`Solicitação ${detail.protocol}`}
      description="Análise administrativa"
    >
      <ConfirmDialog />
      <RequestInfoModal
        id={numId}
        visible={showRequestInfo}
        onHide={() => setShowRequestInfo(false)}
        onSuccess={handleUpdate}
      />
      <RejectModal
        id={numId}
        visible={showReject}
        onHide={() => setShowReject(false)}
        onSuccess={handleUpdate}
      />
      <CancelModal
        id={numId}
        visible={showCancel}
        onHide={() => setShowCancel(false)}
        onSuccess={handleUpdate}
      />
      <ManualCompleteModal
        detail={detail}
        visible={showManualComplete}
        onHide={() => setShowManualComplete(false)}
        onSuccess={handleUpdate}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <Button
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          onClick={() => navigate("/solicitacoes-acesso")}
          tooltip="Voltar à lista"
        />
        <Tag
          value={STATUS_LABELS[detail.status] ?? detail.status}
          severity={STATUS_SEVERITY[detail.status]}
          style={{ fontSize: 14, padding: "6px 12px" }}
        />
        {detail.reviewer && (
          <span style={{ fontSize: 13, color: "#666" }}>
            Em análise por: <strong>{detail.reviewer.name}</strong>
          </span>
        )}
      </div>

      {globalError && (
        <Message severity="error" text={globalError} style={{ marginBottom: 16, width: "100%" }} />
      )}

      {/* Section 1 — Resumo e estado */}
      <Section title="Resumo e estado">
        <div className="grid">
          <DataField label="Protocolo" value={detail.protocol} />
          <DataField label="Tipo" value={accessRequestTypeLabel(detail.type)} />
          <DataField label="Origem" value={detail.origin === "MICROSOFT" ? "Microsoft" : "Local"} />
          <DataField label="Criado em" value={formatDate(detail.dates.createdAt)} />
          <DataField label="Atualizado em" value={formatDate(detail.dates.updatedAt)} />
          {detail.dates.expiresAt && (
            <DataField label="Expira em" value={formatDate(detail.dates.expiresAt)} />
          )}
          {detail.resolutionType && (
            <DataField label="Resolução" value={RESOLUTION_LABELS[detail.resolutionType] ?? detail.resolutionType} />
          )}
        </div>
      </Section>

      {/* Section 3 — Identificação */}
      <Section title="Identificação e contato">
        <div className="grid">
          <DataField label="Nome completo" value={detail.submittedData.fullName} />
          <DataField label="Telefone" value={detail.submittedData.phone} />
          <DataField
            label="Data de nascimento"
            value={formatCalendarDate(detail.submittedData.birthday)}
          />
          <DataField
            label="Sexo"
            value={detail.submittedData.sex != null ? SEX_LABEL[detail.submittedData.sex] : undefined}
          />
          <DataField
            label="Cor/Raça"
            value={detail.submittedData.colorRace != null ? COLOR_RACE_LABEL[detail.submittedData.colorRace] : undefined}
          />
          {detail.submittedData.usernameHint && (
            <DataField label="Nome de usuário sugerido" value={detail.submittedData.usernameHint} />
          )}
          {detail.submittedData.believesExistingAccess && (
            <DataField label="Acredita ter acesso existente" value="Sim" />
          )}
        </div>
      </Section>

      {/* Section 4 — Perfil operacional */}
      <Section title="Perfil operacional">
        <div className="grid">
          <DataField
            label="Tipo de perfil"
            value={
              detail.submittedData.profileTypeUnknown
                ? "Não sei informar"
                : detail.submittedData.profileType
                ? profileTypeLabel[detail.submittedData.profileType] ?? detail.submittedData.profileType
                : undefined
            }
          />
          <DataField
            label="Data inicial"
            value={formatCalendarDate(detail.submittedData.initialDate)}
          />
        </div>
        {detail.submittedData.requesterNote && (
          <p style={{ marginTop: 4, color: "#555" }}>
            <strong>Observação:</strong> {detail.submittedData.requesterNote}
          </p>
        )}
      </Section>

      {/* Section 5 — Tecnologias sociais */}
      <Section title="Tecnologias sociais">
        {detail.submittedData.socialTechnologyUnknown ? (
          <p style={{ color: "#aaa" }}>Não informadas</p>
        ) : detail.submittedData.socialTechnologies.length === 0 ? (
          <p style={{ color: "#aaa" }}>Nenhuma tecnologia informada</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {detail.submittedData.socialTechnologies.map((t) => (
              <Chip key={t.id} label={t.name} />
            ))}
          </div>
        )}
      </Section>

      {/* Section 6 — E-mail e evidência */}
      <Section title="E-mail e evidência">
        <div className="grid">
          <DataField label="E-mail" value={detail.submittedData.institutionalEmail} />
          <DataField
            label="Evidência"
            value={EMAIL_EVIDENCE_LABEL[detail.emailEvidence] ?? detail.emailEvidence}
          />
          {detail.submittedData.microsoftOid && (
            <DataField label="OID Microsoft" value={detail.submittedData.microsoftOid} />
          )}
        </div>
      </Section>

      {/* Section 7 — Candidatos */}
      <Section title="Possíveis correspondências">
          <Message
            severity="info"
            text="Use os atalhos abaixo para conferir ou alterar o cadastro. Nenhuma alteração é feita automaticamente por esta solicitação."
            style={{ marginBottom: 12, width: "100%" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            <Link to="/users" target="_blank" rel="noopener noreferrer">
              <Button label="Pesquisar usuários" icon="pi pi-search" size="small" outlined />
            </Link>
            <Link to="/perfis" target="_blank" rel="noopener noreferrer">
              <Button label="Pesquisar perfis" icon="pi pi-search" size="small" outlined />
            </Link>
            <Link to="/users/criar" target="_blank" rel="noopener noreferrer">
              <Button label="Criar usuário" icon="pi pi-user-plus" size="small" outlined />
            </Link>
            <Link to="/perfis/criar" target="_blank" rel="noopener noreferrer">
              <Button label="Criar perfil" icon="pi pi-plus" size="small" outlined />
            </Link>
          </div>
          {detail.userCandidates.length === 0 && detail.profileCandidates.length === 0 && (
            <Message
              severity="warn"
              text="Nenhum cadastro compatível foi encontrado automaticamente. Pesquise nas listagens ou crie um novo cadastro."
              style={{ marginBottom: 12, width: "100%" }}
            />
          )}
          {detail.conflicts.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              {detail.conflicts.map((c) => (
                <Message
                  key={c}
                  severity="warn"
                  text={accessRequestConflictMessage(c)}
                  style={{ marginBottom: 6, width: "100%" }}
                />
              ))}
            </div>
          )}

          {detail.userCandidates.length > 0 && (
            <>
              <h4 style={{ margin: "0 0 8px" }}>Usuários candidatos</h4>
              {detail.userCandidates.map((c) => (
                <UserCandidateRow key={c.id} candidate={c} />
              ))}
            </>
          )}

          {detail.profileCandidates.length > 0 && (
            <>
              <h4 style={{ margin: "16px 0 8px" }}>Perfis candidatos</h4>
              {detail.profileCandidates.map((c) => (
                <ProfileCandidateRow key={c.id} candidate={c} />
              ))}
            </>
          )}
      </Section>

      {/* Section 8 — Pendências */}
      {detail.missingFields.length > 0 && (
        <Section title="Dados não informados">
          <Message
            severity="warn"
            text="Estes dados não foram informados pelo solicitante. Confirme-os diretamente antes de alterar o cadastro."
            style={{ marginBottom: 12, width: "100%" }}
          />
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {detail.missingFields.map((f) => (
              <Tag key={f} value={accessRequestFieldLabel(f)} severity="danger" />
            ))}
          </div>
        </Section>
      )}

      {/* Section 9 — Mensagens */}
      {detail.messages.length > 0 && (
        <Section title="Mensagens com o solicitante">
          {detail.messages.map((m) => (
            <div
              key={m.id}
              style={{
                marginBottom: 12,
                padding: "10px 14px",
                borderRadius: 8,
                background: m.authorType === "ADMIN" ? "#fff8e1" : "#f5f5f5",
                borderLeft: `4px solid ${m.authorType === "ADMIN" ? "#ffa000" : "#9e9e9e"}`,
              }}
            >
              <p style={{ margin: 0, fontSize: 12, color: "#888", marginBottom: 4 }}>
                {m.authorType === "ADMIN" ? "Administração" : "Solicitante"} — {formatDateTime(m.createdAt)}
              </p>
              <p style={{ margin: 0 }}>{m.message}</p>
              {m.requestedFields && m.requestedFields.length > 0 && (
                <p style={{ margin: "4px 0 0", fontSize: 12, color: "#888" }}>
                  Campos: {m.requestedFields.map(accessRequestFieldLabel).join(", ")}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {/* Section 10 — Histórico interno */}
      {detail.events.length > 0 && (
        <Section title="Histórico interno">
          <Timeline
            value={detail.events}
            content={(e) => (
              <small>
                <strong>{accessRequestEventLabel(e.eventType)}</strong>
                {e.newStatus && ` → ${STATUS_LABELS[e.newStatus] ?? e.newStatus}`}
                {" — "}{formatDateTime(e.createdAt)}
                {typeof e.metadata?.resolutionNote === "string" && (
                  <span style={{ display: "block", marginTop: 4, color: "#667085" }}>
                    Registro: {e.metadata.resolutionNote}
                  </span>
                )}
              </small>
            )}
            marker={() => <span className="pi pi-circle-fill" style={{ color: "#1976D2" }} />}
          />
        </Section>
      )}

      {/* Section 11 — Decisão */}
      <Section title="Decisão">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {actions.includes("start_review") && (
            <Button
              label="Iniciar análise"
              icon="pi pi-play"
              loading={startingReview}
              onClick={handleStartReview}
            />
          )}
          {actions.includes("request_information") && can("accessRequest.review") && (
            <Button
              label="Solicitar informações"
              icon="pi pi-question-circle"
              severity="warning"
              onClick={() => setShowRequestInfo(true)}
            />
          )}
          {actions.includes("complete_manual") && can("accessRequest.review") && (
            <Button
              label="Marcar como concluída"
              icon="pi pi-check-circle"
              severity="success"
              onClick={() => setShowManualComplete(true)}
            />
          )}
          {actions.includes("reject") && can("accessRequest.review") && (
            <Button
              label="Recusar"
              icon="pi pi-times"
              severity="danger"
              outlined
              onClick={() => setShowReject(true)}
            />
          )}
          {actions.includes("cancel") && can("accessRequest.review") && (
            <Button
              label="Cancelar"
              icon="pi pi-ban"
              severity="danger"
              text
              onClick={() => setShowCancel(true)}
            />
          )}
        </div>
      </Section>
    </ContentPage>
  );
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <>
    <Divider />
    <section style={{ marginBottom: 8 }}>
      <h3 style={{ fontSize: 13, color: "#888", textTransform: "uppercase", marginBottom: 12, letterSpacing: "0.5px" }}>
        {title}
      </h3>
      {children}
    </section>
  </>
);

const UserCandidateRow = ({ candidate: c }: { candidate: UserCandidate }) => (
  <div
    style={{
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 8,
      background: "#fafafa",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>
          {c.name} <span style={{ color: "#888", fontWeight: 400 }}>({c.username})</span>
        </p>
        {c.email && <p style={{ margin: "2px 0 6px", fontSize: 13, color: "#666" }}>{c.email}</p>}
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {c.signals.map((s) => (
            <Tag key={s} value={accessRequestMatchSignalLabel(s)} severity="info" style={{ fontSize: 11 }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tag value={c.active ? "Ativo" : "Inativo"} severity={c.active ? "success" : "danger"} />
        <Link to={`/users/${c.id}`} target="_blank" rel="noopener noreferrer">
          <Button label="Abrir usuário" icon="pi pi-external-link" size="small" outlined />
        </Link>
      </div>
    </div>
    {c.profile && (
      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#555" }}>
        Perfil: {profileTypeLabel[c.profile.currentType] ?? c.profile.currentType}
        {c.profile.technologies.length > 0 && ` — ${c.profile.technologies.join(", ")}`}
      </p>
    )}
    {c.conflicts.length > 0 && (
      <div style={{ marginTop: 4 }}>
        {c.conflicts.map((cf) => (
          <Tag key={cf} value={accessRequestConflictLabel(cf)} severity="warning" style={{ fontSize: 11, marginRight: 4 }} />
        ))}
      </div>
    )}
  </div>
);

const ProfileCandidateRow = ({ candidate: c }: { candidate: ProfileCandidate }) => (
  <div
    style={{
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      padding: "10px 14px",
      marginBottom: 8,
      background: c.hasUser ? "#fff3e0" : "#fafafa",
    }}
  >
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div>
        <p style={{ margin: 0, fontWeight: 600 }}>{c.name}</p>
        <p style={{ margin: "2px 0 6px", fontSize: 13, color: "#666" }}>
          {profileTypeLabel[c.currentType] ?? c.currentType}
          {c.hasUser && " — já possui usuário vinculado"}
        </p>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {c.signals.map((s) => (
            <Tag key={s} value={accessRequestMatchSignalLabel(s)} severity="info" style={{ fontSize: 11 }} />
          ))}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Tag value={c.active ? "Ativo" : "Inativo"} severity={c.active ? "success" : "danger"} />
        <Link to={`/perfis/${c.id}`} target="_blank" rel="noopener noreferrer">
          <Button label="Abrir perfil" icon="pi pi-external-link" size="small" outlined />
        </Link>
      </div>
    </div>
    {c.conflicts.length > 0 && (
      <div style={{ marginTop: 4 }}>
        {c.conflicts.map((cf) => (
          <Tag key={cf} value={accessRequestConflictLabel(cf)} severity="warning" style={{ fontSize: 11, marginRight: 4 }} />
        ))}
      </div>
    )}
  </div>
);

export default AccessRequestAdminDetail;
