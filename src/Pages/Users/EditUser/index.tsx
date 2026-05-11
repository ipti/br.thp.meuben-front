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
import { formatarData, ROLE } from "../../../Controller/controllerGlobal";
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
    project: isAdminRole
      ? Yup.array()
      : Yup.array()
          .min(1, "Selecione pelo menos uma tecnologia")
          .required("Campo Obrigatório"),
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

  const profile =
    project?.role === ROLE.REAPPLICATORS
      ? project?.reapplicators?.[0]
      : project?.role === ROLE.COORDINATORS
      ? project?.coordinators?.[0]
      : null;

  const isSocialRole =
    project?.role === ROLE.REAPPLICATORS || project?.role === ROLE.COORDINATORS;

  const isAdminRole = project?.role === ROLE.ADMIN;

  const CreateUserSchema = buildEditUserSchema(isSocialRole, isAdminRole);

  const selectTs = (data: any) => {
    const array: any = [];
    data.forEach((element: any) => {
      array.push(element.usersocialtechnology);
    });
    return array;
  };

  return (
    <ContentPage title="Editar usuário" description="Faça a edição do usuário.">
      <Padding />
      {project ? (
        <Formik
          initialValues={{
            name: project?.name ?? "",
            username: project?.username ?? "",
            role: project?.role ?? "",
            project: selectTs(project.user_social_technology),
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
                  id={
                    propsAplication.user?.role === ROLE.ADMIN
                      ? "space-between"
                      : "end"
                  }
                >
                  {propsAplication.user?.role === ROLE.ADMIN && (
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
