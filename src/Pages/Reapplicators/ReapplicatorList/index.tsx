import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Paginator } from "primereact/paginator";
import { Tag } from "primereact/tag";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import TextInput from "../../../Components/TextInput";
import ProfileProvider, { ProfileContext } from "../../../Context/Profile/context";
import { Profile, ProfileContextTypes } from "../../../Context/Profile/type";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { Padding, Row } from "../../../Styles/styles";
import { usePermissions } from "../../../hooks/usePermissions";

const ReapplicatorList = () => (
  <ProfileProvider fixedType="REAPPLICATOR">
    <ReapplicatorListPage />
  </ProfileProvider>
);

const ReapplicatorListPage = () => {
  const props = useContext(ProfileContext) as ProfileContextTypes;
  const history = useNavigate();
  const { can } = usePermissions();
  const { confirmDelete } = ControllerProfile();

  if (!can("profile.view")) {
    return (
      <ContentPage title="Reaplicadores" description="Acesso restrito.">
        <Padding padding="16px" />
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  const activeBody = (row: Profile) => (
    <Tag value={row.active ? "Ativo" : "Inativo"} severity={row.active ? "success" : "danger"} />
  );

  const userBody = (row: Profile) =>
    row.user ? (
      <Tag value="Vinculado" severity="success" />
    ) : (
      <span style={{ color: "#aaa" }}>—</span>
    );

  const socialTechBody = (row: Profile) => {
    const names = (row.profile_social_technology ?? [])
      .map((s) => s.social_technology?.name)
      .filter(Boolean) as string[];
    if (!names.length) return <span style={{ color: "#aaa" }}>—</span>;
    return (
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {names.map((n, i) => <Tag key={i} value={n} severity="info" />)}
      </div>
    );
  };

  const actionsBody = (row: Profile) => (
    <Row style={{ gap: 4 }}>
      <Button
        icon="pi pi-eye"
        rounded text
        tooltip="Visualizar"
        tooltipOptions={{ position: "top" }}
        onClick={() => history("/reaplicadores/" + row.id)}
      />
      {can("profile.edit") && (
        <Button
          icon="pi pi-pencil"
          rounded text
          severity="info"
          tooltip="Editar"
          tooltipOptions={{ position: "top" }}
          onClick={() => history("/reaplicadores/" + row.id + "/editar")}
        />
      )}
      {can("profile.delete") && (
        <Button
          icon="pi pi-trash"
          rounded text
          severity="danger"
          tooltip="Excluir"
          tooltipOptions={{ position: "top" }}
          onClick={() => confirmDelete(row.id)}
        />
      )}
    </Row>
  );

  return (
    <ContentPage
      title="Reaplicadores"
      description="Gerenciamento de reaplicadores de tecnologias sociais"
      addButton
      permissionButton={can("profile.create")}
      labelButton="Novo Reaplicador"
      onClick={() => history("/reaplicadores/criar")}
    >
      <Padding padding="8px" />

      <div className="grid mb-3">
        <div className="col-12">
          <TextInput
            placeholder="Buscar por nome…"
            value={props.nameSearch}
            onChange={(e) => props.setNameSearch(e.target.value)}
          />
        </div>
      </div>

      {props.isLoading ? (
        <Loading />
      ) : (
        <>
          <DataTable
            value={props.profiles?.data ?? []}
            tableStyle={{ minWidth: "60rem" }}
            emptyMessage="Nenhum reaplicador encontrado."
          >
            <Column field="name"  header="Nome" />
            <Column field="email" header="E-mail" />
            <Column field="phone" header="Telefone" />
            <Column header="Tec. Sociais" body={socialTechBody} />
            <Column header="Usuário"      body={userBody} />
            <Column header="Status"       body={activeBody} />
            <Column header="Ações"        body={actionsBody} />
          </DataTable>

          <Paginator
            first={(props.page - 1) * props.perPage}
            rows={props.perPage}
            totalRecords={props.profiles?.total ?? 0}
            rowsPerPageOptions={[10, 25, 50]}
            onPageChange={(e) => {
              props.setPage(Math.floor(e.first / props.perPage) + 1);
              props.setPerPage(e.rows);
            }}
          />
        </>
      )}
    </ContentPage>
  );
};

export default ReapplicatorList;
