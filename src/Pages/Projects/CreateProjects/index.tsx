import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import Swal from "sweetalert2";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import ErrorSummary from "../../../Components/ErrorSummary";
import FieldError from "../../../Components/FieldError";
import InputNumberComponent from "../../../Components/InputNumber";
import TextInput from "../../../Components/TextInput";
import CreateProjectProvider, {
  CreateProjectContext,
} from "../../../Context/Project/CreateList/context";
import { CreateProjectTypes } from "../../../Context/Project/CreateList/type";
import { GetIdTs } from "../../../Services/localstorage";
import { Column, Padding, Row } from "../../../Styles/styles";

const createProjectSchema = Yup.object().shape({
  name: Yup.string().required("Nome do plano de trabalho é obrigatório"),
  approval_percentage: Yup.number()
    .typeError("Porcentagem de aprovação é obrigatória")
    .required("Porcentagem de aprovação é obrigatória"),
});

const initialValues = {
  name: "",
  approval_percentage: undefined,
};

const CreateProjects = () => {
  return (
    <CreateProjectProvider>
      <CreateProjectsPage />
    </CreateProjectProvider>
  );
};

const CreateProjectsPage = () => {
  const props = useContext(CreateProjectContext) as CreateProjectTypes;
  const [submitted, setSubmitted] = useState(false);

  return (
    <ContentPage title="Criar plano de trabalho" description="Criar um novo plano de trabalho.">
      <Padding padding="16px" />
      <Formik
        initialValues={initialValues}
        validationSchema={createProjectSchema}
        onSubmit={(values) => {
          if (GetIdTs() !== "undefined") {
            props.CreateProject({
              name: values.name,
              approval_percentage: values.approval_percentage!,
              socialTechnologyId: parseInt(GetIdTs() as string),
            });
          } else {
            Swal.fire("Crie ou selecione uma Tecnologia");
          }
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
              <Column>
                <Row id="end">
                  <Button
                    label="Criar"
                    type="submit"
                    icon={"pi pi-plus"}
                    onClick={() => setSubmitted(true)}
                  />
                </Row>
              </Column>
              <Padding padding="8px" />
              <ErrorSummary errors={errorArray} />
              <Padding padding="32px" />
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label>Nome do plano de trabalho *</label>
                  <Padding />
                  <TextInput
                    name="name"
                    onChange={handleChange}
                    placeholder="Nome do plano de trabalho*"
                    value={values.name}
                  />
                  <FieldError message={fieldError("name")} />
                </div>
                <div className="col-12 md:col-6">
                  <label>Porcentagem de aprovação do plano de trabalho *</label>
                  <Padding />
                  <InputNumberComponent
                    name="approval_percentage"
                    onChange={handleChange}
                    suffix="%"
                    placeholder="Porcentagem de aprovação do plano de trabalho *"
                    value={values.approval_percentage}
                  />
                  <FieldError message={fieldError("approval_percentage")} />
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

export default CreateProjects;

