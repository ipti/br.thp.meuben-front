import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Tag } from "primereact/tag";
import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import { AplicationContext } from "../../../Context/Aplication/context";
import ReapplicatorsProvider, { ReapplicatorsContext } from "../../../Context/Reapplicators/context";
import { ReapplicatorsTypes } from "../../../Context/Reapplicators/type";
import { ROLE, VerifyColor, VerifySex, formatarData } from "../../../Controller/controllerGlobal";
import { Padding, Row } from "../../../Styles/styles";
import { PropsAplicationContext } from "../../../Types/types";

const ReapplicatorView = () => {
  return (
    <ReapplicatorsProvider>
      <ReapplicatorViewPage />
    </ReapplicatorsProvider>
  );
};

const ReapplicatorViewPage = () => {
  const { loadOne, isLoadingOne, reapplicator } = useContext(ReapplicatorsContext) as ReapplicatorsTypes;
  const propsAplication = useContext(AplicationContext) as PropsAplicationContext;
  const { id } = useParams<{ id: string }>();
  const history = useNavigate();

  useEffect(() => {
    if (id) {
      loadOne(parseInt(id, 10));
    }
  }, [id, loadOne]);

  const isAdmin = propsAplication.user?.role === ROLE.ADMIN;
  const isAllowed = isAdmin || propsAplication.user?.role === ROLE.COORDINATORS;

  if (!isAllowed) {
    return (
      <ContentPage title="Reaplicador" description="Acesso restrito.">
        <Padding padding="16px" />
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  if (isLoadingOne) return <Loading />;

  if (!reapplicator) {
    return (
      <ContentPage title="Reaplicador" description="Detalhes do reaplicador.">
        <Padding padding="16px" />
        <p>Reaplicador não encontrado.</p>
      </ContentPage>
    );
  }

  const sex = VerifySex(reapplicator.sex);
  const color = VerifyColor(reapplicator.color_race);

  return (
    <ContentPage title="Detalhes do Reaplicador" description="Informações completas do reaplicador.">
      <Padding padding="8px" />
      <Row>
        <Button
          icon="pi pi-arrow-left"
          label="Voltar"
          severity="secondary"
          onClick={() => history("/reaplicadores")}
        />
      </Row>
      <Padding padding="16px" />

      <Card
        title="Dados do Usuário vinculado"
        subTitle={
          <Button
            label="Ver usuário"
            icon="pi pi-user"
            size="small"
            className="mt-2"
            onClick={() => history("/users/" + reapplicator.users_fk)}
          />
        }
      >
        <div className="grid">
          <div className="col-12 md:col-6">
            <InfoField label="Nome" value={reapplicator.users?.name} />
          </div>
          <div className="col-12 md:col-6">
            <InfoField label="Usuário (login)" value={reapplicator.users?.username} />
          </div>
          <div className="col-12 md:col-6">
            <InfoField label="Perfil" value={reapplicator.users?.role} />
          </div>
          <div className="col-12 md:col-6">
            <span className="font-semibold">Status do usuário: </span>
            <Tag
              value={reapplicator.users?.active ? "Ativo" : "Inativo"}
              severity={reapplicator.users?.active ? "success" : "danger"}
            />
          </div>
        </div>
      </Card>

      <Padding padding="16px" />

      <Card title="Dados do Reaplicador">
        <div className="grid">
          <div className="col-12 md:col-6">
            <InfoField label="E-mail" value={reapplicator.email} />
          </div>
          <div className="col-12 md:col-6">
            <InfoField label="Telefone" value={reapplicator.phone} />
          </div>
          <div className="col-12 md:col-6">
            <InfoField label="Data de nascimento" value={reapplicator.birthday ? formatarData(reapplicator.birthday) : undefined} />
          </div>
          <div className="col-12 md:col-6">
            <InfoField label="Data inicial" value={reapplicator.initial_date ? formatarData(reapplicator.initial_date) : undefined} />
          </div>
          <div className="col-12 md:col-6">
            <InfoField label="Sexo" value={sex?.type} />
          </div>
          <div className="col-12 md:col-6">
            <InfoField label="Cor/Raça" value={color?.name} />
          </div>
          <div className="col-12 md:col-6">
            <span className="font-semibold">Status: </span>
            <Tag
              value={reapplicator.active ? "Ativo" : "Inativo"}
              severity={reapplicator.active ? "success" : "danger"}
            />
          </div>
        </div>
      </Card>
    </ContentPage>
  );
};

const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
  <div style={{ marginBottom: "8px" }}>
    <span className="font-semibold">{label}: </span>
    <span>{value ?? "-"}</span>
  </div>
);

export default ReapplicatorView;
