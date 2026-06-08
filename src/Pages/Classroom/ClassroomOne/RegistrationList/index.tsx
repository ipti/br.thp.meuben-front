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
import { StatusTermEnum, TypeTermEnum } from "../../../../Controller/controllerGlobal";
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

  const typeTermOptions = Object.entries(TypeTermEnum).map(([key, label]) => ({
    id: key,
    name: label as string,
  }));

  const search = () => {
    if (filter !== "") {
      const buscaLowerCase = filter.toLowerCase();
      return props.registrations?.filter((props) =>
        props.registration.name.toLowerCase().includes(buscaLowerCase)
      );
    }
    return props.registrations;
  };


  const activeFiltersCount = [props.statusTerm, props.typeTerm, filter].filter(Boolean).length;

  return (
    <ContentPage title={classroom?.name} description="Visualização das matrículas realizadas na turma.">
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: "12px",
        border: "1px solid rgba(219,230,255,1)",
        background: "#f8faff",
        marginBottom: "16px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7ab5", fontSize: "0.8rem", fontWeight: 700, marginRight: 4 }}>
          <i className="pi pi-filter" />
          <span>Filtros</span>
          {activeFiltersCount > 0 && (
            <span style={{
              background: "#3b5bdb", color: "#fff",
              borderRadius: "999px", fontSize: "0.65rem",
              padding: "1px 6px", fontWeight: 700,
            }}>
              {activeFiltersCount}
            </span>
          )}
        </div>

        <span className="p-input-icon-left" style={{ flex: "1 1 180px", minWidth: 160 }}>
          <i className="pi pi-search" />
          <InputText
            style={{ width: "100%" }}
            placeholder="Buscar por nome"
            onChange={(e) => setFilter(e.target.value)}
            value={filter}
          />
        </span>

        <Dropdown
          style={{ flex: "1 1 200px", minWidth: 180 }}
          value={props.statusTerm}
          options={statusTermOptions}
          optionLabel="name"
          optionValue="id"
          placeholder="Status do termo"
          showClear
          onChange={(e) => props.setStatusTerm(e.value || undefined)}
        />

        <Dropdown
          style={{ flex: "1 1 200px", minWidth: 180 }}
          value={props.typeTerm}
          options={typeTermOptions}
          optionLabel="name"
          optionValue="id"
          placeholder="Tipo de termo"
          showClear
          onChange={(e) => props.setTypeTerm(e.value || undefined)}
        />

        {activeFiltersCount > 0 && (
          <button
            onClick={() => { setFilter(""); props.setStatusTerm(undefined); props.setTypeTerm(undefined); }}
            style={{
              border: "none", background: "none", cursor: "pointer",
              fontSize: "0.75rem", color: "#e05", fontWeight: 600, whiteSpace: "nowrap",
              padding: "4px 8px",
            }}
          >
            <i className="pi pi-times" style={{ fontSize: "0.7rem", marginRight: 4 }} />
            Limpar
          </button>
        )}
      </div>
      {props?.registrations?.length! > 0 ? (
        <div className="grid">
          {search()?.map((item, index) => {
            return (
              <div className="col-12 md:col-6 lg:col-3" key={index}>
                <CardRegistration
                  title={item.registration.thp_id}
                  subtitle={item.registration.name}
                  idRegistration={item.id}
                  status={item.status}
                  avatar_url={item.registration.avatar_url}
                  adhesion_term_status={item.registration.adhesion_term?.status}
                  has_other_terms={item.registration.has_other_terms}
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
