import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import { converterData, formatarData } from "../../../Controller/controllerGlobal";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { useFetchProfileOne } from "../../../Services/Profile/query";
import { Padding } from "../../../Styles/styles";
import ProfileInputs from "../Inputs";

const editSchema = Yup.object({
  name:         Yup.string().min(3, "Mínimo 3 caracteres").required("Nome obrigatório"),
  current_type: Yup.string()
    .oneOf(["COORDINATOR", "COORDINATION_SUPPORT", "REAPPLICATOR", "OTHER", "MONITORING", "COMMUNICATION"], "Tipo inválido")
    .required("Tipo obrigatório"),
  birthday:     Yup.string().required("Data de nascimento obrigatória"),
  sex:          Yup.number().required("Sexo obrigatório").typeError("Sexo obrigatório"),
  color_race:   Yup.number().required("Cor/raça obrigatória").typeError("Cor/raça obrigatória"),
});

const ProfileEdit = () => {
  const { id } = useParams<{ id: string }>();
  const history = useNavigate();
  const numId = parseInt(id!, 10);

  const { data: profile, isLoading } = useFetchProfileOne(numId);
  const { updateProfileMutation } = ControllerProfile();

  if (isLoading) return <Loading />;

  if (!profile) {
    return (
      <ContentPage title="Editar Perfil" description="Perfil não encontrado.">
        <Padding padding="16px" />
        <p>Perfil não encontrado.</p>
      </ContentPage>
    );
  }

  return (
    <ContentPage
      title={`Editar: ${profile.name}`}
      description="Atualizar dados do perfil."
    >
      <Padding padding="8px" />

      <Formik
        initialValues={{
          name:         profile.name,
          current_type: profile.current_type,
          email:        profile.email ?? "",
          phone:        profile.phone ?? "",
          birthday:     profile.birthday ? formatarData(profile.birthday) : "",
          initial_date: profile.initial_date ? formatarData(profile.initial_date) : "",
          sex:          profile.sex,
          color_race:   profile.color_race,
          active:              profile.active,
          reason:              "",
          social_technologies: profile.profile_social_technology?.map((s: any) => s.social_technology_fk) ?? [],
        }}
        validationSchema={editSchema}
        onSubmit={(values) => {
          updateProfileMutation.mutate({
            id: numId,
            data: {
              name:         values.name,
              current_type: values.current_type as "COORDINATOR" | "COORDINATION_SUPPORT" | "REAPPLICATOR" | "OTHER" | "MONITORING" | "COMMUNICATION",
              email:        values.email || undefined,
              phone:        values.phone || undefined,
              birthday:     values.birthday ? converterData(values.birthday) : undefined,
              initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
              sex:          values.sex,
              color_race:   values.color_race,
              active:              values.active,
              reason:              values.reason || undefined,
              social_technologies: values.social_technologies,
            },
          });
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
              isEditing
              originalType={profile.current_type}
            />

            <Padding padding="16px" />

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={() => history("/perfis/" + id)}
              />
              <Button
                type="submit"
                label="Salvar"
                icon="pi pi-check"
                loading={updateProfileMutation.isLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </ContentPage>
  );
};

export default ProfileEdit;
