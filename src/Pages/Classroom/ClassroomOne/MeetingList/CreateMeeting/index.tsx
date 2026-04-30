import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { MultiSelect } from "primereact/multiselect";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import CalendarComponent from "../../../../../Components/Calendar";
import ContentPage from "../../../../../Components/ContentPage";
import TextInput from "../../../../../Components/TextInput";
import TimeInput from "../../../../../Components/TimeInput";
import CreateMeetingProvider, {
  CreateMeetingContext,
} from "../../../../../Context/Classroom/Meeting/Create/context";
import { CreateMeetingType } from "../../../../../Context/Classroom/Meeting/Create/type";
import { useFetchRequestUsers } from "../../../../../Services/Users/query";
import { Padding, Row } from "../../../../../Styles/styles";

const CreateMeeting = () => {
  return (
    <CreateMeetingProvider>
      <CreateMeetingPage />
    </CreateMeetingProvider>
  );
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#e53e3e", marginTop: "6px", fontSize: "13px" }}>
      <i className="pi pi-times-circle" style={{ fontSize: "13px" }} />
      <span>{message}</span>
    </div>
  );
};

const schema = Yup.object().shape({
  name: Yup.string()
    .max(150, "Nome deve ter no máximo 150 caracteres")
    .required("Nome é obrigatório"),
  meeting_date: Yup.date()
    .typeError("Data do encontro inválida")
    .required("Data do encontro é obrigatória"),
  users: Yup.array()
    .min(1, "Selecione ao menos um responsável")
    .required("Responsável é obrigatório"),
  theme: Yup.string().max(300, "Tema deve ter no máximo 300 caracteres").optional(),
  workload: Yup.string().optional(),
});

const CreateMeetingPage = () => {
  const props = useContext(CreateMeetingContext) as CreateMeetingType;
  const { data: userRequest } = useFetchRequestUsers(undefined);
  const { id } = useParams();
  const [submitted, setSubmitted] = useState(false);

  return (
    <ContentPage title="Criar Encontro" description="Crie um novo encontro.">
      <Padding padding="16px" />
      <Formik
        initialValues={{ name: "", users: [], meeting_date: undefined, theme: "", workload: "" }}
        validationSchema={schema}
        onSubmit={(values) => {
          props.CreateMeeting({ ...values, classroom: parseInt(id!) });
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => {
          const fieldError = (field: string) =>
            submitted && (errors as any)[field] ? (errors as any)[field] : undefined;

          return (
            <Form>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label>Nome *</label>
                  <Padding />
                  <TextInput
                    placeholder="Nome"
                    value={values.name}
                    name="name"
                    onChange={handleChange}
                  />
                  <FieldError message={fieldError("name")} />
                </div>
                <div className="col-12 md:col-6">
                  <label>Tema</label>
                  <Padding />
                  <TextInput
                    placeholder="Tema"
                    value={values.theme}
                    name="theme"
                    onChange={handleChange}
                  />
                  <FieldError message={fieldError("theme")} />
                </div>
              </div>
              <div className="grid">
                <div className="col-12 md:col-4">
                  <label>Data do encontro *</label>
                  <Padding />
                  <CalendarComponent
                    placeholder="Data do encontro"
                    name="meeting_date"
                    dateFormat="dd/mm/yy"
                    value={values.meeting_date}
                    onChange={handleChange}
                  />
                  <FieldError message={fieldError("meeting_date")} />
                </div>
                <div className="col-12 md:col-4">
                  <label>Carga Horária (horas)</label>
                  <Padding />
                  <TimeInput
                    placeholder="Carga Horária"
                    value={values.workload}
                    name="workload"
                    onChange={handleChange}
                  />
                  <FieldError message={fieldError("workload")} />
                </div>
                <div className="col-12 md:col-4">
                  <label>Responsável *</label>
                  <Padding />
                  <MultiSelect
                    optionLabel="name"
                    onChange={(e) => setFieldValue("users", e.value)}
                    filter
                    maxSelectedLabels={3}
                    className="w-full"
                    name="users"
                    placeholder="Responsável"
                    value={values.users}
                    options={userRequest}
                  />
                  <FieldError message={fieldError("users")} />
                </div>
              </div>
              <Padding padding="16px" />
              <Row id="end">
                <Button
                  label="Salvar"
                  type="submit"
                  onClick={() => setSubmitted(true)}
                />
              </Row>
            </Form>
          );
        }}
      </Formik>
    </ContentPage>
  );
};

export default CreateMeeting;
