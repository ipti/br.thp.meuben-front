import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import CardProject from "../../../Components/Card/CardProject";
import ContentPage from "../../../Components/ContentPage";
import Empty from "../../../Components/Empty";
import ProjectListProvider, {
  ProjectListContext,
} from "../../../Context/Project/ProjectList/context";
import { ProjectListTypes } from "../../../Context/Project/ProjectList/type";
import { Padding } from "../../../Styles/styles";
import { usePermissions } from "../../../hooks/usePermissions";

const ProjectsList = () => {
  return (
    <ProjectListProvider>
      <ProjectsListPage />
    </ProjectListProvider>
  );
};

const ProjectsListPage = () => {
  const history = useNavigate();
  const { can } = usePermissions();

  const props = useContext(ProjectListContext) as ProjectListTypes;

  return (
    <ContentPage
      title="Planos de trabalho"
      description="Visualização dos planos de trabalho."
      permissionButton={can("project.create")}
      addButton
      onClick={() => history("/projetos/criar")}
    >
      <Padding padding="16px" />
      {props.tsOne?.project?.length! > 0 ? (
        <div className="grid">
          {props.tsOne?.project?.map((item, index) => {
            return (
              <div className="col-12 md:col-6 lg:col-4" key={index}>
                <CardProject title={item.name} id={item.id} />
              </div>
            );
          })}
        </div>
      ) : (
        <Empty title="Tecnologias" />
      )}
    </ContentPage>
  );
};

export default ProjectsList;
