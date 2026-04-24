import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext } from "react";
import * as Yup from "yup";
import MaskInput from "../../../../../../Components/InputMask";
import TextInput from "../../../../../../Components/TextInput";
import { RegisterContext } from "../../../../../../Context/Register/context";
import { RegisterTypes } from "../../../../../../Context/Register/type";
import { validaCPF } from "../../../../../../Controller/controllerValidCPF";
import { Column, Padding, Row } from "../../../../../../Styles/styles";
import DropdownComponent from "../../../../../../Components/Dropdown";
import { kinship } from "../../../../../../Controller/controllerGlobal";
import Swal from "sweetalert2";
import CheckboxComponent from "../../../../../../Components/Checkbox";

const UnderAge = () => {
  const props = useContext(RegisterContext) as RegisterTypes;

  const initialValue = {
    responsable_cpf: props.dataValues.responsable_cpf ?? "",
    responsable_name: props.dataValues.responsable_name ?? "",
    responsable_telephone: props.dataValues.responsable_telephone ?? "",
    responsable_email: props.dataValues.responsable_email ?? "",
    kinship: props.dataValues.kinship ?? "",
    is_legal_responsible: props.dataValues.is_legal_responsible ?? false,
  };

  const schema = Yup.object().shape({
    responsable_cpf: Yup.string()
      .test("cpf-valid", "CPF inválido", (value) => validaCPF(value!))
      .required("CPF é obrigatório"),
    responsable_name: Yup.string().required(
      "Nome do responsável é obrigatório"
    ),
    responsable_telephone: Yup.string().required(
      "Telefone do responsável é obrigatório"
    ),
    responsable_email: Yup.string().email("E-mail do responsável inválido"),
    kinship: Yup.string().required("Parentesco é obrigatório"),
    is_legal_responsible: Yup.boolean()
      .oneOf([true], "Confirmação de responsável legal é obrigatória")
      .required("Confirmação de responsável legal é obrigatória"),
  });

  return (
    <>
      <Column className="contentStart" id="center">
        <Row id="center">
          <div className="col-12 md:col-6">
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <p>
                Campos com <strong>*</strong> são obrigatórios para concluir a matrícula.
              </p>
            </div>
          </div>
        </Row>
        <Padding padding={props.padding} />
        <Formik
          initialValues={initialValue}
          validationSchema={schema}
          onSubmit={(values) => {
            if (props.registraionFind) {
              Swal.fire({
                title:
                  "Identificamos um cadastro existente com este CPF. Caso continue, os dados atuais serão atualizados com as novas informações. Deseja prosseguir?",
                showCancelButton: true,
                confirmButtonText: "Sim",
              }).then((result) => {
                if (result.isConfirmed) {
                  props.NextStep(values);
                }
              });
            } else {
              props.NextStep(values);
            }
          }}
        >
          {({ values, handleChange, errors, touched, setFieldValue }) => {

            return (
              <Form>
                <Row id="center">
                  <div className="col-12 md:col-4">
                    <Padding />
                    <div>
                      <label>Nome do responsável *</label>
                      <Padding />
                      <TextInput
                        placeholder="Nome do responsável *"
                        value={values.responsable_name}
                        name="responsable_name"
                        onChange={handleChange}
                      />
                    </div>
                    {errors.responsable_name && touched.responsable_name ? (
                      <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.responsable_name}
                      </div>
                    ) : null}
                    <Padding padding={props.padding} />
                    <div>
                      <label>CPF do responvável *</label>
                      <Padding />
                      <MaskInput
                        mask="999.999.999-99"
                        placeholder="CPF do responsável *"
                        value={values.responsable_cpf}
                        name="responsable_cpf"
                        onChange={handleChange}
                      />
                    </div>
                    {errors.responsable_cpf && touched.responsable_cpf ? (
                      <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.responsable_cpf}
                      </div>
                    ) : null}
                    <Padding padding={props.padding} />
                    <div>
                      <label>Parantesco *</label>
                      <Padding />
                      <DropdownComponent
                        placerholder="Parantesco *"
                        onChange={handleChange}
                        name="kinship"
                        options={kinship}
                        optionsValue="id"
                        optionsLabel="name"
                        value={values.kinship}
                      />
                    </div>
                    {errors.kinship && touched.kinship ? (
                      <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.kinship}
                      </div>
                    ) : null}
                    <Padding padding={props.padding} />
                    <div>
                      <label>Telefone do responsável *</label>
                      <Padding />
                      <MaskInput
                        mask="(99) 9 9999-9999"
                        placeholder="Telefone do responsável *"
                        value={values.responsable_telephone}
                        name="responsable_telephone"
                        onChange={handleChange}
                      />
                    </div>
                    {errors.responsable_telephone &&
                    touched.responsable_telephone ? (
                      <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.responsable_telephone}
                      </div>
                    ) : null}
                    <Padding padding={props.padding} />
                    <div>
                      <label>E-mail do responsável</label>
                      <Padding />
                      <TextInput
                        placeholder="E-mail do responsável"
                        value={values.responsable_email}
                        name="responsable_email"
                        onChange={handleChange}
                      />
                    </div>
                    {errors.responsable_email && touched.responsable_email ? (
                      <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.responsable_email}
                      </div>
                    ) : null}
                    <Padding padding={props.padding} />
                  </div>
                </Row>
                {(
                  <div className="col-12">
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" }}>
                      <CheckboxComponent
                        checked={values.is_legal_responsible}
                        onChange={(e) => setFieldValue("is_legal_responsible", e.checked)}
                      />
                      <label style={{ cursor: "pointer", fontWeight: 500 }}>
                        Confirmo que sou o responsável legal deste menor de idade *
                      </label>
                    </div>
                    {errors.is_legal_responsible && touched.is_legal_responsible ? (
                      <div style={{ color: "red", marginTop: "8px" }}>
                        {errors.is_legal_responsible}
                      </div>
                    ) : null}
                  </div>
                )}
                <Padding padding={props.padding} />
                <Row id="center" className={"marginTop marginButtom"}>
                  <div className="col-12 md:col-5" style={{ maxWidth: "420px" }}>
                    <Button
                      type="submit"
                      // onClick={onButton}
                      className="t-button-primary"
                      label="Continuar para revisão"
                    // disabled={!isValid}
                    />
                  </div>
                </Row>
              </Form>
            );
          }}
        </Formik>

        <Padding padding={props.padding} />
      </Column>
    </>
  );
};

export default UnderAge;
