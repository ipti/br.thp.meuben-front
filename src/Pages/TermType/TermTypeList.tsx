import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { TermType } from "../../Services/TermType/type";

type Props = {
  items: TermType[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (item: TermType) => void;
  onDelete: (item: TermType) => void;
};

const TermTypeList = ({ items, canEdit, canDelete, onEdit, onDelete }: Props) => {
  const activeBody = (item: TermType) => (
    <Tag
      value={item.active ? "Ativo" : "Inativo"}
      severity={item.active ? "success" : "danger"}
    />
  );

  const adhesionBody = (item: TermType) =>
    item.is_adhesion_term ? <Tag value="Sim" severity="info" /> : <span>—</span>;

  const actionsBody = (item: TermType) => (
    <div style={{ display: "flex", gap: "8px" }}>
      {canEdit && (
        <Button
          icon="pi pi-pencil"
          className="p-button-text p-button-sm"
          onClick={() => onEdit(item)}
          tooltip="Editar"
        />
      )}
      {canDelete && (
        <Button
          icon="pi pi-trash"
          className="p-button-text p-button-sm p-button-danger"
          onClick={() => onDelete(item)}
          tooltip="Excluir"
        />
      )}
    </div>
  );

  return (
    <DataTable value={items} responsiveLayout="scroll" stripedRows>
      <Column field="order" header="Ordem" sortable style={{ width: "80px" }} />
      <Column field="code" header="Código" />
      <Column field="label" header="Rótulo" />
      <Column header="Adesão?" body={adhesionBody} style={{ width: "100px" }} />
      <Column header="Status" body={activeBody} style={{ width: "100px" }} />
      {(canEdit || canDelete) && (
        <Column header="Ações" body={actionsBody} style={{ width: "120px" }} />
      )}
    </DataTable>
  );
};

export default TermTypeList;
