import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import CardRegistration from "../../../../Components/Card/CardRegistration";
import ContentPage from "../../../../Components/ContentPage";
import Empty from "../../../../Components/Empty";
import Loading from "../../../../Components/Loading";
import RegistartionClassroomProvider, {
  RegistrationClassroomContext,
} from "../../../../Context/Classroom/RegistrationsList/context";
import { RegistrationClassroomTypes } from "../../../../Context/Classroom/RegistrationsList/type";
import { StatusTermEnum } from "../../../../Controller/controllerGlobal";
import { useFetchRequestClassroomOne } from "../../../../Services/Classroom/query";
import { Padding, Row } from "../../../../Styles/styles";

const RegistrationList = () => {
  return (
    <RegistartionClassroomProvider>
      <RegistrationListPage />
    </RegistartionClassroomProvider>
  );
};

const RegistrationListPage = () => {
  const props = useContext(
    RegistrationClassroomContext
  ) as RegistrationClassroomTypes;
  const { id } = useParams();
  const { data: classroom } = useFetchRequestClassroomOne(parseInt(id!));
  const [filter, setFilter] = useState("");
  if (props.isLoading) return <Loading />;

  const statusTermOptions = [
    { id: "TERM_ANALYSIS", name: StatusTermEnum["TERM_ANALYSIS"] },
    { id: "ACTIVE_TERM", name: StatusTermEnum["ACTIVE_TERM"] },
    { id: "INACTIVE_TERM", name: StatusTermEnum["INACTIVE_TERM"] },
    { id: "INVALID_TERM", name: StatusTermEnum["INVALID_TERM"] },
  ];

  const search = () => {
    if (filter !== "") {
      const buscaLowerCase = filter.toLowerCase();
      return props.registrations?.filter((props) =>
        props.registration.name.toLowerCase().includes(buscaLowerCase)
      );
    }
    return props.registrations;
  };


  return (
    <ContentPage title={classroom?.name} description="Visualização das matriculas realizadas na turma.">
      <Row id="space-between">
        <span className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText
            placeholder="Pesquise pelo nome"
            onChange={(e) => {
              setFilter(e.target.value);
            }}
            value={filter}
          />
        </span>
        <div style={{ minWidth: "240px" }}>
          <Dropdown
            className="w-full"
            value={props.statusTerm}
            options={statusTermOptions}
            optionLabel="name"
            optionValue="id"
            placeholder="Filtrar por status do termo"
            showClear
            onChange={(e) => props.setStatusTerm(e.value || undefined)}
          />
        </div>
      </Row>
      <Padding padding="16px" />
      {props?.registrations?.length! > 0 ? (
        <div className="grid">
          {search()?.map((item, index) => {
            return (
              <div className="col-12 md:col-6 lg:col-4" key={index}>
                <CardRegistration
                  title={item.registration.thp_id}
                  subtitle={item.registration.name}
                  idRegistration={item.id}
                  status={item.status}
                  avatar_url={item.registration.avatar_url}
                />
              </div>
            );
          })}
        </div>
      ) : (
        <Empty title="Matriculas" />
      )}
    </ContentPage>
  );
};

export default RegistrationList;
