import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import FieldError from "../../../Components/FieldError";
import TextInput from "../../../Components/TextInput";
import PasswordInput from "../../../Components/TextPassword";
import { converterData } from "../../../Controller/controllerGlobal";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { Padding } from "../../../Styles/styles";
import ProfileInputs from "../Inputs";

const baseSchema = {
  name:         Yup.string().min(3, "Mínimo 3 caracteres").required("Nome obrigatório"),
  current_type: Yup.string()
    .oneOf(["COORDINATOR", "COORDINATION_SUPPORT", "REAPPLICATOR", "OTHER", "MONITORING", "COMMUNICATION"], "Tipo inválido")
    .required("Tipo obrigatório"),
  birthday:     Yup.string().required("Data de nascimento obrigatória"),
  sex:          Yup.number().required("Sexo obrigatório").typeError("Sexo obrigatório"),
  color_race:   Yup.number().required("Cor/raça obrigatória").typeError("Cor/raça obrigatória"),
};

const withLoginSchema = {
  username: Yup.string().min(3, "Mínimo 3 caracteres").required("Usuário obrigatório"),
  password: Yup.string().min(8, "Mínimo 8 caracteres").required("Senha obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação obrigatória"),
};

const ProfileCreate = () => {
  const history = useNavigate();
  const [searchParams] = useSearchParams();
  const [withLogin, setWithLogin] = useState(false);
  const { createProfileMutation, createUserWithProfileMutation } = ControllerProfile();

  // /perfis/criar?user_fk=42 → pré-vincula ao usuário
  const prefilledUserFk = searchParams.get("user_fk")
    ? parseInt(searchParams.get("user_fk")!, 10)
    : undefined;

  const validationSchema = Yup.object(
    withLogin ? { ...baseSchema, ...withLoginSchema } : baseSchema
  );

  const isLoading =
    createProfileMutation.isLoading || createUserWithProfileMutation.isLoading;

  return (
    <ContentPage title="Novo Perfil" description="Cadastrar novo perfil operacional.">
      <Padding padding="8px" />

      <Formik
        initialValues={{
          name:            "",
          current_type:    "",
          email:           "",
          phone:           "",
          birthday:        "",
          initial_date:    "",
          sex:             undefined as number | undefined,
          color_race:      undefined as number | undefined,
          active:              true,
          reason:              "",
          social_technologies: [] as number[],
          username:            "",
          password:        "",
          confirmPassword: "",
        }}
        validationSchema={validationSchema}
        onSubmit={(values) => {
          if (withLogin && values.username) {
            // POST /user-bff com current_type → cria usuário + perfil em transação única
            createUserWithProfileMutation.mutate({
              name:         values.name,
              username:     values.username,
              password:     values.password,
              role:         "USER",
              current_type: values.current_type as "COORDINATOR" | "COORDINATION_SUPPORT" | "REAPPLICATOR" | "OTHER" | "MONITORING" | "COMMUNICATION",
              email:        values.email || undefined,
              phone:        values.phone || undefined,
              sex:          values.sex,
              color_race:   values.color_race,
              birthday:     values.birthday ? converterData(values.birthday) : undefined,
              initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
              project:      values.social_technologies?.length ? values.social_technologies : undefined,
            });
          } else {
            // POST /profile — espera YYYY-MM-DD
            createProfileMutation.mutate({
              name:         values.name,
              current_type: values.current_type as "COORDINATOR" | "COORDINATION_SUPPORT" | "REAPPLICATOR" | "OTHER" | "MONITORING" | "COMMUNICATION",
              email:        values.email || undefined,
              phone:        values.phone || undefined,
              birthday:     values.birthday ? converterData(values.birthday) : undefined,
              initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
              sex:          values.sex,
              color_race:   values.color_race,
              active:              values.active,
              user_fk:             prefilledUserFk,
              social_technologies: values.social_technologies?.length ? values.social_technologies : undefined,
            });
          }
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            <ProfileInputs
              values={values}
              handleChange={handleChange}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />

            {/* Toggle criar login — oculto se user_fk já foi passado */}
            {!prefilledUserFk && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
                <Checkbox
                  inputId="withLogin"
                  checked={withLogin}
                  onChange={(e) => setWithLogin(e.checked ?? false)}
                />
                <label htmlFor="withLogin" style={{ cursor: "pointer" }}>
                  Criar conta de login para este perfil
                </label>
              </div>
            )}

            {withLogin && (
              <div className="grid">
                <div className="col-12 md:col-4">
                  <label>Nome de usuário *</label>
                  <Padding />
                  <TextInput
                    placeholder="usuário"
                    name="username"
                    value={values.username}
                    onChange={handleChange}
                  />
                  <Padding />
                  <FieldError message={touched.username ? errors.username as string : undefined} />
                </div>
                <div className="col-12 md:col-4">
                  <label>Senha *</label>
                  <Padding />
                  <PasswordInput
                    placeholder="Senha (mín. 8 caracteres)"
                    name="password"
                    value={values.password}
                    onChange={handleChange}
                  />
                  <Padding />
                  <FieldError message={touched.password ? errors.password as string : undefined} />
                </div>
                <div className="col-12 md:col-4">
                  <label>Confirmar senha *</label>
                  <Padding />
                  <PasswordInput
                    placeholder="Confirmar senha"
                    name="confirmPassword"
                    value={values.confirmPassword}
                    onChange={handleChange}
                  />
                  <Padding />
                  <FieldError message={touched.confirmPassword ? errors.confirmPassword as string : undefined} />
                </div>
              </div>
            )}

            <Padding padding="16px" />

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={() => history("/perfis")}
              />
              <Button
                type="submit"
                label="Criar Perfil"
                icon="pi pi-plus"
                loading={isLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </ContentPage>
  );
};

export default ProfileCreate;
