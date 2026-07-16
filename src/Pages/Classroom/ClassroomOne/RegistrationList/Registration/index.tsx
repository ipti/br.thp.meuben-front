import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import avatar from "../../../../../Assets/images/avatar.svg";
import ContentPage from "../../../../../Components/ContentPage";
import DropdownComponent from "../../../../../Components/Dropdown";
import Loading from "../../../../../Components/Loading";
import RegistartionDetailsProvider, {
  RegistrationDetailsContext,
} from "../../../../../Context/Classroom/Registration/context";
import { RegistrationDetailsTypes } from "../../../../../Context/Classroom/Registration/type";
import {
  color_race,
  formatarData,
  getStatusList,
  StatusRegistrationEnum,
  StatusTermEnum,
  typesex,

} from "../../../../../Controller/controllerGlobal";
import { useFetchRequestClassroomOne } from "../../../../../Services/Classroom/query";
import { Padding } from "../../../../../Styles/styles";
import { Avatar } from "../../../../Beneficiaries/BeneficiariesEdit";
import ModalAddTerm from "../../../../Beneficiaries/BeneficiariesEdit/ModalAddTerm";


const Registration = () => {
  return (
    <RegistartionDetailsProvider>
      <RegistrationPage />
    </RegistartionDetailsProvider>
  );
};

const RegistrationPage = () => {
  const props = useContext(
    RegistrationDetailsContext
  ) as RegistrationDetailsTypes;
  const [visibleTerm, setVisibleTerm] = useState<any>();
  const history = useNavigate();


  const { id } = useParams();
  const { data: classroom } = useFetchRequestClassroomOne(parseInt(id!));

  const InfoField = ({ label, value }: { label: string; value?: string | null }) => (
    <div className="col-12 md:col-6" style={{ marginBottom: "8px" }}>
      <span style={{ fontSize: "0.78rem", color: "#888", display: "block", marginBottom: "2px" }}>{label}</span>
      <span style={{
        display: "block",
        padding: "8px 12px",
        backgroundColor: "#f5f5f5",
        borderRadius: "6px",
        fontSize: "0.95rem",
        color: value ? "#333" : "#aaa",
        minHeight: "36px"
      }}>
        {value || "—"}
      </span>
    </div>
  );

  if (props.isLoading) return <Loading />;

  const reg = props.registration?.registration;

  return (
    <ContentPage title={classroom?.name} description="Detalhes da matricula do beneficiário">
      <Padding padding="16px" />

      {props.registration ? (
        <>
          <Formik
            initialValues={props.initialValue}
            onSubmit={(values) => {
              props.handleUpdateRegistration({ ...values });
            }}
          >
            {({ values, handleChange }) => (
              <Form>
                <div className="grid align-items-end">
                  <div className="col-12 md:col-6">
                    <label>Status da matrícula</label>
                    <Padding />
                    <DropdownComponent
                      value={values.status}
                      onChange={handleChange}
                      name="status"
                      placerholder="Status"
                      optionsLabel="name"
                      options={getStatusList()}
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <Button label="Salvar" />
                  </div>
                </div>
              </Form>
            )}
          </Formik>

          <Padding padding="16px" />
          <Avatar>
            <img alt="" src={props.registration?.avatar_url ?? avatar} />
          </Avatar>
          <Padding padding="16px" />

          <h3>Dados Básicos</h3>
          <Padding />
          <div className="grid">
            <InfoField label="Id THP" value={reg?.thp_id} />
            <InfoField label="Status do beneficiário" value={reg?.status ? StatusRegistrationEnum[reg.status] : reg?.status} />
            <InfoField label="Nome" value={reg?.name} />
            <InfoField label="Sexo" value={typesex.find((s) => s.id === reg?.sex)?.type} />
            <InfoField label="Data de Nascimento" value={reg?.birthday?.toString()} />
            <InfoField label="Cor de raça" value={color_race.find((c) => c.id === reg?.color_race)?.name} />
            <InfoField label="CPF" value={reg?.cpf} />
            <InfoField label="Telefone para contato" value={reg?.responsable_telephone} />
            <InfoField label="Deficiente" value={reg?.deficiency === true ? "Sim" : reg?.deficiency === false ? "Não" : undefined} />
            {reg?.deficiency && (
              <InfoField label="Qual deficiência?" value={reg?.deficiency_description} />
            )}
          </div>

          <Padding padding="8px" />
          <h3>Dados do Responsável</h3>
          <Padding />
          <div className="grid">
            <InfoField label="Nome do Responsável" value={reg?.responsable_name} />
            <InfoField label="CPF do Responsável" value={reg?.responsable_cpf} />
          </div>

          <Padding padding="8px" />
          <h3>Termo</h3>
          <Padding padding="8px" />
          <DataTable
            value={reg?.register_term}
            tableStyle={{ minWidth: "50rem" }}
          >
            <Column body={(row) => formatarData(row?.dateTerm!)} header="Data de assinatura" />
            <Column body={(row) => formatarData(row?.dateValid ?? "")} header="Data de validade" />
            <Column body={(row) => row?.term_type?.label ?? row?.type ?? ""} header="Tipo do termo" />
            <Column body={(row) => StatusTermEnum[row?.status ?? ""] ?? ""} header="Status" />
            <Column body={(row) => row?.observation} header="Observações" />
          </DataTable>

          <h3 className="mt-4">Endereço</h3>
          <Padding />
          {!reg?.state_fk ? (
            <div style={{
              display: "flex", alignItems: "center", gap: "10px",
              backgroundColor: "#fff8e1", border: "1px solid #f6c94e",
              borderRadius: "8px", padding: "12px 16px", color: "#b07d00",
            }}>
              <i className="pi pi-exclamation-triangle" style={{ fontSize: "1.4rem", color: "#f6c94e" }} />
              <div>
                <strong>Endereço pendente</strong>
                <p style={{ margin: 0, fontSize: "0.85rem" }}>
                  O beneficiário ainda não possui um endereço cadastrado.{" "}
                  Para cadastrar, clique em <strong>"Ver mais informações"</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid">
              <InfoField label="CEP" value={reg?.cep} />
              <InfoField label="Endereço" value={reg?.address} />
              <InfoField label="Complemento" value={reg?.complement} />
              <InfoField label="Estado" value={reg?.state?.name} />
              <InfoField label="Cidade" value={reg?.city?.name} />
            </div>
          )}
        </>
      ) : null}

      <div style={{
        marginTop: "24px",
        padding: "16px",
        backgroundColor: "#f0f4ff",
        border: "1px solid #c7d7f9",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        flexWrap: "wrap",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "#3b5bdb" }}>
          <i className="pi pi-info-circle" style={{ fontSize: "1.4rem" }} />
          <div>
            <strong>Edição de dados do beneficiário</strong>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#555" }}>
              Para editar os dados pessoais, endereço ou responsável, acesse o perfil completo do beneficiário.
            </p>
          </div>
        </div>
        <Button
          label="Ver mais informações"
          icon="pi pi-external-link"
          onClick={() => history('/beneficiarios/' + reg?.id)}
        />
      </div>

      <ModalAddTerm
        onHide={() => setVisibleTerm(false)}
        visible={visibleTerm}
        id={reg?.id!}
      />
    </ContentPage>
  );
};
export default Registration;
