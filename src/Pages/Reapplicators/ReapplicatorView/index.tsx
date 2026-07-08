import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useNavigate, useParams } from "react-router-dom";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import {
  formatarData,
  profileTypeLabel,
  VerifyColor,
  VerifySex,
} from "../../../Controller/controllerGlobal";
import { usePermissions } from "../../../hooks/usePermissions";
import { useFetchProfileOne, useFetchProfileTypeLog } from "../../../Services/Profile/query";
import { Padding, Row } from "../../../Styles/styles";

const Field = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="col-12 md:col-4" style={{ marginBottom: 8 }}>
    <div style={{ fontSize: 11, fontWeight: 600, color: "#64748b", textTransform: "uppercase", marginBottom: 2 }}>
      {label}
    </div>
    <div style={{ fontSize: 14 }}>{value ?? "—"}</div>
  </div>
);

const ReapplicatorView = () => {
  const { id } = useParams<{ id: string }>();
  const history = useNavigate();
  const { can } = usePermissions();
  const numId = parseInt(id!, 10);

  const { data: profile, isLoading } = useFetchProfileOne(numId);
  const { data: logs } = useFetchProfileTypeLog(numId);

  if (isLoading) return <Loading />;
  if (!profile) {
    return (
      <ContentPage title="Reaplicador" description="">
        <Padding padding="16px" />
        <p>Perfil não encontrado.</p>
      </ContentPage>
    );
  }

  return (
    <ContentPage title={profile.name ?? "Reaplicador"} description="Detalhes do reaplicador.">
      <Padding />

      <Row id="end">
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            label="Voltar"
            icon="pi pi-arrow-left"
            severity="secondary"
            outlined
            onClick={() => history("/reaplicadores")}
          />
          {can("profile.edit") && (
            <Button
              label="Editar"
              icon="pi pi-pencil"
              onClick={() => history(`/reaplicadores/${id}/editar`)}
            />
          )}
        </div>
      </Row>

      <Padding padding="16px" />

      {/* ── Dados pessoais ─────────────────────────────────────── */}
      <Divider align="left">
        <span style={{ fontWeight: 600, fontSize: 14 }}>Dados Pessoais</span>
      </Divider>

      <div className="grid">
        <Field label="Nome" value={profile.name} />
        <Field label="Tipo" value={profileTypeLabel[profile.current_type] ?? profile.current_type} />
        <Field label="E-mail" value={profile.email} />
        <Field label="Telefone" value={profile.phone} />
        <Field label="Data de Nascimento" value={profile.birthday ? formatarData(profile.birthday) : undefined} />
        <Field label="Gênero" value={VerifySex(profile.sex ?? 0)?.type} />
        <Field label="Cor/Raça" value={VerifyColor(profile.color_race ?? 0)?.name} />
        <Field label="Data de Início" value={profile.initial_date ? formatarData(profile.initial_date) : undefined} />
        <Field label="Status" value={profile.active ? "Ativo" : "Inativo"} />
      </div>

      {/* ── Tecnologias Sociais ────────────────────────────────── */}
      <Divider align="left">
        <span style={{ fontWeight: 600, fontSize: 14 }}>Tecnologias Sociais</span>
      </Divider>

      {profile.profile_social_technology?.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {profile.profile_social_technology.map((st: any) => (
            <span
              key={st.social_technology_fk}
              style={{
                padding: "4px 12px",
                background: "#e0f2fe",
                borderRadius: 20,
                fontSize: 13,
                color: "#0369a1",
              }}
            >
              {st.social_technology?.name ?? st.social_technology_fk}
            </span>
          ))}
        </div>
      ) : (
        <p style={{ color: "#94a3b8", fontSize: 13 }}>Nenhuma tecnologia social vinculada.</p>
      )}

      {/* ── Conta de login ────────────────────────────────────── */}
      {profile.user_fk && (
        <>
          <Divider align="left">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Conta de Login</span>
          </Divider>
          <div className="grid">
            <Field label="Usuário vinculado" value={profile.user?.username ?? `ID ${profile.user_fk}`} />
          </div>
          {can("user.edit") && (
            <Button
              label="Editar usuário"
              icon="pi pi-user-edit"
              size="small"
              outlined
              onClick={() => history(`/users/${profile.user_fk}`)}
            />
          )}
        </>
      )}

      {/* ── Histórico de tipo ─────────────────────────────────── */}
      {logs?.length ? (
        <>
          <Divider align="left">
            <span style={{ fontWeight: 600, fontSize: 14 }}>Histórico de Tipo</span>
          </Divider>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {logs.map((log: any) => (
              <div key={log.id} style={{ fontSize: 13, color: "#475569" }}>
                <strong>{profileTypeLabel[log.previous_type] ?? log.previous_type}</strong>
                {" → "}
                <strong>{profileTypeLabel[log.new_type] ?? log.new_type}</strong>
                {log.reason && <span style={{ color: "#94a3b8" }}> — {log.reason}</span>}
                {log.created_at && (
                  <span style={{ color: "#94a3b8" }}> ({formatarData(log.created_at)})</span>
                )}
              </div>
            ))}
          </div>
        </>
      ) : null}
    </ContentPage>
  );
};

export default ReapplicatorView;
