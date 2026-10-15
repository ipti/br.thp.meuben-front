import { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Tag } from "primereact/tag";
import { Timeline } from "primereact/timeline";
import { Message } from "primereact/message";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import { Divider } from "primereact/divider";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  requestGetPublicStatus,
  requestGetMicrosoftStatus,
  requestRespondToRequest,
  requestActivateAccess,
  requestCancelAccess,
} from "../../../Services/AccessRequest/request";
import {
  PublicAccessRequest,
  AccessRequestStatus,
  AccessRequestResolutionType,
} from "../../../Services/AccessRequest/types";
import { profileTypeLabel } from "../../../Controller/controllerGlobal";
import { formatCalendarDate } from "../date";
import {
  getSavedAccessRequests,
  parseTrackingCode,
  removeSavedAccessRequest,
  saveAccessRequest,
} from "../../../Services/AccessRequest/storage";
import { accessRequestFieldLabel } from "../../../Services/AccessRequest/labels";
import { Page, TopBar } from "./styles";

type ActionView = "respond" | "activate" | null;

interface AuthInfo {
  protocol: string;
  trackingKey?: string;
  microsoftContext?: string;
}

const requesterAuth = (auth: AuthInfo) =>
  auth.microsoftContext
    ? { microsoftContext: auth.microsoftContext }
    : { trackingKey: auth.trackingKey };

const STATUS_LABELS: Record<AccessRequestStatus, string> = {
  DRAFT: "Rascunho",
  PENDING_REVIEW: "Aguardando análise",
  IN_REVIEW: "Em análise",
  NEEDS_INFORMATION: "Informações solicitadas",
  APPROVED_PENDING_ACTIVATION: "Aprovada — aguardando ativação",
  COMPLETED: "Concluída",
  REJECTED: "Recusada",
  CANCELLED: "Cancelada",
  EXPIRED: "Expirada",
};

const STATUS_SEVERITY: Record<
  AccessRequestStatus,
  "success" | "info" | "warning" | "danger" | undefined
> = {
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

const SEX_LABEL: Record<number, string> = { 0: "Não declarado", 1: "Masculino", 2: "Feminino" };
const COLOR_RACE_LABEL: Record<number, string> = {
  0: "Não declarada",
  1: "Branca",
  2: "Preta",
  3: "Parda",
  4: "Amarela",
  5: "Indígena",
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

// ─── Entry form ──────────────────────────────────────────────────────────────

interface EntryFormProps {
  onSuccess: (auth: AuthInfo, data: PublicAccessRequest) => void;
}

const EntryForm = ({ onSuccess }: EntryFormProps) => {
  const [trackingCode, setTrackingCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const auth = parseTrackingCode(trackingCode);
    if (!auth) {
      setError("Informe o código de acompanhamento completo.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await requestGetPublicStatus(auth.protocol, auth.trackingKey);
      saveAccessRequest(auth.protocol, auth.trackingKey);
      onSuccess(auth, data);
    } catch (err: any) {
      setError("Não foi possível localizar esta solicitação. Confira os dados informados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px" }}>
      <h2 style={{ marginBottom: 4 }}>Acompanhar solicitação</h2>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Se a solicitação foi feita neste dispositivo, ela abre automaticamente.
        Em outro dispositivo, informe o código único recebido ao final do cadastro.
      </p>

      <form onSubmit={handleSubmit}>
        <div className="p-field" style={{ marginBottom: 16 }}>
          <label htmlFor="trackingCode">Código de acompanhamento</label>
          <Password
            inputId="trackingCode"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value)}
            placeholder="Cole o código completo"
            style={{ width: "100%" }}
            inputStyle={{ width: "100%", marginTop: 6 }}
            feedback={false}
            toggleMask
          />
        </div>

        {error && (
          <Message severity="error" text={error} style={{ marginBottom: 16, width: "100%" }} />
        )}

        <Button
          type="submit"
          label="Consultar solicitação"
          icon="pi pi-search"
          loading={loading}
          style={{ width: "100%" }}
        />
      </form>
      <Divider align="center">ou</Divider>
      <Button
        type="button"
        label="Consultar com Microsoft"
        icon="pi pi-microsoft"
        severity="secondary"
        outlined
        style={{ width: "100%" }}
        onClick={() => {
          window.location.href = `${process.env.REACT_APP_API_PATH}auth/microsoft?intent=track_request&select_account=true`;
        }}
      />
    </div>
  );
};

// ─── Status view ─────────────────────────────────────────────────────────────

interface StatusViewProps {
  auth: AuthInfo;
  data: PublicAccessRequest;
  onRefresh: (data: PublicAccessRequest) => void;
  onBack: () => void;
  onForget: () => void;
}

const StatusView = ({ auth, data, onRefresh, onBack, onForget }: StatusViewProps) => {
  const navigate = useNavigate();
  const [actionView, setActionView] = useState<ActionView>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  useEffect(() => {
    if (auth.trackingKey) saveAccessRequest(auth.protocol, auth.trackingKey);
  }, [auth.protocol, auth.trackingKey]);

  const lastAdminMessage = [...data.messages]
    .reverse()
    .find((m) => m.authorType === "ADMIN");

  const handleCancel = () => {
    confirmDialog({
      message: "Deseja cancelar esta solicitação? Esta ação não pode ser desfeita.",
      header: "Confirmar cancelamento",
      icon: "pi pi-exclamation-triangle",
      acceptLabel: "Sim, cancelar",
      rejectLabel: "Não",
      acceptClassName: "p-button-danger",
      accept: async () => {
        setCancelLoading(true);
        setGlobalError(null);
        try {
          const updated = await requestCancelAccess(auth.protocol, {
            ...requesterAuth(auth),
          });
          onRefresh(updated);
        } catch (err: any) {
          setGlobalError(getApiError(err));
        } finally {
          setCancelLoading(false);
        }
      },
    });
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 16px" }}>
      <ConfirmDialog />

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <Button
          icon="pi pi-arrow-left"
          text
          severity="secondary"
          onClick={onBack}
          tooltip="Nova consulta"
        />
        <div>
          <h2 style={{ margin: 0 }}>Solicitação {data.protocol}</h2>
          <div style={{ marginTop: 4 }}>
            <Tag
              value={STATUS_LABELS[data.status] ?? data.status}
              severity={STATUS_SEVERITY[data.status]}
            />
          </div>
        </div>
      </div>

      <Message
        severity="info"
        text="Esta solicitação está salva neste dispositivo para facilitar consultas enquanto as notificações por e-mail não estão disponíveis."
        style={{ marginBottom: 16, width: "100%" }}
      />

      {globalError && (
        <Message severity="error" text={globalError} style={{ marginBottom: 16, width: "100%" }} />
      )}

      {/* Dates */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>
          Datas
        </h3>
        <div className="grid">
          <div className="col-6 md:col-3">
            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Criada em</p>
            <p style={{ margin: 0 }}>{formatDate(data.dates.createdAt)}</p>
          </div>
          <div className="col-6 md:col-3">
            <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Última atualização</p>
            <p style={{ margin: 0 }}>{formatDate(data.dates.updatedAt)}</p>
          </div>
          {data.dates.expiresAt && (
            <div className="col-6 md:col-3">
              <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Expira em</p>
              <p style={{ margin: 0 }}>{formatDate(data.dates.expiresAt)}</p>
            </div>
          )}
          {data.dates.approvedAt && (
            <div className="col-6 md:col-3">
              <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>Aprovada em</p>
              <p style={{ margin: 0 }}>{formatDate(data.dates.approvedAt)}</p>
            </div>
          )}
        </div>
      </section>

      <Divider />

      {/* Submitted data summary */}
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, color: "#888", textTransform: "uppercase", marginBottom: 8 }}>
          Dados enviados
        </h3>
        <div className="grid">
          <DataField label="Nome completo" value={data.submittedData.fullName} />
          {data.submittedData.institutionalEmail && (
            <DataField label="E-mail" value={data.submittedData.institutionalEmail} />
          )}
          {data.submittedData.phone && (
            <DataField label="Telefone" value={data.submittedData.phone} />
          )}
          {data.submittedData.profileType && (
            <DataField
              label="Tipo de perfil"
              value={profileTypeLabel[data.submittedData.profileType] ?? data.submittedData.profileType}
            />
          )}
          {data.submittedData.profileTypeUnknown && (
            <DataField label="Tipo de perfil" value="Não sei informar" />
          )}
          {data.submittedData.birthday && (
            <DataField
              label="Data de nascimento"
              value={formatCalendarDate(data.submittedData.birthday)}
            />
          )}
          {data.submittedData.sex != null && (
            <DataField label="Sexo" value={SEX_LABEL[data.submittedData.sex] ?? "—"} />
          )}
          {data.submittedData.colorRace != null && (
            <DataField
              label="Cor/Raça"
              value={COLOR_RACE_LABEL[data.submittedData.colorRace] ?? "—"}
            />
          )}
          {data.submittedData.socialTechnologies.length > 0 && (
            <DataField
              label="Tecnologias sociais"
              value={data.submittedData.socialTechnologies.join(", ")}
            />
          )}
          {data.submittedData.socialTechnologyUnknown && (
            <DataField label="Tecnologias sociais" value="Não sei informar" />
          )}
          {data.submittedData.requesterNote && (
            <DataField label="Observação" value={data.submittedData.requesterNote} />
          )}
        </div>
      </section>

      {/* Messages */}
      {data.messages.length > 0 && (
        <>
          <Divider />
          <section style={{ marginBottom: 24 }}>
            <h3
              style={{ fontSize: 14, color: "#888", textTransform: "uppercase", marginBottom: 12 }}
            >
              Mensagens
            </h3>
            {data.messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  marginBottom: 12,
                  padding: "12px 16px",
                  borderRadius: 8,
                  background: msg.authorType === "ADMIN" ? "#fff8e1" : "#f5f5f5",
                  borderLeft: `4px solid ${msg.authorType === "ADMIN" ? "#ffa000" : "#9e9e9e"}`,
                }}
              >
                <p style={{ margin: 0, fontSize: 12, color: "#888", marginBottom: 4 }}>
                  {msg.authorType === "ADMIN" ? "Administração" : "Você"} —{" "}
                  {formatDateTime(msg.createdAt)}
                </p>
                <p style={{ margin: 0 }}>{msg.message}</p>
                {msg.requestedFields && msg.requestedFields.length > 0 && (
                  <p style={{ margin: "6px 0 0", fontSize: 12, color: "#888" }}>
                    Campos solicitados: {msg.requestedFields.map(accessRequestFieldLabel).join(", ")}
                  </p>
                )}
              </div>
            ))}
          </section>
        </>
      )}

      {/* History timeline */}
      {data.history.length > 0 && (
        <>
          <Divider />
          <section style={{ marginBottom: 24 }}>
            <h3
              style={{ fontSize: 14, color: "#888", textTransform: "uppercase", marginBottom: 12 }}
            >
              Histórico
            </h3>
            <Timeline
              value={data.history}
              content={(item) => (
                <small>
                  <strong>{STATUS_LABELS[item.status as AccessRequestStatus] ?? item.status}</strong>{" "}
                  — {formatDateTime(item.createdAt)}
                </small>
              )}
              marker={() => <span className="pi pi-circle-fill" style={{ color: "#1976D2" }} />}
            />
          </section>
        </>
      )}

      {/* Terminal state messages */}
      {data.status === "REJECTED" && (
        <>
          <Divider />
          <Message
            severity="error"
            style={{ marginBottom: 12, width: "100%" }}
            text="Esta solicitação foi recusada. Você pode iniciar uma nova solicitação se desejar."
          />
          <Button
            label="Iniciar nova solicitação"
            icon="pi pi-plus"
            severity="secondary"
            onClick={() => navigate("/solicitar-acesso")}
          />
        </>
      )}
      {data.status === "CANCELLED" && (
        <>
          <Divider />
          <Message
            severity="warn"
            style={{ marginBottom: 12, width: "100%" }}
            text="Esta solicitação foi cancelada. Nenhuma ativação está disponível."
          />
          <Button
            label="Iniciar nova solicitação"
            icon="pi pi-plus"
            severity="secondary"
            onClick={() => navigate("/solicitar-acesso")}
          />
        </>
      )}
      {data.status === "EXPIRED" && (
        <>
          <Divider />
          <Message
            severity="warn"
            style={{ marginBottom: 12, width: "100%" }}
            text="O prazo desta solicitação expirou. Você pode iniciar uma nova solicitação."
          />
          <Button
            label="Iniciar nova solicitação"
            icon="pi pi-plus"
            severity="secondary"
            onClick={() => navigate("/solicitar-acesso")}
          />
        </>
      )}
      {data.status === "COMPLETED" && (
        <>
          <Divider />
          <Message
            severity="success"
            style={{ marginBottom: 12, width: "100%" }}
            text={`Solicitação concluída em ${formatDate(data.dates.completedAt)}.`}
          />
          {data.origin === "MICROSOFT" ? (
            <Button
              label="Entrar com Microsoft"
              icon="pi pi-microsoft"
              onClick={() => {
                window.location.href = `${process.env.REACT_APP_API_PATH}auth/microsoft`;
              }}
            />
          ) : (
            <Button
              label="Ir para o login"
              icon="pi pi-sign-in"
              onClick={() => navigate("/login")}
            />
          )}
        </>
      )}

      {/* Actions */}
      {actionView === null && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 16 }}>
          {data.allowedActions.includes("respond") && (
            <Button
              label="Complementar informações"
              icon="pi pi-reply"
              onClick={() => setActionView("respond")}
            />
          )}
          {data.allowedActions.includes("activate") && (
            <Button
              label="Ativar conta"
              icon="pi pi-check-circle"
              severity="success"
              onClick={() => setActionView("activate")}
            />
          )}
      {data.allowedActions.includes("cancel") && (
            <Button
              label="Cancelar solicitação"
              icon="pi pi-times"
              severity="danger"
              outlined
              loading={cancelLoading}
              onClick={handleCancel}
            />
          )}
        </div>
      )}

      <Button
        type="button"
        label="Esquecer neste dispositivo"
        icon="pi pi-trash"
        severity="secondary"
        text
        onClick={onForget}
        style={{ marginTop: 12 }}
      />

      {/* Respond form */}
      {actionView === "respond" && lastAdminMessage && (
        <RespondForm
          auth={auth}
          data={data}
          adminMessage={lastAdminMessage}
          onSuccess={(updated) => {
            setActionView(null);
            onRefresh(updated);
          }}
          onCancel={() => setActionView(null)}
        />
      )}

      {/* Activate form */}
      {actionView === "activate" && data.activationAvailable && data.activationToken && (
        <ActivateForm
          auth={auth}
          data={data}
          activationToken={data.activationToken}
          resolutionType={data.resolutionType}
          onSuccess={(updated) => {
            setActionView(null);
            onRefresh(updated);
          }}
          onCancel={() => setActionView(null)}
        />
      )}
    </div>
  );
};

// ─── Respond form ─────────────────────────────────────────────────────────────

interface RespondFormProps {
  auth: AuthInfo;
  data: PublicAccessRequest;
  adminMessage: { message: string; requestedFields?: string[] };
  onSuccess: (updated: PublicAccessRequest) => void;
  onCancel: () => void;
}

const RespondForm = ({ auth, data, adminMessage, onSuccess, onCancel }: RespondFormProps) => {
  const [message, setMessage] = useState("");
  const [fullName, setFullName] = useState(data.submittedData.fullName ?? "");
  const [phone, setPhone] = useState(data.submittedData.phone ?? "");
  const [institutionalEmail, setInstitutionalEmail] = useState(
    data.submittedData.institutionalEmail ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requested = new Set(adminMessage.requestedFields ?? []);
  const showField = (name: string) =>
    !adminMessage.requestedFields || requested.has(name);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const payload: any = requesterAuth(auth);
      if (message.trim()) payload.message = message.trim();
      if (showField("fullName") && fullName.trim()) payload.fullName = fullName.trim();
      if (showField("phone") && phone.trim()) payload.phone = phone.trim();
      if (
        showField("institutionalEmail") &&
        institutionalEmail.trim() &&
        data.origin !== "MICROSOFT"
      )
        payload.institutionalEmail = institutionalEmail.trim();

      const updated = await requestRespondToRequest(auth.protocol, payload);
      onSuccess(updated);
    } catch (err: any) {
      setError(getApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 24, padding: 20, border: "1px solid #e0e0e0", borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>Complementar informações</h3>

      <div
        style={{
          padding: "12px 16px",
          background: "#fff8e1",
          borderLeft: "4px solid #ffa000",
          borderRadius: 4,
          marginBottom: 20,
        }}
      >
        <p style={{ margin: 0, fontSize: 12, color: "#888", marginBottom: 4 }}>
          Mensagem da administração
        </p>
        <p style={{ margin: 0 }}>{adminMessage.message}</p>
      </div>

      <form onSubmit={handleSubmit}>
        {showField("fullName") && (
          <FieldRow label="Nome completo">
            <InputText
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              style={{ width: "100%" }}
            />
          </FieldRow>
        )}
        {showField("phone") && (
          <FieldRow label="Telefone">
            <InputText
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%" }}
            />
          </FieldRow>
        )}
        {showField("institutionalEmail") && data.origin !== "MICROSOFT" && (
          <FieldRow label="E-mail institucional">
            <InputText
              value={institutionalEmail}
              onChange={(e) => setInstitutionalEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </FieldRow>
        )}

        <FieldRow label="Mensagem (opcional)">
          <InputText
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Adicione uma mensagem à administração"
            style={{ width: "100%" }}
          />
        </FieldRow>

        {error && (
          <Message severity="error" text={error} style={{ marginBottom: 12, width: "100%" }} />
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="button"
            label="Voltar"
            severity="secondary"
            outlined
            onClick={onCancel}
          />
          <Button type="submit" label="Enviar resposta" icon="pi pi-send" loading={loading} />
        </div>
      </form>
    </div>
  );
};

// ─── Activate form ─────────────────────────────────────────────────────────────

interface ActivateFormProps {
  auth: AuthInfo;
  data: PublicAccessRequest;
  activationToken: string;
  resolutionType?: AccessRequestResolutionType;
  onSuccess: (updated: PublicAccessRequest) => void;
  onCancel: () => void;
}

const ActivateForm = ({
  auth,
  data,
  activationToken,
  resolutionType,
  onSuccess,
  onCancel,
}: ActivateFormProps) => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const needsUsername =
    resolutionType === "CREATE_USER_AND_PROFILE" ||
    resolutionType === "CREATE_USER_FOR_PROFILE";
  const needsPassword =
    needsUsername || resolutionType === "RESET_EXISTING_USER_PASSWORD";
  const isMicrosoftLink = resolutionType === "LINK_MICROSOFT";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (needsPassword) {
      if (password.length < 8) {
        setError("A senha deve ter pelo menos 8 caracteres.");
        return;
      }
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        return;
      }
    }
    if (needsUsername && username.length < 5) {
      setError("O nome de usuário deve ter pelo menos 5 caracteres.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const payload: any = {
        activationToken,
        ...requesterAuth(auth),
      };
      if (needsUsername) payload.username = username.trim();
      if (needsPassword) payload.password = password;

      const updated = await requestActivateAccess(auth.protocol, payload);

      // Clear sensitive values from state
      setPassword("");
      setConfirmPassword("");

      setCompleted(true);
      onSuccess(updated);
    } catch (err: any) {
      const msg = getApiError(err);
      // Clear passwords on sensitive errors
      setPassword("");
      setConfirmPassword("");
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (completed) {
    return (
      <div style={{ marginTop: 24, padding: 20, border: "1px solid #4caf50", borderRadius: 8 }}>
        <Message
          severity="success"
          text="Conta ativada com sucesso!"
          style={{ marginBottom: 16, width: "100%" }}
        />
        <Button label="Entrar no MeuBen" icon="pi pi-sign-in" onClick={() => navigate("/login")} />
      </div>
    );
  }

  if (isMicrosoftLink) {
    return (
      <div style={{ marginTop: 24, padding: 20, border: "1px solid #e0e0e0", borderRadius: 8 }}>
        <h3 style={{ marginTop: 0 }}>Vincular conta Microsoft</h3>
        <p>
          A conta Microsoft autenticada será vinculada ao seu acesso no MeuBen. Você também poderá
          continuar usando usuário e senha.
        </p>
        {error && (
          <Message severity="error" text={error} style={{ marginBottom: 12, width: "100%" }} />
        )}
        <div style={{ display: "flex", gap: 8 }}>
          <Button type="button" label="Voltar" severity="secondary" outlined onClick={onCancel} />
          <Button
            label="Confirmar vínculo"
            icon="pi pi-microsoft"
            loading={loading}
            onClick={handleSubmit as any}
          />
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: 24, padding: 20, border: "1px solid #e0e0e0", borderRadius: 8 }}>
      <h3 style={{ marginTop: 0 }}>
        {resolutionType === "RESET_EXISTING_USER_PASSWORD" ? "Redefinir senha" : "Ativar conta"}
      </h3>

      {resolutionType === "RESET_EXISTING_USER_PASSWORD" && data.submittedData.usernameHint && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ margin: 0, fontSize: 12, color: "#888" }}>Nome de usuário</p>
          <p style={{ margin: 0, fontWeight: 600 }}>{data.submittedData.usernameHint}</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {needsUsername && (
          <FieldRow label="Nome de usuário (5–32 caracteres)">
            <InputText
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              minLength={5}
              maxLength={32}
              autoComplete="username"
              style={{ width: "100%" }}
            />
          </FieldRow>
        )}

        <FieldRow label="Nova senha (mín. 8 caracteres)">
          <Password
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            inputStyle={{ width: "100%" }}
            style={{ width: "100%" }}
            feedback
            toggleMask
            autoComplete="new-password"
          />
        </FieldRow>

        <FieldRow label="Confirmar senha">
          <Password
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            inputStyle={{ width: "100%" }}
            style={{ width: "100%" }}
            feedback={false}
            toggleMask
            autoComplete="new-password"
          />
        </FieldRow>

        {error && (
          <Message severity="error" text={error} style={{ marginBottom: 12, width: "100%" }} />
        )}

        <div style={{ display: "flex", gap: 8 }}>
          <Button type="button" label="Voltar" severity="secondary" outlined onClick={onCancel} />
          <Button
            type="submit"
            label={resolutionType === "RESET_EXISTING_USER_PASSWORD" ? "Redefinir senha" : "Ativar conta"}
            icon="pi pi-check"
            loading={loading}
          />
        </div>
      </form>
    </div>
  );
};

// ─── Helper components ────────────────────────────────────────────────────────

const DataField = ({ label, value }: { label: string; value?: string | null }) =>
  value ? (
    <div className="col-6 md:col-4" style={{ marginBottom: 8 }}>
      <p style={{ margin: 0, fontSize: 12, color: "#aaa" }}>{label}</p>
      <p style={{ margin: 0 }}>{value}</p>
    </div>
  ) : null;

const FieldRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: "block", marginBottom: 6 }}>{label}</label>
    {children}
  </div>
);

// ─── Root component ───────────────────────────────────────────────────────────

type PageState =
  | { view: "loading" }
  | { view: "entry" }
  | { view: "status"; auth: AuthInfo; data: PublicAccessRequest };

const LoginBackButton = () => (
  <TopBar aria-label="Navegação da página">
    <Link to="/login">← Voltar para o login</Link>
  </TopBar>
);

const AccessRequestTrack = () => {
  const [searchParams] = useSearchParams();
  const microsoftContextParam = searchParams.get("context")?.trim() || "";
  const [state, setState] = useState<PageState>({ view: "loading" });

  useEffect(() => {
    const microsoftContext = microsoftContextParam;
    if (microsoftContext) {
      requestGetMicrosoftStatus(microsoftContext)
        .then((result) => {
          const requests = "requests" in result ? result.requests : [result];
          const latest = requests[0];
          if (!latest) {
            setState({ view: "entry" });
            return;
          }
          setState({
            view: "status",
            auth: { protocol: latest.protocol, microsoftContext },
            data: latest,
          });
        })
        .catch(() => setState({ view: "entry" }));
      return;
    }

    const saved = getSavedAccessRequests()[0];
    if (!saved) {
      setState({ view: "entry" });
      return;
    }

    requestGetPublicStatus(saved.protocol, saved.trackingKey)
      .then((data) => setState({ view: "status", auth: saved, data }))
      .catch(() => {
        removeSavedAccessRequest(saved.protocol);
        setState({ view: "entry" });
      });
  }, [microsoftContextParam]);

  if (state.view === "loading") {
    return (
      <Page>
        <LoginBackButton />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 16px" }}>
          <p role="status">Procurando solicitações salvas neste dispositivo...</p>
        </div>
      </Page>
    );
  }

  if (state.view === "entry") {
    return (
      <Page>
        <LoginBackButton />
        <EntryForm
          onSuccess={(auth, data) => setState({ view: "status", auth, data })}
        />
      </Page>
    );
  }

  return (
    <Page>
      <LoginBackButton />
      <StatusView
        auth={state.auth}
        data={state.data}
        onRefresh={(updated) =>
          setState({ view: "status", auth: state.auth, data: updated })
        }
        onBack={() => setState({ view: "entry" })}
        onForget={() => {
          removeSavedAccessRequest(state.auth.protocol);
          setState({ view: "entry" });
        }}
      />
    </Page>
  );
};

export default AccessRequestTrack;
