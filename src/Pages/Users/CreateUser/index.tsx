import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useNavigate } from "react-router-dom";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import ProfileFields from "../../../Components/ProfileFields";
import TextInput from "../../../Components/TextInput";
import PasswordInput from "../../../Components/TextPassword";
import { converterData, ROLE } from "../../../Controller/controllerGlobal";
import {
  normalizeInstitutionalEmail,
  normalizeUsername,
} from "../../../hooks/useProfileFieldRules";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { ControllerUser } from "../../../Services/Users/controller";
import { Padding } from "../../../Styles/styles";
import color from "../../../Styles/colors";
import { buildCreateUserSchema } from "./validation";

const ROLE_OPTIONS = [
  { id: ROLE.ADMIN, name: "Admin" },
  { id: ROLE.USER,  name: "Usuário" },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

const CreateUser = () => {
  const history = useNavigate();
  const { requestUserMutation }              = ControllerUser();
  const { createUserWithProfileMutation }    = ControllerProfile();

  const isLoading = requestUserMutation.isLoading || createUserWithProfileMutation.isLoading;

  return (
    <ContentPage title="Criar usuário" description="Cadastrar novo usuário no Meuben.">
      <Padding />
      <Formik
        initialValues={{
          name:                "",
          username:            "",
          password:            "",
          confirmPassword:     "",
          role:                "" as string,
          current_type:        "" as string,
          email:               "",
          phone:               "",
          birthday:            "",
          initial_date:        "",
          sex:                 undefined as number | undefined,
          color_race:          undefined as number | undefined,
          social_technologies: [] as number[],
        }}
        validate={(values) => {
          try {
            buildCreateUserSchema(
              values.role,
              values.current_type,
              values.email,
            ).validateSync(values, { abortEarly: false });
            return {};
          } catch (err: any) {
            const errors: Record<string, string> = {};
            err.inner?.forEach((e: any) => { errors[e.path] = e.message; });
            return errors;
          }
        }}
        onSubmit={(values) => {
          if (values.role === ROLE.USER && values.current_type) {
            // POST /user-bff — cria user + profile em transação
            createUserWithProfileMutation.mutate({
              name:                values.name.trim(),
              username:            normalizeUsername(values.username),
              password:            values.password,
              role:                "USER",
              current_type:        values.current_type as any,
              email:               normalizeInstitutionalEmail(values.email) || undefined,
              phone:               values.phone || undefined,
              sex:                 values.sex,
              color_race:          values.color_race,
              birthday:            values.birthday ? converterData(values.birthday) : undefined,
              initial_date:        values.initial_date ? converterData(values.initial_date) : undefined,
              project:             values.social_technologies,
            });
          } else {
            // POST /user-bff — dados de acesso + email opcional (ADMIN)
            requestUserMutation.mutate({
              name:     values.name.trim(),
              username: normalizeUsername(values.username),
              password: values.password,
              role:     values.role as any,
              ...(values.email ? { email: normalizeInstitutionalEmail(values.email) } : {}),
            } as any);
          }
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>

            {/* ── Seção 1: Acesso ───────────────────────────────────────── */}
            <div className="grid">
              <div className="col-12 md:col-6">
                <label>Nome completo *</label>
                <Padding />
                <TextInput
                  placeholder="Nome completo"
                  name="name"
                  value={values.name}
                  onChange={handleChange}
                />
                <Padding />
                {errors.name && touched.name && (
                  <div style={{ color: color.red }}>{errors.name}</div>
                )}
              </div>

              <div className="col-12 md:col-6">
                <label>Usuário *</label>
                <Padding />
                <TextInput
                  placeholder="Nome de usuário"
                  name="username"
                  value={values.username}
                  onChange={handleChange}
                />
                <Padding />
                {errors.username && touched.username && (
                  <div style={{ color: color.red }}>{errors.username}</div>
                )}
              </div>

              <div className="col-12 md:col-6">
                <label>Senha *</label>
                <Padding />
                <PasswordInput
                  placeholder="Senha (mín. 8 caracteres)"
                  name="password"
                  value={values.password}
                  onChange={handleChange}
                />
                <Padding />
                {errors.password && touched.password && (
                  <div style={{ color: color.red }}>{errors.password}</div>
                )}
              </div>

              <div className="col-12 md:col-6">
                <label>Confirmar senha *</label>
                <Padding />
                <PasswordInput
                  placeholder="Confirmar senha"
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                />
                <Padding />
                {errors.confirmPassword && touched.confirmPassword && (
                  <div style={{ color: color.red }}>{errors.confirmPassword}</div>
                )}
              </div>

              <div className="col-12 md:col-6">
                <label>Tipo de usuário *</label>
                <Padding />
                <DropdownComponent
                  name="role"
                  placerholder="Selecione o tipo"
                  optionsLabel="name"
                  optionsValue="id"
                  value={values.role}
                  onChange={(e) => {
                    handleChange(e);
                    // Limpa perfil se mudar para ADMIN
                    if (e.target.value === ROLE.ADMIN) {
                      setFieldValue("current_type", "");
                      setFieldValue("social_technologies", []);
                    }
                  }}
                  options={ROLE_OPTIONS}
                />
                <Padding />
                {errors.role && touched.role && (
                  <div style={{ color: color.red }}>{errors.role}</div>
                )}
              </div>
            </div>

            {/* ── Email para ADMIN ───────────────────────────────────────── */}
            {values.role === ROLE.ADMIN && (
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label>E-mail (opcional)</label>
                  <Padding />
                  <TextInput
                    placeholder="E-mail"
                    name="email"
                    value={values.email}
                    onChange={handleChange}
                  />
                  <Padding />
                  {errors.email && touched.email && (
                    <div style={{ color: color.red }}>{errors.email}</div>
                  )}
                </div>
              </div>
            )}

            {/* ── Seção 2: Perfil Operacional (só para USER) ─────────────── */}
            {values.role === ROLE.USER && (
              <>
                <Divider align="left">
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Perfil Operacional</span>
                </Divider>

                <ProfileFields
                  mode="full"
                  hideName
                  values={values}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                />

              </>
            )}

            <Padding padding="16px" />
            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={() => history("/users")}
              />
              <Button
                type="submit"
                label="Criar usuário"
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

export default CreateUser;
