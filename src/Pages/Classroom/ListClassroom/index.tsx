import { InputText } from "primereact/inputtext";
import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import CardClassroom from "../../../Components/Card/CardClassroom";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import Empty from "../../../Components/Empty";
import Loading from "../../../Components/Loading";
import ClassroomProvider, {
  ClassroomContext,
} from "../../../Context/Classroom/context";
import { ClassroomTypes } from "../../../Context/Classroom/type";
import { idProject } from "../../../Services/localstorage";
import { Column, Padding } from "../../../Styles/styles";
import { usePermissions } from "../../../hooks/usePermissions";

const ListClassroom = () => {
  return (
    <ClassroomProvider>
      <ListClassroomPage />
    </ClassroomProvider>
  );
};

const ListClassroomPage = () => {
  const history = useNavigate();
  const { can } = usePermissions();
  const [filter, setFilter] = useState("");

  const props = useContext(ClassroomContext) as ClassroomTypes;

  if (props.isLoading) return <Loading />;

  const search = () => {
    if (filter !== "") {
      const buscaLowerCase = filter.toLowerCase();
      return props.classrooms?.filter((props: any) =>
        props.name.toLowerCase().includes(buscaLowerCase)
      );
    }
    return props.classrooms;
  };

  return (
    <ContentPage
      title="Turmas"
      description="Visualização das turmas."
      permissionButton={can("classroom.create")}
      addButton
      onClick={() => history("/turma/criar/" + props.project)}
    >
      <Column>
        <Padding />
        <div style={{width: window.innerWidth > 600 ? "60%" : "100%"}}>
          <div className="grid ">
            <Column className="col-12 md:col-6" id="center">
              <label>Nome da turma</label>
              <Padding />
              <span className="p-input-icon-left">
                <i className="pi pi-search" />
                <InputText
                  placeholder="Pesquise pelo nome"
                  onChange={(e) => {
                    setFilter(e.target.value);
                  }}
                  style={{ width: "100%" }}
                  value={filter}
                />
              </span>
            </Column>
            <div className="col-12 md:col-6">
              <label>Plano de trabalho</label>
              <Padding />
              <DropdownComponent
                placerholder="Escolha o plano de trabalho"
                options={props.tsOne?.project}
                optionsLabel="name"
                optionsValue="id"
                value={props.project}
                onChange={(e) => {
                  props.setProject(e.value);
                  idProject(e.value);
                }}
              />
            </div>
          </div>
        </div>
      </Column>

      <Padding padding="8px" />
      {search()?.length > 0 ? (
        <div className="grid">
          {search()?.map((item: any, index: number) => {
            return (
              <div className="col-12 md:col-6 lg:col-4">
                <CardClassroom
                  title={item.name}
                  meetingCount={item._count.meeting}
                  registrationCount={item._count.register_classroom}
                  id={item.id}
                  status={item.status}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <Empty title="Turmas" />
      )}
    </ContentPage>
  );
};

export default ListClassroom;
