import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dropdown } from "primereact/dropdown";
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
import { profileTypeLabel } from "../../../Controller/controllerGlobal";
import { getProfileTypeOptions } from "../../../hooks/useProfileFieldRules";
import { Padding, Row } from "../../../Styles/styles";
import { usePermissions } from "../../../hooks/usePermissions";

const typeOptions = [{ id: undefined, name: "Todos os tipos" }, ...getProfileTypeOptions(true)];

const ProfileList = () => (
  <ProfileProvider>
    <ProfileListPage />
  </ProfileProvider>
);

const ProfileListPage = () => {
  const props = useContext(ProfileContext) as ProfileContextTypes;
  const history = useNavigate();
  const { can } = usePermissions();
  const { confirmDelete } = ControllerProfile();

  if (!can("profile.view")) {
    return (
      <ContentPage title="Perfis" description="Acesso restrito.">
        <Padding padding="16px" />
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  const activeBody = (row: Profile) => (
    <Tag value={row.active ? "Ativo" : "Inativo"} severity={row.active ? "success" : "danger"} />
  );

  const typeBody = (row: Profile) => (
    <Tag value={profileTypeLabel[row.current_type] ?? row.current_type} severity="info" />
  );

  const userBody = (row: Profile) =>
    row.user ? (
      <Tag value="Vinculado" severity="success" />
    ) : (
      <span style={{ color: "#aaa" }}>—</span>
    );

  const actionsBody = (row: Profile) => (
    <Row style={{ gap: 4 }}>
      <Button
        icon="pi pi-eye"
        rounded text
        tooltip="Visualizar"
        tooltipOptions={{ position: "top" }}
        onClick={() => history("/perfis/" + row.id)}
      />
      {can("profile.edit") && (
        <Button
          icon="pi pi-pencil"
          rounded text
          severity="info"
          tooltip="Editar"
          tooltipOptions={{ position: "top" }}
          onClick={() => history("/perfis/" + row.id + "/editar")}
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
      title="Perfis"
      description="Gerenciamento de todos os perfis operacionais"
      addButton
      permissionButton={can("profile.create")}
      labelButton="Novo Perfil"
      onClick={() => history("/perfis/criar")}
    >
      <Padding padding="8px" />

      <div className="grid mb-3">
        <div className="col-12 md:col-8">
          <TextInput
            placeholder="Buscar por nome…"
            value={props.nameSearch}
            onChange={(e) => props.setNameSearch(e.target.value)}
          />
        </div>
        <div className="col-12 md:col-4">
          <Dropdown
            value={props.currentTypeFilter ?? null}
            options={typeOptions}
            optionLabel="name"
            optionValue="id"
            placeholder="Todos os tipos"
            style={{ width: "100%", height: 44 }}
            onChange={(e) => props.setCurrentTypeFilter(e.value ?? undefined)}
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
            emptyMessage="Nenhum perfil encontrado."
          >
            <Column field="name" header="Nome" />
            <Column header="Tipo" body={typeBody} />
            <Column header="E-mail" body={(row: Profile) => row.user?.email ?? "—"} />
            <Column field="phone" header="Telefone" />
            <Column header="Usuário" body={userBody} />
            <Column header="Status" body={activeBody} />
            <Column header="Ações" body={actionsBody} />
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

export default ProfileList;
