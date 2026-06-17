import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import styled from "styled-components";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import { AplicationContext } from "../../../Context/Aplication/context";
import UsersProvider, { UsersContext } from "../../../Context/Users/context";
import { UsersTypes } from "../../../Context/Users/type";
import { Tag } from "primereact/tag";
import { useNavigate } from "react-router-dom";
import { formatarData, ROLE, profileTypeLabel } from "../../../Controller/controllerGlobal";
import { usePermissions } from "../../../hooks/usePermissions";
import queryClient from "../../../Services/reactquery";
import { useFetchRequestUsersOne } from "../../../Services/Users/query";
import color from "../../../Styles/colors";
import { Padding, Row } from "../../../Styles/styles";
import typography from "../../../Styles/typography";
import { PropsAplicationContext } from "../../../Types/types";
import InputsUser from "../Inputs";

const buildEditUserSchema = (isSocialRole: boolean, isAdminRole: boolean) =>
  Yup.object().shape({
    name: Yup.string()
      .required("Campo Obrigatório")
      .min(8, "Nome deve ter pelo menos 8 caracteres"),
    username: Yup.string()
      .required("Campo Obrigatório")
      .min(8, "Nome do usuário deve ter pelo menos 8 caracteres"),
    role: Yup.string().required("Campo Obrigatório"),
    initial_date: isSocialRole
      ? Yup.string().required("Campo Obrigatório")
      : Yup.string(),
    birthday: isSocialRole
      ? Yup.string().required("Campo Obrigatório")
      : Yup.string(),
    phone: Yup.string().required("Campo Obrigatório"),
    email: Yup.string().required("Campo Obrigatório"),
    sex: isSocialRole
      ? Yup.string().required("Campo Obrigatório")
      : Yup.string(),
    color_race: isSocialRole
      ? Yup.string().required("Campo Obrigatório")
      : Yup.string(),
  });

const EditUser = () => {
  return (
    <UsersProvider>
      <EditUserPage />
    </UsersProvider>
  );
};

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
    :hover {
      text-decoration: underline;
    }
  }
`;

const EditUserPage = () => {
  const props = useContext(UsersContext) as UsersTypes;
  const propsAplication = useContext(
    AplicationContext
  ) as PropsAplicationContext;
  const history = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (loading) {
      queryClient.removeQueries("useRequestsUsersOne");
      setLoading(false);
    }
  }, [loading]);

  const { id } = useParams();

  const { data: project } = useFetchRequestUsersOne(parseInt(id!));

  const profile = project?.profile ?? null;

  const isSocialRole = !!project?.profile;

  const isAdminRole = project?.role === ROLE.ADMIN;
  const { isAdmin } = usePermissions();

  const CreateUserSchema = buildEditUserSchema(isSocialRole, isAdminRole);

  return (
    <ContentPage title="Editar usuário" description="Faça a edição do usuário.">
      <Padding />

      {/* Seção de perfil operacional vinculado */}
      <div style={{
        marginBottom: 20,
        border: `1px solid ${color.colorBorderCard}`,
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {/* Cabeçalho da seção */}
        <div style={{
          background: color.colorCard,
          borderBottom: `1px solid ${color.colorBorderCard}`,
          padding: "10px 16px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <i className="pi pi-id-card" style={{ color: color.colorsBaseInkLight, fontSize: 13 }} />
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.7px",
            textTransform: "uppercase",
            color: color.colorsBaseInkLight,
          }}>
            Perfil Operacional
          </span>
        </div>

        {/* Conteúdo */}
        <div style={{ padding: "14px 16px", background: "#fff" }}>
          {profile ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: color.colorsBaseInkNormal }}>
                  {profile.name}
                </div>
                <Tag
                  value={profileTypeLabel[profile.current_type] ?? profile.current_type}
                  severity={profile.current_type === "COORDINATOR" || profile.current_type === "COORDINATION_SUPPORT" ? "info" : "warning"}
                  style={{ marginTop: 4, fontSize: 11 }}
                />
              </div>
              <Button
                label="Ver perfil"
                icon="pi pi-external-link"
                size="small"
                outlined
                onClick={() => history("/perfis/" + profile.id)}
              />
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
              <span style={{ fontSize: 14, color: color.colorsBaseInkLight }}>
                Sem perfil operacional vinculado
              </span>
              <Button
                label="Criar perfil"
                icon="pi pi-plus"
                size="small"
                outlined
                severity="secondary"
                onClick={() => history("/perfis/criar?user_fk=" + id)}
              />
            </div>
          )}
        </div>
      </div>

      {project ? (
        <Formik
          initialValues={{
            name: project?.name ?? "",
            username: project?.username ?? "",
            role: project?.role ?? "",
            initial_date: profile?.initial_date
              ? formatarData(profile.initial_date)
              : "",
            phone: profile?.phone ?? "",
            email: profile?.email ?? "",
            color_race: profile?.color_race ?? "",
            sex: profile?.sex ?? "",
            birthday: profile?.birthday
              ? formatarData(profile.birthday)
              : "",
          }}
          onSubmit={(values) => {
            props.UpdateUser(values, parseInt(id!));
          }}
          validationSchema={CreateUserSchema}
        >
          {({ values, handleChange, errors, touched }) => {
            return (
              <Form>
                <Row
                  id={isAdmin ? "space-between" : "end"}
                >
                  {isAdmin && (
                    <LinkSenha>
                      <Link to={"/users/senha/" + id} className="link">
                        <LinkSenha>Alterar senha</LinkSenha>
                      </Link>
                    </LinkSenha>
                  )}
                  <Button
                    label="Salvar"
                    type="submit"
                    icon="pi pi-save"
                    onClick={() => setSubmitted(true)}
                  />
                </Row>
                <Padding padding="16px" />
                <InputsUser
                  errors={submitted ? errors : {}}
                  handleChange={handleChange}
                  touched={touched}
                  values={values}
                  basicOnly={!isSocialRole}
                />
              </Form>
            );
          }}
        </Formik>
      ) : null}
    </ContentPage>
  );
};

export default EditUser;
