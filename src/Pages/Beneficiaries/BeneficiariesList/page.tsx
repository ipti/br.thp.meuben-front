import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { InputText } from "primereact/inputtext";
import { Paginator } from "primereact/paginator";
import { useContext, useState } from "react";
import { Chip } from "primereact/chip";
import { useNavigate } from "react-router-dom";
import ContentPage from "../../../Components/ContentPage";
import { BeneficiariesListContext } from "../../../Context/Beneficiaries/BeneficiariesList/context";
import { BeneficiariesListType } from "../../../Context/Beneficiaries/BeneficiariesList/type";
import {
  formatarData,
  somarNumeros,
  StatusRegistrationEnum,
  StatusTermEnum,
} from "../../../Controller/controllerGlobal";
import { Padding, Row } from "../../../Styles/styles";
import ModalFilter from "./ModalFilter";
import { AplicationContext } from "../../../Context/Aplication/context";
import { PropsAplicationContext } from "../../../Types/types";

export const BeneficiariesListPage = () => {
  const props = useContext(BeneficiariesListContext) as BeneficiariesListType;
  
const propsAplication = useContext(
    AplicationContext
  ) as PropsAplicationContext;

  const history = useNavigate();

  const [visible, setVisible] = useState<any>();

  const [visibleFilter, setVisibleFilter] = useState<any>();

  const renderHeader = () => {
    return (
      <div
        className="flex justify-content-between"
      >
        <Button
          label={window.innerWidth > 800 ? "Adicionar beneficiario" : undefined}
          icon="pi pi-plus"
          onClick={() => history("criar")}
        />
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            value={props.allFilter}
            placeholder="Pesquisar..."
            onChange={(e) => { props.setallFilter(e.target.value); props.updateAllFilter(e.target.value) }}
          />
        </span>
      </div>
    );
  };

  const ActionBeneficiariesBody = (rowData: any) => {
    return (
      <Row id="center" style={{ gap: "8px" }}>
        <Button
          rounded
          icon={"pi pi-pencil"}
          onClick={() => {
            history(`${rowData.id}`);
          }}
        />
        <Button
          severity="danger"
          rounded
          icon={"pi pi-trash"}
          onClick={() => {
            setVisible(rowData);
          }}
        />
      </Row>
    );
  };

  return (
    <>
      <ContentPage
        title="Beneficiários"
        description="Visualização dos beneficiários da tecnologia."
      >
        {/* Chips de filtros selecionados */}
        <Row style={{ gap: 8, flexWrap: 'wrap' }}>
          {props.filter.idTs && (
            <Chip
              label={`TS: ${propsAplication.project?.find(ts => ts.id === props.filter.idTs)?.name || props.filter.idTs}`}
              removable
              onRemove={() => props.setFilter({ ...props.filter, idTs: undefined })}
            />
          )}
          {props.filter.idProject && (
            <Chip
              label={`Projeto: ${props.filter.idProject}`}
              removable
              onRemove={() => props.setFilter({ ...props.filter, idProject: undefined })}
            />
          )}
          {props.filter.idClassroom && (
            <Chip
              label={`Turma: ${props.filter.idClassroom}`}
              removable
              onRemove={() => props.setFilter({ ...props.filter, idClassroom: undefined })}
            />
          )}
          {props.filter.statusTerm && (
            <Chip
              label={`Status Termo: ${StatusTermEnum[props.filter.statusTerm]}`}
              removable
              onRemove={() => props.setFilter({ ...props.filter, statusTerm: undefined })}
            />
          )}
          {props.filter.status && (
            <Chip
              label={`Status: ${StatusRegistrationEnum[props.filter.status]}`}
              removable
              onRemove={() => props.setFilter({ ...props.filter, status: undefined })}
            />
          )}
          {(props.filter.idTs || props.filter.idProject || props.filter.idClassroom || props.filter.statusTerm || props.filter.status) && (
            <Button
              label="Limpar filtros"
              text
              type="button"
              onClick={() => props.setFilter({})}
              icon="pi pi-times"
            />
          )}
        </Row>
        <Padding padding="8px" />
        <Button label="Filtrar" onClick={() => setVisibleFilter(!visibleFilter)} />
        <Padding padding="8px" />
        <h3>{props?.registrations?.total} Beneficiários</h3>
        <Padding padding="4px" />
        <DataTable
          value={props.registrations?.content}
          tableStyle={{ minWidth: "50rem" }}
          header={renderHeader}
          showGridlines
        >
          <Column field="thp_id" header="Id THP"></Column>
          <Column field="name" header="Nome"></Column>
          {/* <Column
            field="responsable_name"
            header="Nome do responsável"
          ></Column> */}
          <Column field="cpf" header="CPF"></Column>
          <Column
            body={(rowData) => {
              return <>{formatarData(rowData.date_registration)}</>;
            }}
            header="Data de matricula"
          ></Column>
          <Column header={'Status'} align={"center"} body={(bodyRow) => {
            return (
              <div >{StatusRegistrationEnum[bodyRow.status]}</div>
            )
          }}></Column>
          <Column
            header="Termo de adesão"
            align="center"
            body={(rowData) => {
              const term = rowData?.adhesion_term;
              if (!term) return <span style={{ color: "#aaa" }}>Sem termo</span>;
              const statusLabel = StatusTermEnum[term.status] ?? term.status;
              const isActive = term.status === "ACTIVE_TERM";
              return (
                <span
                  style={{
                    padding: "2px 10px",
                    borderRadius: 12,
                    fontSize: 13,
                    background: isActive ? "#dcfce7" : "#fef9c3",
                    color: isActive ? "#166534" : "#854d0e",
                    fontWeight: 500,
                  }}
                >
                  {statusLabel}
                </span>
              );
            }}
          />
          <Column
            header="Vigência adesão"
            align="center"
            body={(rowData) => {
              const term = rowData?.adhesion_term;
              if (!term) return <span style={{ color: "#aaa" }}>—</span>;
              return (
                <span>
                  {formatarData(term.dateTerm)}
                  {term.dateValid ? ` - ${formatarData(term.dateValid)}` : ""}
                </span>
              );
            }}
          />
          <Column
            header="Outros termos"
            align="center"
            body={(rowData) => {
              return rowData?.has_other_terms ? (
                <i className="pi pi-check-circle" style={{ color: "#2563eb" }} title="Possui outros termos" />
              ) : (
                <span style={{ color: "#aaa" }}>—</span>
              );
            }}
          />
          <Column header="Ações" body={ActionBeneficiariesBody}></Column>
        </DataTable>
        <Paginator
          first={props.page}
          totalRecords={props.registrations?.total}
          onPageChange={(e) => {
            props.setPage(somarNumeros(e.first, 1));
          }}
          rows={props.limite}
        />
      </ContentPage>
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmação"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteRegistration(visible.id)}
        reject={() => setVisible(false)}
      />
      <ModalFilter
        visible={visibleFilter}
        onHide={() => setVisibleFilter(false)}
      />
    </>
  );
};
