import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import ProfileFields from "../../../Components/ProfileFields";
import { converterData } from "../../../Controller/controllerGlobal";
import { normalizeInstitutionalEmail } from "../../../hooks/useProfileFieldRules";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { Padding } from "../../../Styles/styles";

const createSchema = Yup.object({
  current_type: Yup.string().required("Tipo de perfil obrigatório"),
  name: Yup.string().min(3, "Mínimo 3 caracteres").required("Nome obrigatório"),
});

const ProfileCreate = () => {
  const history = useNavigate();
  const { createProfileMutation } = ControllerProfile();

  return (
    <ContentPage title="Novo Perfil" description="Cadastrar novo perfil operacional.">
      <Padding padding="8px" />

      <Formik
        initialValues={{
          current_type: "" as any,
          name: "",
          email: "",
          phone: "",
          birthday: "",
          initial_date: "",
          sex: undefined as number | undefined,
          color_race: undefined as number | undefined,
          active: true,
          social_technologies: [] as number[],
          reason: "",
        }}
        validationSchema={createSchema}
        onSubmit={(values) => {
          createProfileMutation.mutate({
            name: values.name.trim(),
            current_type: values.current_type,
            email: normalizeInstitutionalEmail(values.email) || undefined,
            phone: values.phone || undefined,
            birthday: values.birthday ? converterData(values.birthday) : undefined,
            initial_date: values.initial_date ? converterData(values.initial_date) : undefined,
            sex: values.sex,
            color_race: values.color_race,
            active: values.active,
            social_technologies: values.social_technologies,
          });
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => (
          <Form>
            <ProfileFields
              mode="full"
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
                onClick={() => history("/perfis")}
              />
              <Button
                type="submit"
                label="Criar Perfil"
                icon="pi pi-plus"
                loading={createProfileMutation.isLoading}
              />
            </div>
          </Form>
        )}
      </Formik>
    </ContentPage>
  );
};

export default ProfileCreate;
