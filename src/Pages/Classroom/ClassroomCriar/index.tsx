import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import * as Yup from "yup";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import FieldError from "../../../Components/FieldError";
import Loading from "../../../Components/Loading";
import TextInput from "../../../Components/TextInput";
import ClassroomProvider, { ClassroomContext } from "../../../Context/Classroom/context";
import { ClassroomTypes } from "../../../Context/Classroom/type";
import { useFetchRequestCity, useFetchRequestState } from "../../../Services/Address/query";
import { getYear } from "../../../Services/localstorage";
import color from "../../../Styles/colors";
import { Column, Padding, Row } from "../../../Styles/styles";

const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório"),
});

const initialValues = {
    name: "",
    state_fk: undefined as number | undefined,
    city_fk: undefined as number | undefined,
    neighborhood: "",
};

const ErrorSummary = ({ errors }: { errors: string[] }) => {
    if (errors.length === 0) return null;

    return (
        <div
            style={{
                background: color.colorCardRed,
                border: `1px solid ${color.red}`,
                borderRadius: "8px",
                padding: "16px 20px",
                marginBottom: "16px",
            }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <i className="pi pi-exclamation-circle" style={{ color: color.red, fontSize: "18px" }} />
                <strong style={{ color: color.red, fontSize: "15px" }}>
                    Corrija os seguintes erros antes de continuar:
                </strong>
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px" }}>
                {errors.map((error, index) => (
                    <li key={index} style={{ color: color.red, marginBottom: "4px", fontSize: "14px" }}>
                        {error}
                    </li>
                ))}
            </ul>
        </div>
    );
};

const FormClassroom = () => (
    <ClassroomProvider>
        <FormClassroomPage />
    </ClassroomProvider>
);

const FormClassroomPage = () => {
    const { id } = useParams();
    const history = useNavigate();
    const [selectedState, setSelectedState] = useState<number | undefined>();
    const [submitted, setSubmitted] = useState(false);

    const { data: states } = useFetchRequestState();
    const { data: cities } = useFetchRequestCity(selectedState);
    const props = useContext(ClassroomContext) as ClassroomTypes;

    if (props.isLoading) return <Loading />;

    if (!id || id === "undefined") {
        return (
            <ContentPage title="Criar turma" description="Crie uma nova turma.">
                <Padding padding="16px" />
                <Column id="center" style={{ gap: "16px", alignItems: "center", textAlign: "center", padding: "32px" }}>
                    <i className="pi pi-exclamation-triangle" style={{ fontSize: "48px", color: color.colorCardOrange }} />
                    <h3>Nenhum plano de trabalho selecionado</h3>
                    <p style={{ color: color.colorsBaseInkLight }}>
                        Para criar uma turma, você precisa primeiro criar um <strong>Plano de Trabalho</strong> no ano vigente.
                    </p>
                    <Padding padding="8px" />
                    <Button label="Ir para turmas" icon="pi pi-arrow-left" onClick={() => history("/turma")} />
                </Column>
            </ContentPage>
        );
    }

    return (
        <ContentPage title="Criar turma" description="Crie uma nova turma.">
            <Padding padding="16px" />
            <Formik
                initialValues={initialValues}
                validationSchema={schema}
                onSubmit={(values) => {
                    props.CreateClassroom({ ...values, project: parseInt(id), year: parseInt(getYear() as string) });
                }}
            >
                {({ values, errors, handleChange, setFieldValue }) => {
                    const fieldError = (field: string) =>
                        submitted ? (errors as Record<string, string>)[field] : undefined;
                    const errorArray = submitted
                        ? (Object.values(errors).filter(Boolean) as string[])
                        : [];

                    return (
                        <Form>
                            <ErrorSummary errors={errorArray} />

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <label>Nome *</label>
                                    <Padding />
                                    <TextInput name="name" onChange={handleChange} placeholder="Nome" value={values.name} />
                                    <FieldError message={fieldError("name")} />
                                </div>
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <label>Estado</label>
                                    <Padding />
                                    <DropdownComponent
                                        value={values.state_fk}
                                        name="state_fk"
                                        placerholder="Selecione o estado"
                                        options={states ?? []}
                                        optionsLabel="name"
                                        optionsValue="id"
                                        onChange={(e) => {
                                            handleChange(e);
                                            setSelectedState(e.target.value);
                                            setFieldValue("city_fk", undefined);
                                        }}
                                    />
                                </div>
                                <div className="col-12 md:col-6">
                                    <label>Cidade</label>
                                    <Padding />
                                    <DropdownComponent
                                        value={values.city_fk}
                                        name="city_fk"
                                        placerholder="Selecione a cidade"
                                        options={cities ?? []}
                                        optionsLabel="name"
                                        optionsValue="id"
                                        onChange={handleChange}
                                    />
                                </div>
                            </div>

                            <div className="grid">
                                <div className="col-12 md:col-6">
                                    <label>Bairro/Povoado</label>
                                    <Padding />
                                    <TextInput
                                        name="neighborhood"
                                        onChange={handleChange}
                                        placeholder="Bairro/Povoado"
                                        value={values.neighborhood}
                                    />
                                </div>
                            </div>

                            <Padding padding="16px" />
                            <Column>
                                <Row id="end">
                                    <Button
                                        label="Criar"
                                        type="submit"
                                        icon="pi pi-plus"
                                        loading={props.isLoading}
                                        onClick={() => setSubmitted(true)}
                                    />
                                </Row>
                            </Column>
                        </Form>
                    );
                }}
            </Formik>
        </ContentPage>
    );
};

export default FormClassroom;
