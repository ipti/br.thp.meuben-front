import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useState } from "react";
import * as Yup from "yup";
import { useMutation } from "react-query";
import Swal from "sweetalert2";
import TextInput from "../../Components/TextInput";
import FieldError from "../../Components/FieldError";
import DropdownComponent from "../../Components/Dropdown";
import { updateTermType } from "../../Services/TermType/request";
import { TermType } from "../../Services/TermType/type";
import queryClient from "../../Services/reactquery";
import styles from "../../Styles";
import { Padding, Row } from "../../Styles/styles";

type Props = {
  visible: boolean;
  onHide: () => void;
  item: TermType;
};

const schema = Yup.object().shape({
  label: Yup.string().required("Rótulo é obrigatório"),
});

const activeOptions = [
  { label: "Ativo", value: true },
  { label: "Inativo", value: false },
];

const EditTermTypeDialog = ({ visible, onHide, item }: Props) => {
  const [submitted, setSubmitted] = useState(false);

  const mutation = useMutation(
    (body: { label: string; active: boolean; order: number }) =>
      updateTermType(item.id, body),
    {
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Tipo de termo atualizado!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
        queryClient.invalidateQueries("term-types");
        onHide();
      },
      onError: (error: any) => {
        Swal.fire({
          icon: "error",
          title: error.response?.data?.message ?? "Erro ao atualizar tipo de termo",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
    }
  );

  return (
    <Dialog
      header="Editar Tipo de Termo"
      visible={visible}
      onHide={onHide}
      style={{ width: "440px" }}
    >
      <Formik
        initialValues={{ label: item.label, active: item.active, order: item.order }}
        validationSchema={schema}
        enableReinitialize
        onSubmit={(values) => {
          mutation.mutate({ label: values.label, active: values.active, order: Number(values.order) });
        }}
      >
        {({ values, errors, handleChange, setFieldValue }) => (
          <Form>
            <label>Código</label>
            <Padding />
            <TextInput
              name="code_readonly"
              onChange={() => {}}
              placeholder=""
              value={item.code}
              disabled
            />

            <Padding padding="16px" />
            <label>Rótulo *</label>
            <Padding />
            <TextInput
              name="label"
              onChange={handleChange}
              placeholder="Rótulo"
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
            <label>Status</label>
            <Padding />
            <DropdownComponent
              name="active"
              value={values.active}
              options={activeOptions}
              optionsLabel="label"
              optionsValue="value"
              onChange={(e: any) => setFieldValue("active", e.target.value)}
              placerholder="Status"
            />

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
                label="Salvar"
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

export default EditTermTypeDialog;
