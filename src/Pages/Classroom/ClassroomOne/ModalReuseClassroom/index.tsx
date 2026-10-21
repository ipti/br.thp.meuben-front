import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { useContext, useState } from "react";
import * as Yup from "yup";
import CalendarComponent from "../../../../Components/Calendar";
import DropdownComponent from "../../../../Components/Dropdown";
import TextInput from "../../../../Components/TextInput";
import { AplicationContext } from "../../../../Context/Aplication/context";
import { controllerYears } from "../../../../Controller/controllerYears";
import { useFetchRequestTsListsYear } from "../../../../Services/Project/query";
import { Column, Padding, Row } from "../../../../Styles/styles";
import { PropsAplicationContext } from "../../../../Types/types";
import { ClassroomContext } from "../../../../Context/Classroom/context";
import { ClassroomTypes } from "../../../../Context/Classroom/type";

const formatDateOnly = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const ModalReuseClassroom = ({
  onHide,
  visible,
  classroom
}: {
  onHide(): void;
  visible?: boolean | undefined;
  classroom: any
}) => {

    const props = useContext(ClassroomContext) as ClassroomTypes;
  const propsAplication = useContext(AplicationContext) as PropsAplicationContext;
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [tsId, setTsId] = useState<number | undefined>(undefined);
  const { data: tsOneRequest } = useFetchRequestTsListsYear(tsId, year);
  const { yearsOptions } = controllerYears();

  const schema = Yup.object().shape({
    year: Yup.string().nullable().required("Ano é obrigatório"),
    idTs: Yup.string().nullable().required("Tecnologia Social é obrigatória"),
    idProject: Yup.string().nullable().required("Plano de trabalho é obrigatório"),
    name: Yup.string().required("Nome da turma é obrigatório"),
    meetingPeriod: Yup.array()
      .nullable()
      .when("reuseEncontros", {
        is: true,
        then: (field) =>
          field.test(
            "complete-meeting-period",
            "Selecione a data inicial e a data final dos encontros",
            (value) =>
              Array.isArray(value) &&
              value.length === 2 &&
              value[0] instanceof Date &&
              value[1] instanceof Date,
          ),
      }),
  });


  return (
    <Dialog
      onHide={onHide}
      visible={visible}
      header="Reaproveitar turma"
      style={{ width: window.innerWidth < 800 ? "80vw" : "50vw" }}
    >
      <Formik
        initialValues={{
          year: year,
          idTs: "",
          idProject: "",
          name: classroom?.name || "",
          reuseEncontros: false,
          meetingPeriod: null as (Date | null)[] | null,
        }}
        validationSchema={schema}
        onSubmit={(values) => {
          const [meetingDateStart, meetingDateEnd] = values.meetingPeriod ?? [];
          props.ReuseClassroom({
            idClassroom: classroom?.id,
            idProject: values.idProject,
            name: values.name,
            reuseEncontros: values.reuseEncontros,
            meetingDateStart:
              values.reuseEncontros && meetingDateStart
                ? formatDateOnly(meetingDateStart)
                : undefined,
            meetingDateEnd:
              values.reuseEncontros && meetingDateEnd
                ? formatDateOnly(meetingDateEnd)
                : undefined,
          });
          onHide();
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue }) => {
          const filteredTs = propsAplication.project

          const filteredProjects = tsOneRequest?.project

          return (
            <Form>
              <div className="grid">
                <div className="col-12 md:col-6">
                  <label>Nome da nova turma</label>
                  <Padding />
                  <TextInput
                    value={values.name}
                    placeholder="Nome da nova turma"
                    onChange={handleChange}
                    name="name"
                  />
                  {errors.name && touched.name ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                      {typeof errors.name === 'string' ? errors.name : ''}
                    </div>
                  ) : null}
                </div>
                <div className="col-12 md:col-6">
                  <label>Ano</label>
                  <Padding />
                  <DropdownComponent
                    value={values.year}
                    options={yearsOptions}
                    placerholder="Ano"
                    onChange={(e) => {
                      setFieldValue("year", e.target.value);
                      setYear(e.target.value);
                      setFieldValue("idTs", "");
                      setFieldValue("idProject", "");
                    }}
                    optionsValue="value"
                    optionsLabel="value"
                    name="year"
                  />
                  {errors.year && touched.year ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                      {errors.year}
                    </div>
                  ) : null}
                </div>
                <div className="col-12 md:col-6">
                  <label>Tecnologia Social</label>
                  <Padding />
                  <DropdownComponent
                    value={values.idTs}
                    options={filteredTs}
                    placerholder="Tecnologia Social"
                    onChange={(e) => {
                      setTsId(e.target.value ? Number(e.target.value) : undefined);
                      setFieldValue("idTs", e.target.value);
                      setFieldValue("idProject", "");
                    }}
                    optionsValue="id"
                    optionsLabel="name"
                    name="idTs"
                  />
                  {errors.idTs && touched.idTs ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                      {errors.idTs}
                    </div>
                  ) : null}
                </div>
                <div className="col-12 md:col-6">
                  <label>Plano de trabalho</label>
                  <Padding />
                  <DropdownComponent
                    value={values.idProject}
                    options={filteredProjects}
                    placerholder="Plano de trabalho"
                    onChange={handleChange}
                    optionsValue="id"
                    optionsLabel="name"
                    name="idProject"
                  />
                  {errors.idProject && touched.idProject ? (
                    <div style={{ color: "red", marginTop: "8px" }}>
                      {errors.idProject}
                    </div>
                  ) : null}
                </div>
              </div>
              <Padding padding="16px" />
              <div className="col-12">
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Checkbox
                    inputId="reuseEncontros"
                    checked={values.reuseEncontros}
                    onChange={(e) => {
                      const checked = !!e.checked;
                      setFieldValue("reuseEncontros", checked);
                      if (!checked) {
                        setFieldValue("meetingPeriod", null);
                      }
                    }}
                  />
                  <label htmlFor="reuseEncontros" style={{ cursor: "pointer", fontWeight: 500 }}>
                    Reaproveitar encontros da turma
                  </label>
                </div>
                {values.reuseEncontros && (
                  <>
                    <div style={{ marginTop: 18 }}>
                      <label htmlFor="meetingPeriod" style={{ display: "block", fontWeight: 500 }}>
                        Período dos encontros da turma original *
                      </label>
                      <Padding />
                      <CalendarComponent
                        name="meetingPeriod"
                        value={values.meetingPeriod}
                        onChange={(e: any) => setFieldValue("meetingPeriod", e.value)}
                        selectionMode="range"
                        placeholder="Selecione a data inicial e final"
                        dateFormat="dd/mm/yy"
                      />
                      {touched.meetingPeriod && typeof errors.meetingPeriod === "string" && (
                        <div style={{ color: "red", marginTop: 8 }}>{errors.meetingPeriod}</div>
                      )}
                    </div>
                    <div style={{
                      marginTop: 10,
                      padding: "10px 14px",
                      borderRadius: 8,
                      background: "rgba(252,173,9,0.12)",
                      border: "1px solid rgba(252,173,9,0.4)",
                      display: "flex",
                      gap: 8,
                      alignItems: "flex-start",
                    }}>
                      <i className="pi pi-info-circle" style={{ color: "#9a6700", marginTop: 2, flexShrink: 0 }} />
                      <span style={{ fontSize: "0.85rem", color: "#9a6700", lineHeight: 1.5 }}>
                        Somente os encontros entre as datas selecionadas serão copiados, mantendo as datas originais. Ajuste-as depois, se necessário.
                      </span>
                    </div>
                  </>
                )}
              </div>
              <Padding padding="16px" />
              <Column style={{ width: "100%" }}>
                <Row id="end">
                  <Button label="Reaproveitar" />
                </Row>
              </Column>
            </Form>
          );
        }}
      </Formik>
    </Dialog>
  );
};

export default ModalReuseClassroom;
