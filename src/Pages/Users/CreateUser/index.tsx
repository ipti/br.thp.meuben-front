import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import FieldError from "../../../Components/FieldError";
import ProfileFields from "../../../Components/ProfileFields";
import TextInput from "../../../Components/TextInput";
import PasswordInput from "../../../Components/TextPassword";
import { converterData, ROLE } from "../../../Controller/controllerGlobal";
import { isSocialProfile } from "../../../hooks/useProfileFieldRules";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { ControllerUser } from "../../../Services/Users/controller";
import { Padding } from "../../../Styles/styles";
import color from "../../../Styles/colors";

const ROLE_OPTIONS = [
  { id: ROLE.ADMIN, name: "Admin" },
  { id: ROLE.USER,  name: "Usuário" },
];

// Schema base — campos de acesso sempre obrigatórios
const accessSchema = {
  name:            Yup.string().required("Nome é obrigatório").min(3, "Mínimo 3 caracteres"),
  username:        Yup.string().required("Usuário é obrigatório").min(5, "Mínimo 5 caracteres"),
  password:        Yup.string().required("Senha é obrigatória").min(8, "Mínimo 8 caracteres"),
  confirmPassword: Yup.string()
    .required("Confirmação é obrigatória")
    .oneOf([Yup.ref("password")], "As senhas não coincidem"),
  role:            Yup.string().required("Tipo de usuário é obrigatório"),
};

// Campos de perfil — obrigatórios quando role=USER
const profileBaseSchema = {
  current_type:        Yup.string().required("Tipo de perfil é obrigatório"),
  social_technologies: Yup.array().min(1, "Selecione ao menos uma tecnologia social"),
};

// Campos extras obrigatórios para REAPPLICATOR
const reapplicatorSchema = {
  color_race: Yup.number().required("Cor/Raça é obrigatória").typeError("Cor/Raça é obrigatória"),
  sex:        Yup.number().required("Gênero é obrigatório").typeError("Gênero é obrigatório"),
  birthday:   Yup.string().required("Data de nascimento é obrigatória"),
  phone:      Yup.string().required("Telefone é obrigatório"),
};

// Campo extra obrigatório para demais tipos
const otherProfileSchema = {
  email: Yup.string().email("E-mail inválido").required("E-mail é obrigatório"),
};

const buildSchema = (role: string, currentType: string) => {
  if (role !== ROLE.USER) return Yup.object(accessSchema);
  const profileFields = isSocialProfile(currentType as any)
    ? { ...profileBaseSchema, ...reapplicatorSchema }
    : { ...profileBaseSchema, ...otherProfileSchema };
  return Yup.object({ ...accessSchema, ...profileFields });
};

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
            buildSchema(values.role, values.current_type).validateSync(values, { abortEarly: false });
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
              name:                values.name,
              username:            values.username,
              password:            values.password,
              role:                "USER",
              current_type:        values.current_type as any,
              email:               values.email || undefined,
              phone:               values.phone || undefined,
              sex:                 values.sex,
              color_race:          values.color_race,
              birthday:            values.birthday ? converterData(values.birthday) : undefined,
              initial_date:        values.initial_date ? converterData(values.initial_date) : undefined,
              project:             values.social_technologies,
            });
          } else {
            // POST /user-bff — só dados de acesso (ADMIN ou USER sem perfil)
            requestUserMutation.mutate({
              name:     values.name,
              username: values.username,
              password: values.password,
              role:     values.role as any,
            });
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

                {errors.current_type && touched.current_type && (
                  <FieldError message={errors.current_type as string} />
                )}
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
