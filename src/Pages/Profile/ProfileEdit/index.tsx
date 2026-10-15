import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import ProfileFields from "../../../Components/ProfileFields";
import { converterData, formatarData, ProfileType } from "../../../Controller/controllerGlobal";
import { normalizeInstitutionalEmail } from "../../../hooks/useProfileFieldRules";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { useFetchProfileOne } from "../../../Services/Profile/query";
import { Padding } from "../../../Styles/styles";

const editSchema = Yup.object({
  current_type: Yup.string().required("Tipo de perfil obrigatório"),
  name: Yup.string().min(3, "Mínimo 3 caracteres").required("Nome obrigatório"),
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

  const originalType = profile.current_type as ProfileType;

  return (
    <ContentPage
      title={`Editar: ${profile.name}`}
      description="Atualizar dados do perfil operacional."
    >
      <Padding padding="8px" />

      <Formik
        initialValues={{
          current_type: profile.current_type,
          name: profile.name,
          email: profile.user?.email ?? "",
          phone: profile.phone ?? "",
          birthday: profile.birthday ? formatarData(profile.birthday) : "",
          initial_date: profile.initial_date ? formatarData(profile.initial_date) : "",
          sex: profile.sex,
          color_race: profile.color_race,
          active: profile.active,
          social_technologies: profile.profile_social_technology?.map((s: any) => s.social_technology_fk) ?? [],
          reason: "",
        }}
        validationSchema={editSchema}
        onSubmit={(values) => {
          const typeChanged = values.current_type !== originalType;
          updateProfileMutation.mutate({
            id: numId,
            data: {
              name: values.name,
              current_type: values.current_type as ProfileType,
              email: normalizeInstitutionalEmail(values.email) || undefined,
              phone: values.phone || undefined,
              birthday: values.birthday ? converterData(values.birthday) : undefined,
              initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
              sex: values.sex,
              color_race: values.color_race,
              active: values.active,
              social_technologies: values.social_technologies,
              reason: typeChanged && values.reason ? values.reason : undefined,
            },
          });
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            <ProfileFields
              mode="full"
              isEditing
              originalType={originalType}
              values={values}
              handleChange={handleChange}
              setFieldValue={setFieldValue}
              errors={errors}
              touched={touched}
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
