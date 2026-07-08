import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import FieldError from "../../../Components/FieldError";
import ProfileFields from "../../../Components/ProfileFields";
import TextInput from "../../../Components/TextInput";
import PasswordInput from "../../../Components/TextPassword";
import { converterData } from "../../../Controller/controllerGlobal";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { Padding } from "../../../Styles/styles";

const baseSchema = Yup.object({
  name:                Yup.string().min(3, "Mínimo 3 caracteres").required("Nome obrigatório"),
  color_race:          Yup.number().required("Cor/raça obrigatória").typeError("Cor/raça obrigatória"),
  sex:                 Yup.number().required("Gênero obrigatório").typeError("Gênero obrigatório"),
  birthday:            Yup.string().required("Data de nascimento obrigatória"),
  phone:               Yup.string().required("Telefone obrigatório"),
  social_technologies: Yup.array().min(1, "Selecione ao menos uma tecnologia social").required(),
});

const withLoginSchema = baseSchema.shape({
  username:        Yup.string().min(3, "Mínimo 3 caracteres").required("Usuário obrigatório"),
  password:        Yup.string().min(8, "Mínimo 8 caracteres").required("Senha obrigatória"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "As senhas não coincidem")
    .required("Confirmação obrigatória"),
});

const ReapplicatorCreate = () => {
  const history = useNavigate();
  const [searchParams] = useSearchParams();
  const [withLogin, setWithLogin] = useState(false);
  const { createProfileMutation, createUserWithProfileMutation } = ControllerProfile();

  const prefilledUserFk = searchParams.get("user_fk")
    ? parseInt(searchParams.get("user_fk")!, 10)
    : undefined;

  const isLoading =
    createProfileMutation.isLoading || createUserWithProfileMutation.isLoading;

  return (
    <ContentPage title="Novo Reaplicador" description="Cadastrar novo reaplicador.">
      <Padding padding="8px" />

      <Formik
        initialValues={{
          name:                "",
          email:               "",
          phone:               "",
          birthday:            "",
          initial_date:        "",
          sex:                 undefined as number | undefined,
          color_race:          undefined as number | undefined,
          active:              true,
          social_technologies: [] as number[],
          username:            "",
          password:            "",
          confirmPassword:     "",
        }}
        validationSchema={withLogin ? withLoginSchema : baseSchema}
        onSubmit={(values) => {
          if (withLogin && values.username) {
            createUserWithProfileMutation.mutate({
              name:                values.name,
              username:            values.username,
              password:            values.password,
              role:                "USER",
              current_type:        "REAPPLICATOR",
              email:               values.email || undefined,
              phone:               values.phone || undefined,
              sex:                 values.sex,
              color_race:          values.color_race,
              birthday:            values.birthday ? converterData(values.birthday) : undefined,
              initial_date:        values.initial_date ? converterData(values.initial_date) : undefined,
              project:             values.social_technologies,
            });
          } else {
            createProfileMutation.mutate({
              name:                values.name,
              current_type:        "REAPPLICATOR",
              email:               values.email || undefined,
              phone:               values.phone || undefined,
              birthday:            values.birthday ? converterData(values.birthday) : undefined,
              initial_date:        values.initial_date ? converterData(values.initial_date) : undefined,
              sex:                 values.sex,
              color_race:          values.color_race,
              active:              values.active,
              user_fk:             prefilledUserFk,
              social_technologies: values.social_technologies,
            });
          }
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            <ProfileFields
              mode="reapplicator"
              values={values}
              handleChange={handleChange}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
            />

            {!prefilledUserFk && (
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "16px 0 8px" }}>
                <Checkbox
                  inputId="withLogin"
                  checked={withLogin}
                  onChange={(e) => setWithLogin(e.checked ?? false)}
                />
                <label htmlFor="withLogin" style={{ cursor: "pointer" }}>
                  Criar conta de login para este reaplicador
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
                onClick={() => history("/reaplicadores")}
              />
              <Button
                type="submit"
                label="Criar Reaplicador"
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

export default ReapplicatorCreate;
