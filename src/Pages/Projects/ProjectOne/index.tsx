import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { ConfirmDialog } from "primereact/confirmdialog";
import { useContext, useState } from "react";
import { useParams } from "react-router-dom";
import * as Yup from "yup";
import CalendarComponent from "../../../Components/Calendar";
import CardClassroom from "../../../Components/Card/CardClassroom";
import CardQuant from "../../../Components/Chart/CardQuant";
import ContentPage from "../../../Components/ContentPage";
import Empty from "../../../Components/Empty";
import ErrorSummary from "../../../Components/ErrorSummary";
import FieldError from "../../../Components/FieldError";
import InputNumberComponent from "../../../Components/InputNumber";
import Loading from "../../../Components/Loading";
import TextInput from "../../../Components/TextInput";
import { AplicationContext } from "../../../Context/Aplication/context";
import ClassroomProvider from "../../../Context/Classroom/context";
import ProjectOneProvider, {
  ProjectOneContext,
} from "../../../Context/Project/ProjectOne/context";
import { ProjectOneTypes } from "../../../Context/Project/ProjectOne/type";
import { ROLE } from "../../../Controller/controllerGlobal";
import { usePermissions } from "../../../hooks/usePermissions";
import { Column, Padding, Row } from "../../../Styles/styles";
import { PropsAplicationContext } from "../../../Types/types";

const schemaProjectEdit = Yup.object().shape({
  name: Yup.string().required("Nome do plano de trabalho é obrigatório"),
  approval_percentage: Yup.number()
    .typeError("Parâmetro para aprovação é obrigatório")
    .required("Parâmetro para aprovação é obrigatório"),
});

const ProjectOne = () => {
  return (
    <ProjectOneProvider>
      <ClassroomProvider>
        <ProjectOnePage />
      </ClassroomProvider>
    </ProjectOneProvider>
  );
};

const ProjectOnePage = () => {
  const propsAplication = useContext(
    AplicationContext
  ) as PropsAplicationContext;
  const { can } = usePermissions();
  const [edit, setEdit] = useState(false);
  const [submittedEdit, setSubmittedEdit] = useState(false);

  const [visible, setVisible] = useState(false);

  const { id } = useParams();

  const props = useContext(ProjectOneContext) as ProjectOneTypes;

  const initialValues = {
    name: props.project?.project.name,
    approval_percentage: props.project?.project?.approval_percentage,
    date_initial: props.project?.project.date_initial ? new Date(props.project.project.date_initial) : undefined as Date | undefined,
    date_final: props.project?.project.date_final ? new Date(props.project.project.date_final) : undefined as Date | undefined,
    file: undefined,
  };

  if (props.isLoading) return <Loading />;

  return (
    <ContentPage title={props.project?.project.name!} description="Detalhes do seu plano de trabalho">
      {edit ? (
        <Formik
          initialValues={initialValues}
          validationSchema={schemaProjectEdit}
          onSubmit={(values) => {
            props.updateProject(
              {
                approval_percentage: values.approval_percentage!,
                name: values.name!,
                date_initial: values.date_initial?.toISOString(),
                date_final: values.date_final?.toISOString(),
              },
              parseInt(id!)
            );
            if (values.file) props.rulerProject(values.file, parseInt(id!));
            setEdit(!edit);
          }}
        >
          {({ values, errors, handleChange, setFieldValue }) => {
            const fieldError = (field: string) =>
              submittedEdit ? (errors as Record<string, string>)[field] : undefined;
            const errorArray = submittedEdit
              ? (Object.values(errors).filter(Boolean) as string[])
              : [];

            return (
              <Form>
                <Column>
                  <Row id="end">
                    <Button
                      label="Salvar"
                      type="submit"
                      icon="pi pi-save"
                      loading={props.isLoading}
                      onClick={() => setSubmittedEdit(true)}
                    />
                    <Padding />
                    <Button
                      label="Cancelar"
                      severity="secondary"
                      type="button"
                      onClick={() => setEdit(false)}
                    />
                  </Row>
                </Column>
                <Padding padding="8px" />
                <ErrorSummary errors={errorArray} />
                <Padding padding="32px" />
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Nome do plano de trabalho *</label>
                    <Padding />
                    <TextInput
                      name="name"
                      onChange={handleChange}
                      placeholder="Nome do plano de trabalho*"
                      value={values.name}
                    />
                    <FieldError message={fieldError("name")} />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Parâmetro para aprovação do plano de trabalho *</label>
                    <Padding />
                    <InputNumberComponent
                      name="approval_percentage"
                      onChange={handleChange}
                      suffix="%"
                      placeholder="Parâmetro para aprovação do plano de trabalho *"
                      value={values.approval_percentage}
                    />
                    <FieldError message={fieldError("approval_percentage")} />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Data de início</label>
                    <Padding />
                    <CalendarComponent
                      name="date_initial"
                      dateFormat="dd/mm/yy"
                      placeholder="Data de início"
                      value={values.date_initial}
                      onChange={(e: { value: Date }) => setFieldValue("date_initial", e.value)}
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Data de encerramento</label>
                    <Padding />
                    <CalendarComponent
                      name="date_final"
                      dateFormat="dd/mm/yy"
                      placeholder="Data de encerramento"
                      value={values.date_final}
                      onChange={(e: { value: Date }) => setFieldValue("date_final", e.value)}
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Adicionar ou mudar Régua do plano de trabalho</label>
                    <Padding />
                    <label>* Imagem para adicionar aos relatórios</label>
                    <Padding />
                    <TextInput
                      onChange={(e) => setFieldValue("file", e.target?.files![0])}
                      name="file"
                      placeholder="Régua do plano de trabalho*"
                      type="file"
                    />
                  </div>
                </div>
                <Padding padding="16px" />
              </Form>
            );
          }}
        </Formik>
      ) : (
        <Column>
          <Row id="end">
            <Row id="end">
              {can("project.edit") && (
                  <Button
                    text
                    label="Editar"
                    icon="pi pi-pencil"
                    onClick={() => setEdit(true)}
                  />
                )}
              <Padding />
              {can("project.delete") && (
                  <Button
                    text
                    severity="danger"
                    label="Excluir"
                    icon="pi pi-trash"
                    onClick={() => setVisible(true)}
                  />
                )}
            </Row>
          </Row>
          {(props.project?.project.date_initial || props.project?.project.date_final) && (
            <>
              <Padding padding="8px" />
              <Row>
                {props.project?.project.date_initial && (
                  <small style={{ color: "#6c757d" }}>
                    <strong>Início:</strong>{" "}
                    {new Date(props.project.project.date_initial).toLocaleDateString("pt-BR")}
                  </small>
                )}
                {props.project?.project.date_initial && props.project?.project.date_final && (
                  <Padding padding="16px" />
                )}
                {props.project?.project.date_final && (
                  <small style={{ color: "#6c757d" }}>
                    <strong>Encerramento:</strong>{" "}
                    {new Date(props.project.project.date_final).toLocaleDateString("pt-BR")}
                  </small>
                )}
              </Row>
            </>
          )}
          {props.project?.project.ruler_url && <div>
            <Padding />
            <h4>Régua de marca do plano de trabalho</h4>
            <Padding />
            <Column>
              <label>* Imagem para adicionar aos relatórios</label>
              <Padding />
              <img style={{ width: "100%" }} alt="" src={props.project?.project.ruler_url} />
            </Column>
          </div>}
        </Column>
      )}
      <Padding padding="16px" />
      <div className="grid">
        <div className="col-12 md:col-3">
          <CardQuant
            quant={props.project?.project.approval_percentage + "%"}
            title="Parâmetro para aprovação do plano de trabalho"
            color="navy_blue"
          />
        </div>
        <div className="col-12 md:col-3">
          <CardQuant
            quant={props.project?.project.classrooms.length!}
            title="Total de Turmas"
            color="blue"
          />
        </div>
        <div className="col-12 md:col-3">
          <CardQuant
            quant={props.project?.total_register_count!}
            title="Total de Matriculas"
            color="orange"
          />
        </div>
        <div className="col-12 md:col-3">
          <CardQuant
            quant={props.project?.approved_register_count!}
            title="Total de Matriculas aprovadas"
            color="navy_blue"
          />
        </div>
        <div className="col-12 md:col-3">
          <CardQuant
            quant={props.project?.irregular_term_count!}
            title="Total de Termos Irregulares"
            color="orange"
          />
        </div>
        <div className="col-12 md:col-3">
          <CardQuant
            quant={props.project?.students_approved_by_frequency_count!}
            title="Total de formandos"
            color="blue"
          />
        </div>
        <div className="col-12 md:col-3">
          <CardQuant
            quant={props.project?.students_with_presence_count!}
            title="Total de participantes"
            color="navy_blue"
          />
        </div>
      </div>
      <Padding padding="16px" />
      <h3>Turmas</h3>
      <Padding padding="16px" />

      {props?.project?.project.classrooms?.length! > 0 ? (
        <div className="grid">
          {props.project?.project.classrooms?.map(
            (item: any, index: number) => {
              return (
                <div className="col-12 md:col-6 lg:col-4" key={index}>
                  <CardClassroom
                    title={item.name}
                    meetingCount={item._count.meeting}
                    registrationCount={item._count.register_classroom}
                    id={item.id}
                    status={item.status}
                  />
                </div>
              );
            }
          )}
        </div>
      ) : (
        <Empty title="Turmas" />
      )}
      <ConfirmDialog
        visible={visible}
        onHide={() => setVisible(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmation"
        icon="pi pi-exclamation-triangle"
        accept={() => props.deleteProject(props.project?.project?.id!)}
        reject={() => setVisible(false)}
      />
    </ContentPage>
  );
};

export default ProjectOne;
