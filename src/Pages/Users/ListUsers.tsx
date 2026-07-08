import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import ContentPage from "../../Components/ContentPage";
import DropdownComponent from "../../Components/Dropdown";
import UsersProvider, { UsersContext } from "../../Context/Users/context";
import { UsersTypes } from "../../Context/Users/type";
import { PROFILE_TYPE, ROLE, profileTypeLabel } from "../../Controller/controllerGlobal";
import { usePermissions } from "../../hooks/usePermissions";
import { Padding, Row } from "../../Styles/styles";

const ListUsers = () => {
  return (
    <UsersProvider>
      <ListUsersPage />
    </UsersProvider>
  );
};

const ListUsersPage = () => {
  const props = useContext(UsersContext) as UsersTypes;
  const history = useNavigate();
  const { can } = usePermissions();


  const [visible, setVisible] = useState<any>(false);
  // const actionBodyTemplate = (rowData: any) => {

  //     return (
  //         <Row id='end'>
  //             {/* <Button icon="pi pi-pencil" rounded className="mr-2" onClick={() => { history("/users/" + rowData.id) }} /> */}
  //             <Button icon="pi pi-trash" rounded type="button" severity="danger" onClick={() => { props.DeleteUser(rowData.id) }} />
  //         </Row>
  //     );
  // };

  const typeUserBody = (rowData: any) => {
    if (rowData.role === ROLE.ADMIN) return <p>Admin</p>;
    if (rowData.profile?.current_type) return <p>{profileTypeLabel[rowData.profile.current_type] ?? rowData.profile.current_type}</p>;
    return <p>Usuário</p>;
  };

  const ActiveUserBody = (rowData: any) => {
    return <p>{rowData.active ? "Ativo" : "Desativado"}</p>;
  };

   const PerfilCompleteUserBody = (rowData: any) => {
    return <p>{rowData.isProfileComplete ? "Sim" : "Não"}</p>;
  };

  const profileBody = (rowData: any) => {
    if (!rowData.profile) return <span style={{ color: "#aaa" }}>—</span>;
    const isReapplicator = rowData.profile.current_type === PROFILE_TYPE.REAPPLICATOR;
    const isCoordType    = rowData.profile.current_type === PROFILE_TYPE.COORDINATOR ||
                           rowData.profile.current_type === PROFILE_TYPE.COORDINATION_SUPPORT;
    const path = isReapplicator
      ? "/reaplicadores/" + rowData.profile.id
      : "/perfis/"       + rowData.profile.id;
    return (
      <Button
        label={profileTypeLabel[rowData.profile.current_type] ?? rowData.profile.current_type}
        text
        size="small"
        severity={isCoordType ? "info" : "warning"}
        onClick={() => history(path)}
      />
    );
  };

  const ActionsUserBody = (rowData: any) => {
    return (
      <Row>
        {can("user.edit") && (
          <Button
            icon="pi pi-pencil"
            rounded
            className="mr-2"
            onClick={() => {
              history("/users/" + rowData.id);
            }}
          />
        )}
        {can("user.delete") && (
          <Button
            severity="danger"
            rounded
            icon={"pi pi-trash"}
            onClick={() => {
              setVisible(rowData);
            }}
          />
        )}
      </Row>
    );
  };

  const roleOptions = [
    { id: "TODOS",                              name: "Todos" },
    { id: ROLE.ADMIN,                           name: "Admin" },
    { id: PROFILE_TYPE.COORDINATOR,             name: "Coordenação" },
    { id: PROFILE_TYPE.COORDINATION_SUPPORT,    name: "Apoio à Coordenação" },
    { id: PROFILE_TYPE.REAPPLICATOR,            name: "Reaplicador" },
    { id: PROFILE_TYPE.COMMUNICATION,           name: "Comunicação" },
    { id: PROFILE_TYPE.ACCOUNTABILITY,          name: "Prestação de Contas" },
    { id: PROFILE_TYPE.OTHER,                   name: "Outro" },
  ];

  const hasActiveFilters =
    props.nameSearch.trim().length > 0 ||
    props.role !== "TODOS";

  const clearFilters = () => {
    props.setNameSearch("");
    props.setRole("TODOS");
  };

  const renderHeader = () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        padding: "12px",
        border: "1px solid #e5e7eb",
        borderRadius: "10px",
        background: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        {can("user.create") && (
          <Button label="Criar usuário" onClick={() => history("/users/criar")} icon="pi pi-plus" />
        )}
        <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
          {hasActiveFilters ? (
            <Button
              label="Limpar filtros"
              severity="secondary"
              outlined
              icon="pi pi-filter-slash"
              onClick={clearFilters}
            />
          ) : null}
          <span style={{ color: "#475569", fontSize: "13px" }}>
            {props.total} usuário(s) no total
          </span>
        </div>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "10px",
          alignItems: "end",
        }}
      >
        <div>
          <label style={{ fontSize: "12px", color: "#334155", fontWeight: 600 }}>
            Buscar por nome
          </label>
          <div style={{ marginTop: "6px" }}>
            <span className="p-input-icon-left" style={{ width: "100%" }}>
              <i className="pi pi-search" />
              <InputText
                placeholder="Digite o nome"
                value={props.nameSearch}
                onChange={(e) => props.setNameSearch(e.target.value)}
                style={{ width: "100%" }}
              />
            </span>
          </div>
        </div>
        <div>
          <label style={{ fontSize: "12px", color: "#334155", fontWeight: 600 }}>
            Tipo de usuário
          </label>
          <div style={{ marginTop: "6px" }}>
            <DropdownComponent
              optionsLabel="name"
              value={props.role}
              onChange={(e) => props.setRole(e.target.value)}
              optionsValue="id"
              placerholder="Selecione o tipo"
              options={roleOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <ContentPage title="Usuários" description="Lista usuários do MeuBen.">
        <Padding padding="8px" />
        <DataTable
          value={props.users}
          header={renderHeader}
          loading={props.isLoading}
          tableStyle={{ minWidth: "50rem" }}
          emptyMessage="Nenhum usuário encontrado."
        >
          <Column field="name" header="Nome" />
          <Column field="username" header="Usuário" />
          <Column field="role" body={typeUserBody} header="Tipo" />
          <Column field="profile" body={profileBody} header="Perfil" />
          <Column field="isProfileComplete" body={PerfilCompleteUserBody} header="Perfil completo?" />
          <Column field="active" body={ActiveUserBody} header="Ativo" />
          <Column field="actions" body={ActionsUserBody} header="Ações" />
        </DataTable>
        <Paginator
          first={(props.page - 1) * props.perPage}
          rows={props.perPage}
          totalRecords={props.total}
          rowsPerPageOptions={[10, 25, 50]}
          onPageChange={(e) => {
            props.setPage(e.page + 1);
            props.setPerPage(e.rows);
          }}
        />
      </ContentPage>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteUser(visible?.id)}
        reject={() => setVisible(false)}
      />
    </>
  );
};

export default ListUsers;
