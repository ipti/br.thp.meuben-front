import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { Dropdown } from "primereact/dropdown";
import { Tag } from "primereact/tag";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import ProfileProvider, { ProfileContext } from "../../../Context/Profile/context";
import { ProfileContextTypes, ProfileTypeLogEntry } from "../../../Context/Profile/type";
import {
  formatarData,
  profileTypeLabel,
  VerifyColor,
  VerifySex,
} from "../../../Controller/controllerGlobal";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { useFetchUsersWithoutProfile } from "../../../Services/Profile/query";
import color from "../../../Styles/colors";
import { Padding, Row } from "../../../Styles/styles";
import { usePermissions } from "../../../hooks/usePermissions";

// ─── Styled ──────────────────────────────────────────────────────────────────

const HeroCard = styled.div`
  background: #fff;
  border: 1px solid ${color.colorBorderCard};
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  margin-bottom: 24px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
`;


const HeroInfo = styled.div`
  flex: 1;
  min-width: 200px;
  h2 {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 700;
    color: ${color.colorsBaseInkNormal};
  }
`;

const HeroBadges = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const HeroMeta = styled.div`
  font-size: 13px;
  color: ${color.colorsBaseInkLight};
  margin-top: 8px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const SectionCard = styled.div`
  background: #fff;
  border: 1px solid ${color.colorBorderCard};
  border-radius: 12px;
  padding: 20px 24px;
  height: 100%;
`;

const SectionTitle = styled.div`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: ${color.colorsBaseInkLight};
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid ${color.colorsBaseCloudNormal};
  padding-bottom: 10px;
`;

const FieldRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin-bottom: 12px;

  .field-icon {
    color: ${color.colorsBaseProductNormal};
    font-size: 14px;
    margin-top: 2px;
    flex-shrink: 0;
    width: 16px;
    text-align: center;
  }

  .field-content {
    flex: 1;
    min-width: 0;
    label {
      display: block;
      font-size: 11px;
      color: ${color.colorsBaseInkLight};
      margin-bottom: 1px;
    }
    span {
      font-size: 14px;
      color: ${color.colorsBaseInkNormal};
      font-weight: 500;
      word-break: break-word;
    }
  }
`;

const UserBox = styled.div`
  background: ${color.colorCard};
  border: 1px solid ${color.colorBorderCard};
  border-radius: 10px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;


const TimelineItem = styled.div<{ isFirst?: boolean }>`
  display: flex;
  gap: 16px;
  padding-bottom: 20px;
  position: relative;

  &::before {
    content: "";
    position: absolute;
    left: 7px;
    top: 20px;
    bottom: 0;
    width: 2px;
    background: ${color.colorBorderCard};
    display: ${({ isFirst }) => (isFirst ? "none" : "block")};
  }
`;

const TimelineDot = styled.div<{ isFirst?: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${({ isFirst }) =>
    isFirst ? color.colorsBaseProductNormal : color.colorsBaseCloudNormal};
  border: 2px solid ${({ isFirst }) =>
    isFirst ? color.colorsBaseProductNormal : color.colorBorderCard};
  flex-shrink: 0;
  margin-top: 2px;
  z-index: 1;
`;

const TimelineContent = styled.div`
  flex: 1;
  padding-bottom: 4px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 24px 16px;
  color: ${color.colorsBaseInkLight};
  font-size: 14px;
  i {
    display: block;
    font-size: 28px;
    margin-bottom: 8px;
    opacity: 0.4;
  }
`;

// ─── Helpers ─────────────────────────────────────────────────────────────────

// ─── Component ───────────────────────────────────────────────────────────────

const ProfileView = () => (
  <ProfileProvider>
    <ProfileViewPage />
  </ProfileProvider>
);

const ProfileViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const props = useContext(ProfileContext) as ProfileContextTypes;
  const history = useNavigate();
  const { can } = usePermissions();
  const { confirmDelete, confirmUnlink, linkUserMutation } = ControllerProfile();
  const { data: usersWithoutProfile } = useFetchUsersWithoutProfile();

  const [showLinkDropdown, setShowLinkDropdown] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | undefined>();

  useEffect(() => {
    if (id) {
      const numId = parseInt(id, 10);
      props.loadOne(numId);
      props.loadTypeLog(numId);
    }
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (props.isLoadingOne) return <Loading />;

  if (!props.profile) {
    return (
      <ContentPage title="Perfil" description="Detalhes do perfil.">
        <Padding padding="16px" />
        <p>Perfil não encontrado.</p>
      </ContentPage>
    );
  }

  const p    = props.profile;
  const sex  = VerifySex(p.sex);
  const race = VerifyColor(p.color_race);

  const handleLink = () => {
    if (!selectedUserId) return;
    linkUserMutation.mutate({ profileId: p.id, userId: selectedUserId });
    setShowLinkDropdown(false);
    setSelectedUserId(undefined);
  };

  const isCoordinator = p.current_type === "COORDINATOR" || p.current_type === "COORDINATION_SUPPORT";

  return (
    <ContentPage title="" description="">
      {/* ── Cabeçalho de navegação ─────────────────────────────────────── */}
      <Row style={{ justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        <Button
          icon="pi pi-arrow-left"
          label="Voltar"
          severity="secondary"
          text
          onClick={() => history("/perfis")}
        />
        {can("profile.edit") && (
          <Row style={{ gap: 8 }}>
            <Button
              icon="pi pi-pencil"
              label="Editar"
              outlined
              onClick={() => history("/perfis/" + id + "/editar")}
            />
            <Button
              icon="pi pi-trash"
              label="Excluir"
              severity="danger"
              outlined
              onClick={() => confirmDelete(p.id)}
            />
          </Row>
        )}
      </Row>

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <HeroCard>
        <HeroInfo>
          <h2>{p.name}</h2>
          <HeroBadges>
            <Tag
              value={profileTypeLabel[p.current_type]}
              severity={isCoordinator ? "info" : "warning"}
              icon={`pi ${isCoordinator ? "pi-star" : "pi-user"}`}
            />
            <Tag
              value={p.active ? "Ativo" : "Inativo"}
              severity={p.active ? "success" : "danger"}
            />
          </HeroBadges>
          <HeroMeta>
            {p.email && (
              <span>
                <i className="pi pi-envelope" style={{ marginRight: 5 }} />
                {p.email}
              </span>
            )}
            {p.phone && (
              <span>
                <i className="pi pi-phone" style={{ marginRight: 5 }} />
                {p.phone}
              </span>
            )}
            {p.initial_date && (
              <span>
                <i className="pi pi-calendar" style={{ marginRight: 5 }} />
                Desde {formatarData(p.initial_date)}
              </span>
            )}
          </HeroMeta>
        </HeroInfo>
      </HeroCard>

      {/* ── Grid de informações ────────────────────────────────────────── */}
      <div className="grid">

        {/* Dados pessoais */}
        <div className="col-12 md:col-4">
          <SectionCard>
            <SectionTitle>
              <i className="pi pi-id-card" />
              Dados Pessoais
            </SectionTitle>

            {p.birthday && (
              <FieldRow>
                <i className="pi pi-calendar field-icon" />
                <div className="field-content">
                  <label>Nascimento</label>
                  <span>{formatarData(p.birthday)}</span>
                </div>
              </FieldRow>
            )}

            {sex && (
              <FieldRow>
                <i className="pi pi-user field-icon" />
                <div className="field-content">
                  <label>Sexo</label>
                  <span>{sex.type}</span>
                </div>
              </FieldRow>
            )}

            {race && (
              <FieldRow>
                <i className="pi pi-tag field-icon" />
                <div className="field-content">
                  <label>Cor / Raça</label>
                  <span>{race.name}</span>
                </div>
              </FieldRow>
            )}

            {!p.birthday && !sex && !race && (
              <EmptyState>
                <i className="pi pi-info-circle" />
                Dados não preenchidos
              </EmptyState>
            )}
          </SectionCard>
        </div>

        {/* Conta de login */}
        <div className="col-12 md:col-4">
          <SectionCard>
            <SectionTitle>
              <i className="pi pi-lock" />
              Conta de Login
            </SectionTitle>

            {p.user ? (
              <>
                <UserBox>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: color.colorsBaseInkNormal, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.user.name}
                    </div>
                    <div style={{ fontSize: 12, color: color.colorsBaseInkLight }}>@{p.user.username}</div>
                  </div>
                  <Tag
                    value={p.user.active ? "Ativo" : "Inativo"}
                    severity={p.user.active ? "success" : "danger"}
                  />
                </UserBox>

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Button
                    icon="pi pi-external-link"
                    label="Ver usuário"
                    size="small"
                    text
                    onClick={() => history("/users/" + p.user_fk)}
                  />
                  {can("profile.linkUser") && (
                    <Button
                      icon="pi pi-times"
                      label="Desvincular"
                      size="small"
                      severity="danger"
                      text
                      onClick={() => confirmUnlink(p.id)}
                    />
                  )}
                </div>
              </>
            ) : (
              <>
                <EmptyState>
                  <i className="pi pi-user-minus" />
                  Sem conta de login vinculada
                </EmptyState>

                {can("profile.linkUser") && !showLinkDropdown && (
                  <Button
                    icon="pi pi-link"
                    label="Vincular usuário"
                    size="small"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => setShowLinkDropdown(true)}
                  />
                )}

                {can("profile.linkUser") && showLinkDropdown && (
                  <div>
                    <Dropdown
                      value={selectedUserId}
                      options={usersWithoutProfile ?? []}
                      optionLabel="name"
                      optionValue="id"
                      placeholder="Selecionar usuário…"
                      filter
                      onChange={(e) => setSelectedUserId(e.value)}
                      style={{ width: "100%", marginBottom: 8 }}
                    />
                    <div style={{ display: "flex", gap: 8 }}>
                      <Button
                        label="Cancelar"
                        size="small"
                        outlined
                        style={{ flex: 1 }}
                        onClick={() => { setShowLinkDropdown(false); setSelectedUserId(undefined); }}
                      />
                      <Button
                        label="Vincular"
                        size="small"
                        style={{ flex: 1 }}
                        disabled={!selectedUserId}
                        loading={linkUserMutation.isLoading}
                        onClick={handleLink}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </SectionCard>
        </div>

        {/* Tecnologias sociais */}
        <div className="col-12 md:col-4">
          <SectionCard>
            <SectionTitle>
              <i className="pi pi-sitemap" />
              Tecnologias Sociais
            </SectionTitle>

            {p.profile_social_technology?.length ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {p.profile_social_technology.map((s) => (
                  <Chip
                    key={s.social_technology_fk}
                    label={s.social_technology?.name ?? `ID ${s.social_technology_fk}`}
                    style={{
                      background: color.colorsBaseProductLightActive,
                      color: color.colorsBaseProductNormal,
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  />
                ))}
              </div>
            ) : (
              <EmptyState>
                <i className="pi pi-sitemap" />
                Nenhuma tecnologia vinculada
              </EmptyState>
            )}
          </SectionCard>
        </div>
      </div>

      {/* ── Histórico de tipo ──────────────────────────────────────────── */}
      <Padding padding="24px" />

      <SectionCard>
        <SectionTitle style={{ marginBottom: 20 }}>
          <i className="pi pi-history" />
          Histórico de Tipo
        </SectionTitle>

        {props.isLoadingLog ? (
          <Loading />
        ) : props.typeLog?.length ? (
          <div style={{ paddingLeft: 8 }}>
            {props.typeLog.map((log: ProfileTypeLogEntry, index) => {
              const isLatest = index === 0;
              return (
                <TimelineItem key={log.id} isFirst={index === props.typeLog!.length - 1}>
                  <TimelineDot isFirst={isLatest} />
                  <TimelineContent>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                      {log.previous_type ? (
                        <>
                          <Tag
                            value={profileTypeLabel[log.previous_type] ?? log.previous_type}
                            severity={log.previous_type === "COORDINATOR" || log.previous_type === "COORDINATION_SUPPORT" ? "info" : "warning"}
                          />
                          <i className="pi pi-arrow-right" style={{ fontSize: 11, color: color.colorsBaseInkLight }} />
                          <Tag
                            value={profileTypeLabel[log.new_type] ?? log.new_type}
                            severity={log.new_type === "COORDINATOR" || log.new_type === "COORDINATION_SUPPORT" ? "info" : "warning"}
                          />
                        </>
                      ) : (
                        <>
                          <span style={{ fontSize: 13, color: color.colorsBaseInkLight }}>Atribuição inicial</span>
                          <i className="pi pi-arrow-right" style={{ fontSize: 11, color: color.colorsBaseInkLight }} />
                          <Tag
                            value={profileTypeLabel[log.new_type] ?? log.new_type}
                            severity={log.new_type === "COORDINATOR" || log.new_type === "COORDINATION_SUPPORT" ? "info" : "warning"}
                          />
                        </>
                      )}
                      {isLatest && (
                        <span style={{ fontSize: 11, background: color.colorsBaseProductNormal, color: "#fff", borderRadius: 4, padding: "1px 6px", fontWeight: 600 }}>
                          ATUAL
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 12, color: color.colorsBaseInkLight, marginBottom: log.reason ? 4 : 0 }}>
                      <i className="pi pi-calendar" style={{ marginRight: 4 }} />
                      {formatarData(log.createdAt)}
                      {log.changed_by && (
                        <span style={{ marginLeft: 8 }}>
                          <i className="pi pi-user" style={{ marginRight: 4 }} />
                          {log.changed_by.username}
                        </span>
                      )}
                    </div>

                    {log.reason && (
                      <div style={{
                        fontSize: 13,
                        color: color.colorsBaseInkNormal,
                        background: color.colorCard,
                        border: `1px solid ${color.colorBorderCard}`,
                        borderRadius: 6,
                        padding: "5px 10px",
                        marginTop: 4,
                        display: "inline-block",
                      }}>
                        <i className="pi pi-comment" style={{ marginRight: 5, color: color.colorsBaseInkLight, fontSize: 11 }} />
                        {log.reason}
                      </div>
                    )}
                  </TimelineContent>
                </TimelineItem>
              );
            })}
          </div>
        ) : (
          <EmptyState>
            <i className="pi pi-history" />
            Nenhum histórico disponível
          </EmptyState>
        )}
      </SectionCard>
    </ContentPage>
  );
};

export default ProfileView;
