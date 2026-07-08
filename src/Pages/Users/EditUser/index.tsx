import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import Loading from "../../../Components/Loading";
import ProfileFields from "../../../Components/ProfileFields";
import TextInput from "../../../Components/TextInput";
import {
  converterData,
  formatarData,
  PROFILE_TYPE,
  profileTypeLabel,
  ROLE,
} from "../../../Controller/controllerGlobal";
import { isSocialProfile } from "../../../hooks/useProfileFieldRules";
import { usePermissions } from "../../../hooks/usePermissions";
import { useFetchProfileOne } from "../../../Services/Profile/query";
import { ControllerUser } from "../../../Services/Users/controller";
import { useFetchRequestUsersOne } from "../../../Services/Users/query";
import color from "../../../Styles/colors";
import { Padding, Row } from "../../../Styles/styles";
import typography from "../../../Styles/typography";

// ─── Styles ───────────────────────────────────────────────────────────────────

const LinkSenha = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  .link {
    text-decoration: none;
    font-size: 16px;
    font-weight: 600;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    font-family: ${typography.types.inter};
    color: ${color.colorsBaseProductNormal};
    :hover { text-decoration: underline; }
  }
`;

// ─── Validação dinâmica ───────────────────────────────────────────────────────

const accessSchema = {
  name:     Yup.string().required("Nome é obrigatório").min(3, "Mínimo 3 caracteres"),
  username: Yup.string().required("Usuário é obrigatório").min(5, "Mínimo 5 caracteres"),
  role:     Yup.string().required("Tipo de usuário é obrigatório"),
};

const profileBaseSchema = {
  current_type:        Yup.string().required("Tipo de perfil é obrigatório"),
  social_technologies: Yup.array().min(1, "Selecione ao menos uma tecnologia social"),
};

const reapplicatorSchema = {
  color_race: Yup.number().required("Cor/Raça é obrigatória").typeError("Cor/Raça é obrigatória"),
  sex:        Yup.number().required("Gênero é obrigatório").typeError("Gênero é obrigatório"),
  birthday:   Yup.string().required("Data de nascimento é obrigatória"),
  phone:      Yup.string().required("Telefone é obrigatório"),
};

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

const ROLE_OPTIONS = [
  { id: ROLE.ADMIN, name: "Admin" },
  { id: ROLE.USER,  name: "Usuário" },
];

// ─── Component ────────────────────────────────────────────────────────────────

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const history = useNavigate();
  const numId = parseInt(id!, 10);

  const { data: user, isLoading: loadingUser } = useFetchRequestUsersOne(numId);
  const profileId = user?.profile?.id;
  const { data: fullProfile, isLoading: loadingProfile } = useFetchProfileOne(profileId!);
  const { requestUpdateUserMutation } = ControllerUser();
  const { isAdmin } = usePermissions();

  const isLoading = loadingUser || (!!profileId && loadingProfile);

  if (isLoading) return <Loading />;
  if (!user) {
    return (
      <ContentPage title="Editar usuário" description="">
        <Padding padding="16px" />
        <p>Usuário não encontrado.</p>
      </ContentPage>
    );
  }

  const profile      = fullProfile ?? null;
  const originalType = profile?.current_type as typeof PROFILE_TYPE[keyof typeof PROFILE_TYPE] | undefined;

  return (
    <ContentPage title="Editar usuário" description="Faça a edição do usuário.">
      <Padding />

      <Formik
        initialValues={{
          name:                user.name ?? "",
          username:            user.username ?? "",
          role:                user.role ?? "",
          current_type:        profile?.current_type ?? "",
          email:               profile?.email ?? "",
          phone:               profile?.phone ?? "",
          birthday:            profile?.birthday ? formatarData(profile.birthday) : "",
          initial_date:        profile?.initial_date ? formatarData(profile.initial_date) : "",
          sex:                 profile?.sex as number | undefined,
          color_race:          profile?.color_race as number | undefined,
          active:              user.active ?? true,
          reason:              "",
          social_technologies: profile?.profile_social_technology?.map((s: any) => s.social_technology_fk) ?? [],
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
          const body: Record<string, any> = {
            name:     values.name,
            username: values.username,
            role:     values.role,
            active:   values.active,
          };

          if (values.role === ROLE.USER && values.current_type) {
            body.current_type  = values.current_type;
            body.email         = values.email || undefined;
            body.phone         = values.phone || undefined;
            body.sex           = values.sex;
            body.color_race    = values.color_race;
            body.birthday      = values.birthday ? converterData(values.birthday) : undefined;
            body.initial_date  = values.initial_date ? converterData(values.initial_date) : undefined;
            body.reason        = values.reason || undefined;
            body.project       = values.social_technologies;
          }

          requestUpdateUserMutation.mutate({ data: body as any, id: numId });
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            {/* ── Cabeçalho de ações ─────────────────────────────────── */}
            <Row id={isAdmin ? "space-between" : "end"}>
              {isAdmin && (
                <LinkSenha>
                  <Link to={"/users/senha/" + id} className="link">
                    Alterar senha
                  </Link>
                </LinkSenha>
              )}
              <div style={{ display: "flex", gap: 8 }}>
                <Button
                  type="button"
                  label="Cancelar"
                  severity="secondary"
                  outlined
                  onClick={() => history("/users")}
                />
                <Button
                  label="Salvar"
                  type="submit"
                  icon="pi pi-save"
                  loading={requestUpdateUserMutation.isLoading}
                />
              </div>
            </Row>

            <Padding padding="16px" />

            {/* ── Seção 1: Acesso ─────────────────────────────────────── */}
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
                  <div style={{ color: color.red }}>{errors.name as string}</div>
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
                  <div style={{ color: color.red }}>{errors.username as string}</div>
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
                    if (e.target.value === ROLE.ADMIN) {
                      setFieldValue("current_type", "");
                      setFieldValue("social_technologies", []);
                    }
                  }}
                  options={ROLE_OPTIONS}
                />
                <Padding />
                {errors.role && touched.role && (
                  <div style={{ color: color.red }}>{errors.role as string}</div>
                )}
              </div>
            </div>

            {/* ── Seção 2: Perfil Operacional (só para USER) ─────────── */}
            {values.role === ROLE.USER && (
              <>
                <Divider align="left">
                  <span style={{ fontWeight: 600, fontSize: 14 }}>Perfil Operacional</span>
                </Divider>

                {!profile && (
                  <div style={{ marginBottom: 12, padding: "8px 12px", background: "#fef9c3", borderRadius: 8, fontSize: 13 }}>
                    Nenhum perfil vinculado — preencha os campos abaixo para criar um.
                  </div>
                )}

                <ProfileFields
                  mode="full"
                  hideName
                  values={values}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                  errors={errors}
                  touched={touched}
                  isEditing={!!profile}
                  originalType={originalType}
                />
              </>
            )}
          </Form>
        )}
      </Formik>
    </ContentPage>
  );
};

export default EditUser;
