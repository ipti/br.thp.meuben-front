import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import Loading from "../../../Components/Loading";
import ProfileFields from "../../../Components/ProfileFields";
import { converterData, formatarData } from "../../../Controller/controllerGlobal";
import { ControllerProfile } from "../../../Services/Profile/controller";
import { useFetchProfileOne } from "../../../Services/Profile/query";
import { Padding } from "../../../Styles/styles";

const editSchema = Yup.object({
  name:                Yup.string().min(3, "Mínimo 3 caracteres").required("Nome obrigatório"),
  color_race:          Yup.number().required("Cor/raça obrigatória").typeError("Cor/raça obrigatória"),
  sex:                 Yup.number().required("Gênero obrigatório").typeError("Gênero obrigatório"),
  birthday:            Yup.string().required("Data de nascimento obrigatória"),
  phone:               Yup.string().required("Telefone obrigatório"),
  social_technologies: Yup.array().min(1, "Selecione ao menos uma tecnologia social").required(),
});

const ReapplicatorEdit = () => {
  const { id } = useParams<{ id: string }>();
  const history = useNavigate();
  const numId = parseInt(id!, 10);

  const { data: profile, isLoading } = useFetchProfileOne(numId);
  const { updateProfileMutation } = ControllerProfile();

  if (isLoading) return <Loading />;

  if (!profile) {
    return (
      <ContentPage title="Editar Reaplicador" description="Reaplicador não encontrado.">
        <Padding padding="16px" />
        <p>Reaplicador não encontrado.</p>
      </ContentPage>
    );
  }

  return (
    <ContentPage
      title={`Editar: ${profile.name}`}
      description="Atualizar dados do reaplicador."
    >
      <Padding padding="8px" />

      <Formik
        initialValues={{
          name:                profile.name,
          email:               profile.email ?? "",
          phone:               profile.phone ?? "",
          birthday:            profile.birthday ? formatarData(profile.birthday) : "",
          initial_date:        profile.initial_date ? formatarData(profile.initial_date) : "",
          sex:                 profile.sex,
          color_race:          profile.color_race,
          active:              profile.active,
          social_technologies: profile.profile_social_technology?.map((s: any) => s.social_technology_fk) ?? [],
        }}
        validationSchema={editSchema}
        onSubmit={(values) => {
          updateProfileMutation.mutate({
            id: numId,
            data: {
              name:                values.name,
              current_type:        "REAPPLICATOR",
              email:               values.email || undefined,
              phone:               values.phone || undefined,
              birthday:            values.birthday ? converterData(values.birthday) : undefined,
              initial_date:        values.initial_date ? converterData(values.initial_date) : undefined,
              sex:                 values.sex,
              color_race:          values.color_race,
              active:              values.active,
              social_technologies: values.social_technologies,
            },
          });
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

            <Padding padding="16px" />

            <div style={{ display: "flex", gap: 8 }}>
              <Button
                type="button"
                label="Cancelar"
                severity="secondary"
                outlined
                onClick={() => history("/reaplicadores/" + id)}
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

export default ReapplicatorEdit;
