import { useState } from "react";
import { useMutation } from "react-query";
import Swal from "sweetalert2";
import ContentPage from "../../Components/ContentPage";
import Loading from "../../Components/Loading";
import Empty from "../../Components/Empty";
import { usePermissions } from "../../hooks/usePermissions";
import { useTermTypes } from "../../hooks/useTermTypes";
import { deleteTermType } from "../../Services/TermType/request";
import queryClient from "../../Services/reactquery";
import styles from "../../Styles";
import { Padding } from "../../Styles/styles";
import { TermType } from "../../Services/TermType/type";
import CreateTermTypeDialog from "./CreateTermTypeDialog";
import EditTermTypeDialog from "./EditTermTypeDialog";
import TermTypeList from "./TermTypeList";

const TermTypePage = () => {
  const { can } = usePermissions();
  const { termTypes, isLoading } = useTermTypes(false);
  const [createVisible, setCreateVisible] = useState(false);
  const [editTarget, setEditTarget] = useState<TermType | null>(null);

  const deleteMutation = useMutation(
    (id: number) => deleteTermType(id),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: "error",
          title: error.response?.data?.message ?? "Erro ao excluir tipo de termo",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Tipo de termo excluído com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
        queryClient.invalidateQueries("term-types");
      },
    }
  );

  const handleDelete = (item: TermType) => {
    Swal.fire({
      icon: "warning",
      title: `Excluir "${item.label}"?`,
      text: "Esta ação não pode ser desfeita. Tipos vinculados a termos existentes não podem ser excluídos.",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: styles.colors.colorsBaseProductNormal,
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(item.id);
    });
  };

  if (isLoading) return <Loading />;

  return (
    <ContentPage
      title="Tipos de Termo"
      description="Gerencie os tipos de termo de uso."
      permissionButton={can("termType.create")}
      addButton
      onClick={() => setCreateVisible(true)}
    >
      <Padding padding="16px" />
      {termTypes.length > 0 ? (
        <TermTypeList
          items={termTypes}
          canEdit={can("termType.edit")}
          canDelete={can("termType.delete")}
          onEdit={(item) => setEditTarget(item)}
          onDelete={handleDelete}
        />
      ) : (
        <Empty title="Tipos de Termo" />
      )}

      <CreateTermTypeDialog
        visible={createVisible}
        onHide={() => setCreateVisible(false)}
      />

      {editTarget && (
        <EditTermTypeDialog
          visible={!!editTarget}
          onHide={() => setEditTarget(null)}
          item={editTarget}
        />
      )}
    </ContentPage>
  );
};

export default TermTypePage;
