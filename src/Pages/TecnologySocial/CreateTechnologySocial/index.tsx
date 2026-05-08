import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import FieldError from "../../../Components/FieldError";
import TextInput from "../../../Components/TextInput";
import CreateTsProvider, {
  CreateTsContext,
} from "../../../Context/TecnologySocial/CreateTecnologySocial/context";
import { CreateTsTypes } from "../../../Context/TecnologySocial/CreateTecnologySocial/type";
import { areaOptions } from "../../../Controller/controllerGlobal";
import color from "../../../Styles/colors";
import { Padding, Row } from "../../../Styles/styles";

// ─── Schema ──────────────────────────────────────────────────────────────────
const CreateTsSchema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
});

const initialValues = {
  name: "",
  area_of_activity: "",
};

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

// ─── Page wrapper ─────────────────────────────────────────────────────────────
const CreateTechnologySocial = () => (
  <CreateTsProvider>
    <CreateTechnologySocialPage />
  </CreateTsProvider>
);

// ─── Form ─────────────────────────────────────────────────────────────────────
const CreateTechnologySocialPage = () => {
  const props = useContext(CreateTsContext) as CreateTsTypes;
  const [submitted, setSubmitted] = useState(false);

  return (
    <ContentPage title="Criar Tecnologia" description="Crie sua tecnologia social.">
      <Padding padding="16px" />
      <Formik
        initialValues={initialValues}
        validationSchema={CreateTsSchema}
        onSubmit={(values) => {
          props.CreateTechnology({
            name: values.name,
            area_of_activity: values.area_of_activity || undefined,
          });
        }}
      >
        {({ values, errors, handleChange }) => {
          const fieldError = (field: string) =>
            submitted ? (errors as Record<string, string>)[field] : undefined;
          const errorArray = submitted
            ? (Object.values(errors).filter(Boolean) as string[])
            : [];

          return (
            <Form>
              <Row id="end">
                <Button
                  label="Criar"
                  icon="pi pi-plus"
                  type="submit"
                  onClick={() => setSubmitted(true)}
                />
              </Row>
              <Padding padding="8px" />
              <ErrorSummary errors={errorArray} />
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label>Nome *</label>
                  <Padding />
                  <TextInput
                    name="name"
                    onChange={handleChange}
                    placeholder="Nome"
                    value={values.name}
                  />
                  <FieldError message={fieldError("name")} />
                  <Padding padding="16px" />
                  <label>Área de Atuação</label>
                  <Padding />
                  <DropdownComponent
                    name="area_of_activity"
                    value={values.area_of_activity}
                    options={areaOptions}
                    optionsLabel="name"
                    optionsValue="id"
                    onChange={handleChange}
                    placerholder="Selecione a área de atuação"
                  />
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

export default CreateTechnologySocial;
