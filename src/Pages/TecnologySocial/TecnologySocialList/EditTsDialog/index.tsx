import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useContext, useState } from "react";
import * as Yup from "yup";
import DropdownComponent from "../../../../Components/Dropdown";
import FieldError from "../../../../Components/FieldError";
import TextInput from "../../../../Components/TextInput";
import EditTsProvider, { EditTsContext } from "../../../../Context/TecnologySocial/EditTecnologySocial/context";
import { EditTsTypes } from "../../../../Context/TecnologySocial/EditTecnologySocial/type";
import { areaOptions } from "../../../../Controller/controllerGlobal";
import color from "../../../../Styles/colors";
import { Padding, Row } from "../../../../Styles/styles";

type EditTsDialogProps = {
  visible: boolean;
  onHide: () => void;
  id: number;
  title: string;
  area_of_activity?: string;
};

const schemaEditTs = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
});

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

const EditTsDialog = (props: EditTsDialogProps) => {
  return (
    <EditTsProvider>
      <EditTsDialogContent {...props} />
    </EditTsProvider>
  );
};

const EditTsDialogContent = ({ visible, onHide, id, title, area_of_activity }: EditTsDialogProps) => {
  const editProps = useContext(EditTsContext) as EditTsTypes;
  const [submitted, setSubmitted] = useState(false);

  return (
    <Dialog
      header="Editar Tecnologia Social"
      visible={visible}
      onHide={onHide}
      style={{ width: "400px" }}
    >
      <Formik
        initialValues={{ name: title, area_of_activity: area_of_activity || "" }}
        validationSchema={schemaEditTs}
        enableReinitialize
        onSubmit={(values) => {
          editProps.EditTechnology({
            stId: id,
            body: {
              name: values.name,
              area_of_activity: values.area_of_activity || undefined,
            },
          });
          onHide();
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
              <ErrorSummary errors={errorArray} />

              <label>Nome *</label>
              <Padding />
              <TextInput
                name="name"
                onChange={handleChange}
                placeholder="Nome*"
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

              <Padding padding="16px" />
              <Row id="end">
                <Button
                  label="Cancelar"
                  icon="pi pi-times"
                  className="p-button-text"
                  onClick={onHide}
                  type="button"
                />
                <Button
                  label="Salvar"
                  icon="pi pi-check"
                  loading={editProps.loading}
                  type="submit"
                  onClick={() => setSubmitted(true)}
                />
              </Row>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default EditTsDialog;
