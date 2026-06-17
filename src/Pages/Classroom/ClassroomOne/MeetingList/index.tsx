import { Button } from "primereact/button";
import { useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { usePermissions } from "../../../../hooks/usePermissions";
import CardMeeting from "../../../../Components/Card/CardMeeting";
import ContentPage from "../../../../Components/ContentPage";
import Empty from "../../../../Components/Empty";
import Loading from "../../../../Components/Loading";
import MeetingListProvider, {
  MeetingListContext,
} from "../../../../Context/Classroom/Meeting/MeetingList/context";
import { MeetingListTypes } from "../../../../Context/Classroom/Meeting/MeetingList/type";
import ProjectListProvider from "../../../../Context/Project/ProjectList/context";
import { useFetchRequestClassroomOne } from "../../../../Services/Classroom/query";
import { Padding } from "../../../../Styles/styles";

const MeetingList = () => {
  return (
    <MeetingListProvider>
      <ProjectListProvider>
        <MeetingListPage />
      </ProjectListProvider>
    </MeetingListProvider>
  );
};

const MeetingListPage = () => {
  const props = useContext(MeetingListContext) as MeetingListTypes;

  const { id } = useParams();

  const { data: classroom, isLoading } = useFetchRequestClassroomOne(
    parseInt(id!)
  );

  const history = useNavigate();
  const { can } = usePermissions();

  if (props.isLoading && isLoading) return <Loading />;
  return (
    <ContentPage title={"Encontros da turma: " + classroom?.name} description="Visualização dos encontros da turma.">
      <Padding padding="16px" />
      {can("meeting.create") && (
        <Button
          label="Criar encontro"
          onClick={() => history(`/turma/${id}/encontros/criar`)}
        />
      )}
      <Padding padding="16px" />
      {props?.meetings?.length! > 0 ? (
        <div className="grid">
          {props.meetings?.map((item, index) => {
            return (
              <div className="col-12 md:col-6 lg:col-4" key={index}>
                <CardMeeting
                  title={item.name}
                  data={item.meeting_date}
                  status={item.status}
                  idMeeting={item.id}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <Empty title="Encontros" />
      )}
    </ContentPage>
  );
};

export default MeetingList;
