import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import CalendarComponent from "../../../../../Components/Calendar";
import ContentPage from "../../../../../Components/ContentPage";
import FieldError from "../../../../../Components/FieldError";
import MultiSelectComponet from "../../../../../Components/MultiSelect";
import TextInput from "../../../../../Components/TextInput";
import TimeInput from "../../../../../Components/TimeInput";
import CreateMeetingProvider, {
  CreateMeetingContext,
} from "../../../../../Context/Classroom/Meeting/Create/context";
import { CreateMeetingType } from "../../../../../Context/Classroom/Meeting/Create/type";
import { getErrorsAsArray } from "../../../../../Controller/controllerGlobal";
import { useFetchRequestUsers } from "../../../../../Services/Users/query";
import color from "../../../../../Styles/colors";
import { Column, Padding, Row } from "../../../../../Styles/styles";

// ─── ErrorSummary ─────────────────────────────────────────────────────────────
const ErrorSummary = ({ errors }: { errors: string[] }) => {
  if (errors.length === 0) return null;
  return (
    <div
      style={{
        background: color.colorCardRed,
        border: `1px solid ${color.red}`,
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <i className="pi pi-exclamation-circle" style={{ color: color.red, fontSize: "18px" }} />
        <strong style={{ color: color.red, fontSize: "15px" }}>
          Corrija os seguintes erros antes de continuar:
        </strong>
      </div>
      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        {errors.map((error, index) => (
          <li key={index} style={{ color: color.red, marginBottom: "4px", fontSize: "14px" }}>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

// ─── Schema ──────────────────────────────────────────────────────────────────
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
  workload: Yup.mixed()
    .test("required-time", "Carga horária é obrigatória", (v) => typeof v === "number"),
});

// ─── Page wrapper ─────────────────────────────────────────────────────────────
const CreateMeeting = () => (
  <CreateMeetingProvider>
    <CreateMeetingPage />
  </CreateMeetingProvider>
);

// ─── Form ─────────────────────────────────────────────────────────────────────
const CreateMeetingPage = () => {
  const props = useContext(CreateMeetingContext) as CreateMeetingType;
  const { data: usersResponse } = useFetchRequestUsers({ perPage: 1000 });
  const userRequest = usersResponse?.data;
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
        {({ values, handleChange, errors, setFieldValue, isSubmitting }) => {
          const errorArray = submitted ? getErrorsAsArray(errors) : [];
          const fieldError = (field: string) =>
            submitted ? (errors as any)[field] : undefined;

          return (
            <Form>
              <Column>
                <Row id="end">
                  <Button
                    label="Salvar"
                    type="submit"
                    icon="pi pi-check"
                    loading={isSubmitting}
                    onClick={() => setSubmitted(true)}
                  />
                </Row>
              </Column>
              <Padding padding="8px" />
              <ErrorSummary errors={errorArray} />
              <Padding padding="8px" />
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
                  <MultiSelectComponet
                    optionsLabel="name"
                    onChange={(e: any) => setFieldValue("users", e.value)}
                    name="users"
                    placerholder="Responsável"
                    value={values.users}
                    options={userRequest}
                  />
                  <FieldError message={fieldError("users")} />
                </div>
              </div>
              <Padding padding="16px" />
            </Form>
          );
        }}
      </Formik>
    </ContentPage>
  );
};

export default CreateMeeting;
