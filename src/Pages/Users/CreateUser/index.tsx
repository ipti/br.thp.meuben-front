import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import FieldError from "../../../Components/FieldError";
import PasswordInput from "../../../Components/TextPassword";
import UsersProvider, { UsersContext } from "../../../Context/Users/context";
import { UsersTypes } from "../../../Context/Users/type";
import { ROLE } from "../../../Controller/controllerGlobal";
import { Padding } from "../../../Styles/styles";
import InputsUser from "../Inputs";

// ─── Schema ──────────────────────────────────────────────────────────────────
const CreateUserSchema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório").min(8, "Nome deve ter pelo menos 8 caracteres"),
  username: Yup.string().required("Usuário é obrigatório").min(8, "Nome do usuário deve ter pelo menos 8 caracteres"),
  password: Yup.string().required("Senha é obrigatória").min(8, "Senha deve ter pelo menos 8 caracteres"),
  role: Yup.string().required("Tipo de usuário é obrigatório"),
  project: Yup.array().when("role", {
    is: ROLE.ADMIN,
    then: (schema) => schema,
    otherwise: (schema) =>
      schema
        .min(1, "Selecione pelo menos uma tecnologia")
        .required("Tecnologia é obrigatória"),
  }),
  confirmPassword: Yup.string()
    .label("Confirmar senha")
    .required("Confirmação é obrigatória")
    .oneOf([Yup.ref("password")], "As senhas não coincidem"),
});

// ─── Page wrapper ─────────────────────────────────────────────────────────────
const CreateUser = () => (
  <UsersProvider>
    <CreateUserPage />
  </UsersProvider>
);

// ─── Form ─────────────────────────────────────────────────────────────────────
const CreateUserPage = () => {
  const props = useContext(UsersContext) as UsersTypes;
  const [submitted, setSubmitted] = useState(false);

  return (
    <ContentPage title="Criar usuários" description="Criar usuário no meuBen.">
      <Padding />
      <Formik
        initialValues={{
          name: "",
          username: "",
          role: undefined,
          password: "",
          project: [],
          confirmPassword: "",
        }}
        onSubmit={(values) => {
          props.CreateUser(values);
        }}
        validationSchema={CreateUserSchema}
      >
        {({ values, handleChange, errors, touched }) => {
          const fieldError = (field: string) =>
            submitted ? (errors as any)[field] : undefined;

          return (
            <Form>
              <InputsUser
                errors={errors}
                handleChange={handleChange}
                touched={touched}
                values={values}
                basicOnly
              />
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
                  <FieldError message={fieldError("password")} />
                </div>
                <div className="col-12 md:col-6">
                  <label>Confirmar senha</label>
                  <Padding />
                  <PasswordInput
                    placeholder="Confirmar senha"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                  />
                  <FieldError message={fieldError("confirmPassword")} />
                </div>
              </div>
              <Padding padding="16px" />
              <Button
                label="Criar"
                type="submit"
                icon="pi pi-plus"
                onClick={() => setSubmitted(true)}
              />
            </Form>
          );
        }}
      </Formik>
    </ContentPage>
  );
};

export default CreateUser;
