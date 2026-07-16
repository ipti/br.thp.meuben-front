import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import * as Yup from "yup";
import { useMutation } from "react-query";
import Swal from "sweetalert2";
import TextInput from "../../Components/TextInput";
import FieldError from "../../Components/FieldError";
import { createTermType } from "../../Services/TermType/request";
import queryClient from "../../Services/reactquery";
import styles from "../../Styles";
import { Padding, Row } from "../../Styles/styles";

type Props = {
  visible: boolean;
  onHide: () => void;
};

const schema = Yup.object().shape({
  code:  Yup.string().required("Código é obrigatório"),
  label: Yup.string().required("Rótulo é obrigatório"),
});

const CreateTermTypeDialog = ({ visible, onHide }: Props) => {
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation(createTermType, {
    onSuccess: () => {
      Swal.fire({
        icon: "success",
        title: "Tipo de termo criado com sucesso!",
        confirmButtonColor: styles.colors.colorsBaseProductNormal,
      });
      queryClient.invalidateQueries("term-types");
      onHide();
    },
    onError: (error: any) => {
      Swal.fire({
        icon: "error",
        title: error.response?.data?.message ?? "Erro ao criar tipo de termo",
        confirmButtonColor: styles.colors.colorsBaseProductNormal,
      });
    },
  });

  return (
    <Dialog
      header="Novo Tipo de Termo"
      visible={visible}
      onHide={onHide}
      style={{ width: "440px" }}
    >
      <Formik
        initialValues={{ code: "", label: "", is_adhesion_term: false, order: 0 }}
        validationSchema={schema}
        onSubmit={(values) => {
          mutation.mutate({
            code: values.code.toUpperCase().replace(/\s+/g, "_"),
            label: values.label,
            is_adhesion_term: values.is_adhesion_term,
            order: values.order,
          });
        }}
      >
        {({ values, errors, handleChange, setFieldValue }) => (
          <Form>
            <label>Código *</label>
            <Padding />
            <TextInput
              name="code"
              onChange={handleChange}
              placeholder="Ex: PRIVACIDADE"
              value={values.code}
            />
            {submitted && <FieldError message={(errors as any).code} />}

            <Padding padding="16px" />
            <label>Rótulo *</label>
            <Padding />
            <TextInput
              name="label"
              onChange={handleChange}
              placeholder="Ex: Política de privacidade"
              value={values.label}
            />
            {submitted && <FieldError message={(errors as any).label} />}

            <Padding padding="16px" />
            <label>Ordem</label>
            <Padding />
            <TextInput
              name="order"
              onChange={handleChange}
              placeholder="0"
              value={String(values.order)}
            />

            <Padding padding="16px" />
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Checkbox
                inputId="is_adhesion_term"
                checked={values.is_adhesion_term}
                onChange={(e) => setFieldValue("is_adhesion_term", e.checked)}
              />
              <label htmlFor="is_adhesion_term">Termo de adesão</label>
            </div>

            <Padding padding="24px" />
            <Row id="end">
              <Button
                label="Cancelar"
                icon="pi pi-times"
                className="p-button-text"
                onClick={onHide}
                type="button"
              />
              <Button
                label="Criar"
                icon="pi pi-check"
                loading={mutation.isLoading}
                type="submit"
                onClick={() => setSubmitted(true)}
              />
            </Row>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default CreateTermTypeDialog;
