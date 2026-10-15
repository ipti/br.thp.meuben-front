import { Form, Formik } from "formik";
import ContentPage from "../../../Components/ContentPage";
import * as Yup from "yup";

import UsersProvider, { UsersContext } from "../../../Context/Users/context";
import { Padding, Row } from "../../../Styles/styles";
import PasswordInput from "../../../Components/TextPassword";
import { Button } from "primereact/button";
import { useContext } from "react";
import { AplicationContext } from "../../../Context/Aplication/context";
import { PropsAplicationContext } from "../../../Types/types";
import { ROLE } from "../../../Controller/controllerGlobal";
import { UsersTypes } from "../../../Context/Users/type";
import { useParams } from "react-router-dom";

const ChangePassword = () => {
  return (
    <UsersProvider>
      <ChangePasswordPage />
    </UsersProvider>
  );
};


const ChangePasswordPage = () => {
  const propsAplication = useContext(
    AplicationContext
  ) as PropsAplicationContext;

  const { id } = useParams();

  const props = useContext(UsersContext) as UsersTypes;

  const CreateUserSchema = Yup.object().shape({
    password: Yup.string()
      .required("Campo Obrigatório")
      .min(8, "Senha deve ter pelo menos 8 caracteres")
      .max(60, "Senha deve ter no máximo 60 caracteres"),
    confirmPassword: Yup.string()
      .label("Confirmar senha")
      .required("Campo Obrigatório")
      .oneOf([Yup.ref("password")], "Senhas difirentes"),
  });
  return (
    <ContentPage title="Alterar senha" description="Altere a senha do usuário.">
      <Formik
        initialValues={{ password: "", confirmPassword: "" }}
        onSubmit={(values) => {
          props.ChangePassword({ password: values.password }, parseInt(id!));
        }}
        validationSchema={CreateUserSchema}
      >
        {({ values, handleChange, errors, touched }) => {
          return (
            <Form>
              <Row id="end">
                {propsAplication.user?.role === ROLE.ADMIN && (
                  <Button label="Salvar" />
                )}
              </Row>
              <Padding padding="16px" />
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label>Senha</label>
                  <Padding />
                  <PasswordInput
                    placeholder="Senha"
                    name="password"
                    onChange={handleChange}
                    value={values.password}
                  />
                  <Padding />
                  {errors.password && touched.password ? (
                    <div style={{ color: "red" }}>
                      {errors.password}
                      <Padding />
                    </div>
                  ) : null}
                </div>
                <div className="col-12 md:col-6">
                  <label>Confirmar senha</label>
                  <Padding />
                  <PasswordInput
                    placeholder="Senha"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                  />
                  <Padding />
                  {errors.confirmPassword && touched.confirmPassword ? (
                    <div style={{ color: "red" }}>
                      {errors.confirmPassword}
                      <Padding />
                    </div>
                  ) : null}
                </div>
              </div>{" "}
              <Padding padding="16px" />
            </Form>
          );
        }}
      </Formik>
    </ContentPage>
  );
};

export default ChangePassword;
