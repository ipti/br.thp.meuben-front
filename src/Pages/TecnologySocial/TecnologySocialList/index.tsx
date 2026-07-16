import { useMutation } from "react-query";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import CardTs from "../../../Components/Card/CardTs";
import ContentPage from "../../../Components/ContentPage";
import Empty from "../../../Components/Empty";
import Loading from "../../../Components/Loading";
import { AplicationContext } from "../../../Context/Aplication/context";
import { usePermissions } from "../../../hooks/usePermissions";
import { idTs, menuItem } from "../../../Services/localstorage";
import queryClient from "../../../Services/reactquery";
import { requestDeleteSocialTechnology } from "../../../Services/SocialTechnology/request";
import styles from "../../../Styles";
import { Padding } from "../../../Styles/styles";
import { PropsAplicationContext } from "../../../Types/types";
import EditTsDialog from "./EditTsDialog";

const TecnologySocial = () => {
  const history = useNavigate();
  const propsAplication = useContext(AplicationContext) as PropsAplicationContext;
  const { can } = usePermissions();
  const [editVisible, setEditVisible] = useState(false);
  const [selectedTs, setSelectedTs] = useState<{ id: number; title: string; area_of_activity?: string } | null>(null);

  const deleteMutation = useMutation(
    (stId: number) => requestDeleteSocialTechnology(stId),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: "error",
          title: error.response?.data?.message ?? "Erro ao excluir tecnologia social",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Tecnologia social excluída com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
        queryClient.refetchQueries("useRequestsSocialTecnologyList");
      },
    }
  );

  const handleDelete = (id: number, title: string) => {
    Swal.fire({
      icon: "warning",
      title: `Excluir "${title}"?`,
      text: "Esta ação não pode ser desfeita. Tecnologias vinculadas a perfis ou planos de trabalho não podem ser excluídas.",
      showCancelButton: true,
      confirmButtonText: "Excluir",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#d33",
      cancelButtonColor: styles.colors.colorsBaseProductNormal,
    }).then((result) => {
      if (result.isConfirmed) deleteMutation.mutate(id);
    });
  };

  if (!propsAplication.project) return <Loading />;

  return (
    <ContentPage
      title="Tecnologias"
      description="Visualização das tecnologias sociais."
      permissionButton={can("socialTechnology.create")}
      addButton
      onClick={() => history("/tecnologias/criar")}
    >
      <Padding padding="16px" />
      {propsAplication.project.length > 0 ? (
        <div className="grid">
          {propsAplication.project?.map((item, index) => (
            <div
              className="col-12 md:col-6 lg:col-4"
              key={index}
              onClick={() => {
                idTs(item.id.toString());
                history("/projetos");
                menuItem("3");
              }}
            >
              <CardTs
                title={item.name}
                id={item.id}
                isAdmin={can("socialTechnology.edit")}
                area_of_activity={item.area_of_activity}
                onEdit={(id, title) => {
                  setSelectedTs({ id, title, area_of_activity: item.area_of_activity || undefined });
                  setEditVisible(true);
                }}
                onDelete={can("socialTechnology.delete") ? handleDelete : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <Empty title="Tecnologias" />
      )}

      {selectedTs && (
        <EditTsDialog
          visible={editVisible}
          onHide={() => setEditVisible(false)}
          id={selectedTs.id}
          title={selectedTs.title}
          area_of_activity={selectedTs.area_of_activity || undefined}
        />
      )}
    </ContentPage>
  );
};

export default TecnologySocial;
