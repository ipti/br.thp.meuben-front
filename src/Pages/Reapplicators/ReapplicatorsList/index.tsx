import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import { AplicationContext } from "../../../Context/Aplication/context";
import ReapplicatorsProvider, { ReapplicatorsContext } from "../../../Context/Reapplicators/context";
import { ReapplicatorsTypes } from "../../../Context/Reapplicators/type";
import { ROLE, VerifyColor, VerifySex, formatarData } from "../../../Controller/controllerGlobal";
import { Padding, Row } from "../../../Styles/styles";
import { PropsAplicationContext } from "../../../Types/types";

const ReapplicatorsList = () => {
  return (
    <ReapplicatorsProvider>
      <ReapplicatorsListPage />
    </ReapplicatorsProvider>
  );
};

const ReapplicatorsListPage = () => {
  const props = useContext(ReapplicatorsContext) as ReapplicatorsTypes;
  const propsAplication = useContext(AplicationContext) as PropsAplicationContext;
  const history = useNavigate();

  const isAllowed =
    propsAplication.user?.role === ROLE.ADMIN ||
    propsAplication.user?.role === ROLE.COORDINATORS;

  if (!isAllowed) {
    return (
      <ContentPage title="Reaplicadores" description="Acesso restrito.">
        <Padding padding="16px" />
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  if (props.isLoading) return <Loading />;

  const userBody = (rowData: any) => <p>{rowData.users?.name ?? "-"}</p>;

  const sexBody = (rowData: any) => {
    const sex = VerifySex(rowData.sex);
    return <p>{sex?.type ?? "-"}</p>;
  };

  const colorRaceBody = (rowData: any) => {
    const color = VerifyColor(rowData.color_race);
    return <p>{color?.name ?? "-"}</p>;
  };

  const birthdayBody = (rowData: any) => (
    <p>{rowData.birthday ? formatarData(rowData.birthday) : "-"}</p>
  );

  const initialDateBody = (rowData: any) => (
    <p>{rowData.initial_date ? formatarData(rowData.initial_date) : "-"}</p>
  );

  const activeBody = (rowData: any) => (
    <Tag
      value={rowData.active ? "Ativo" : "Inativo"}
      severity={rowData.active ? "success" : "danger"}
    />
  );

  const socialTechBody = (rowData: any) => {
    const techs: string[] = (rowData.users?.user_social_technology ?? []).map(
      (ust: any) => ust.usersocialtechnology?.name
    ).filter(Boolean);

    if (techs.length === 0) return <p>-</p>;

    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
        {techs.map((name, i) => (
          <Tag key={i} value={name} severity="info" />
        ))}
      </div>
    );
  };

  const actionsBody = (rowData: any) => (
    <Row>
      <Button
        icon="pi pi-eye"
        rounded
        onClick={() => history("/reaplicadores/" + rowData.id)}
        tooltip="Visualizar"
        tooltipOptions={{ position: "top" }}
      />
    </Row>
  );

  return (
    <ContentPage title="Reaplicadores" description="Lista de reaplicadores cadastrados no sistema.">
      <Padding padding="8px" />
      <DataTable
        value={props.reapplicators?.data}
        tableStyle={{ minWidth: "60rem" }}
        emptyMessage="Nenhum reaplicador encontrado."
      >
        <Column field="users.name" header="Usuário" body={userBody} />
        <Column field="email" header="E-mail" />
        <Column field="phone" header="Telefone" />
        <Column field="sex" header="Sexo" body={sexBody} />
        <Column field="color_race" header="Cor/Raça" body={colorRaceBody} />
        <Column field="birthday" header="Nascimento" body={birthdayBody} />
        <Column field="initial_date" header="Data inicial" body={initialDateBody} />
        <Column field="social_tech" header="Tecnologias Sociais" body={socialTechBody} />
        <Column field="active" header="Status" body={activeBody} />
        <Column field="actions" header="Ações" body={actionsBody} />
      </DataTable>
      <Paginator
        first={(props.page - 1) * props.perPage}
        rows={props.perPage}
        totalRecords={props.reapplicators?.total ?? 0}
        onPageChange={(e) => props.setPage(Math.floor(e.first / props.perPage) + 1)}
      />
    </ContentPage>
  );
};

export default ReapplicatorsList;
