import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useState } from "react";
import ContentPage from "../../Components/ContentPage";
import DropdownComponent from "../../Components/Dropdown";
import { formatarData, typeLog, typeLogArray } from "../../Controller/controllerGlobal";
import { usePermissions } from "../../hooks/usePermissions";
import { useFetchRequestUserLogs } from "../../Services/UserLogs/query";
import { Padding, Row } from "../../Styles/styles";

const UserLogs = () => {
  const { can } = usePermissions();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [filters, setFilters] = useState({
    user_fk: "",
    type: "",
    project_fk: "",
    classroom_fk: "",
    action: "",
  });

  const { data: logsData, isLoading } = useFetchRequestUserLogs({
    page,
    limit,
    user_fk: filters.user_fk || undefined,
    type: filters.type || undefined,
    project_fk: filters.project_fk || undefined,
    classroom_fk: filters.classroom_fk || undefined,
    action: filters.action || undefined,
  });

  const statusBodyTemplate = (rowData: any) => {
    const statusColorMap: { [key: string]: string } = {
      success: "#22c55e",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };
    const status = rowData.status || "info";
    return (
      <span
        style={{
          backgroundColor: statusColorMap[status] || "#3b82f6",
          color: "white",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "0.85rem",
          fontWeight: "500",
        }}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({
      user_fk: "",
      type: "",
      project_fk: "",
      classroom_fk: "",
      action: "",
    });
    setPage(1);
  };

  if (!can("logs.view")) {
    return (
      <ContentPage title="Logs do Sistema" description="Acesso restrito.">
        <Padding padding="16px" />
        <p>Você não tem permissão para acessar esta página.</p>
      </ContentPage>
    );
  }

  return (
    <ContentPage
      title="Logs do Sistema"
      description="Histórico de ações dos usuários"
    >
      <Padding padding="16px" />

      <h4>Filtros</h4>
      <div className="grid">
        <div className="col-12 md:col-3">
          <label>Tipo</label>
          <Padding />
          <DropdownComponent
            placerholder="Tipo de ação"
            optionsValue="id"
            optionsLabel="name"
            options={typeLogArray}
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          />
        </div>
        {/* <div className="col-12 md:col-3">
          <label>Plano de trabalho</label>
          <Padding />
          <InputText
            placeholder="ID do projeto"
            value={filters.project_fk}
            onChange={(e) => handleFilterChange("project_fk", e.target.value)}
            style={{ width: "100%" }}
          />
        </div> */}
      </div>

      <Padding padding="8px" />
      <Row id="space-between">
        <Button
          label="Limpar filtros"
          outlined
          onClick={handleClearFilters}
          icon="pi pi-times"
        />
      </Row>

      <Padding padding="16px" />

      <DataTable
        value={logsData?.content || []}
        tableStyle={{ minWidth: "50rem" }}
        paginator
        rows={limit}
        totalRecords={logsData?.total}
        first={(page - 1) * limit}
        onPage={(e) => {  setPage(Math.floor(e.first / limit) + 1); setLimit(e.rows ?? 10); }}
        rowsPerPageOptions={[5, 10, 20, 50]}
        paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
        currentPageReportTemplate="{first} a {last} de {totalRecords}"
        loading={isLoading}
      >
        <Column field="users.name" header="Usuário" />
        <Column
          field="type"
          header="Tipo"
          body={(row) => typeLog[row.type] || row.type}
        />
        <Column field="action" header="Ação"  />
        <Column
          field="createdAt"
          header="Data e Hora"
          body={(row) => formatarData(row.createdAt)}
        />
        <Column header="Status" body={statusBodyTemplate} />
      </DataTable>
    </ContentPage>
  );
};

export default UserLogs;
