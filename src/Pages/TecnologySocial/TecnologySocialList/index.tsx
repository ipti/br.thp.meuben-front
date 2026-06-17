import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardTs from "../../../Components/Card/CardTs";
import ContentPage from "../../../Components/ContentPage";
import EditTsDialog from "./EditTsDialog";
import Empty from "../../../Components/Empty";
import Loading from "../../../Components/Loading";
import { AplicationContext } from "../../../Context/Aplication/context";
import { ROLE } from "../../../Controller/controllerGlobal";
import { usePermissions } from "../../../hooks/usePermissions";
import { idTs, menuItem } from "../../../Services/localstorage";
import { Padding } from "../../../Styles/styles";
import { PropsAplicationContext } from "../../../Types/types";

const TecnologySocial = () => {
  const history = useNavigate();
  const propsAplication = useContext(
    AplicationContext
  ) as PropsAplicationContext;
  const { can } = usePermissions();
  const [editVisible, setEditVisible] = useState(false);
  const [selectedTs, setSelectedTs] = useState<{ id: number; title: string; area_of_activity?: string } | null>(null);

  if (!propsAplication.project) return <Loading />;
  return (
    <ContentPage title="Tecnologias" description="Visualização das tecnologias sociais." permissionButton={can("socialTechnology.create")} addButton onClick={() => history("/tecnologias/criar")} >
      <Padding padding="16px" />
      {propsAplication.project.length > 0 ? (
      <div className="grid">
        {propsAplication.project?.map((item, index) => {
          return (
            <div className="col-12 md:col-6 lg:col-4" key={index} onClick={() => {
              idTs(item.id.toString());
              history("/projetos");
              menuItem("3");
            }}>
              <CardTs
                title={item.name}
                id={item.id}
                isAdmin={can("socialTechnology.edit")}
                area_of_activity={item.area_of_activity}
                onEdit={(id, title) => {
                  setSelectedTs({ id, title, area_of_activity: item.area_of_activity || undefined });
                  setEditVisible(true);
                }}
              />
            </div>
          );
        })}
      </div>) : (
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
