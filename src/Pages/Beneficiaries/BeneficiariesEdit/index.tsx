import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { Column } from "primereact/column";
import { ConfirmDialog } from "primereact/confirmdialog";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { useContext, useRef, useState } from "react";
import styled from "styled-components";
import * as Yup from "yup";
import avatar from "../../../Assets/images/avatar.svg";
import CalendarComponent from "../../../Components/Calendar";
import DropdownComponent from "../../../Components/Dropdown";
import Icon from "../../../Components/Icon";
import MaskInput from "../../../Components/InputMask";
import InputAddress from "../../../Components/InputsAddress";
import Loading from "../../../Components/Loading";
import TextInput from "../../../Components/TextInput";
import BeneficiariesEditProvider, {
  BeneficiariesEditContext,
} from "../../../Context/Beneficiaries/BeneficiaresEdit/context";
import { BeneficiariesEditType } from "../../../Context/Beneficiaries/BeneficiaresEdit/type";
import {
  color_race,
  formatarData,
  getErrorsAsArray,
  getStatus,
  kinship,
  StatusRegistrationEnum,
  StatusTermEnum,
  typesex,
  TypeTermEnum
} from "../../../Controller/controllerGlobal";
import { validaCPF } from "../../../Controller/controllerValidCPF";
import styles from "../../../Styles";
import color from "../../../Styles/colors";
import { Container, Padding, Row } from "../../../Styles/styles";

import { Popover } from "react-tiny-popover";
import ModalAddTerm from "./ModalAddTerm";
import ModalCreateRegisterClassroom from "./ModalCreateRegisterClassroom";
import CheckboxComponent from "../../../Components/Checkbox";
import RadioButtonComponent from "../../../Components/RadioButton";
import {
  isUnder18ByBirthDate,
  shouldRequireBeneficiaryPhone,
} from "../../../Utils/beneficiaryRules";

const BeneficiariesEdit = () => {
  return (
    <BeneficiariesEditProvider>
      <BeneficiariesEditPage />
    </BeneficiariesEditProvider>
  );
};

export const Avatar = styled.div`
  border: 1px solid ${styles.colors.colorBorderCard};
  height: 128px;
  width: 128px;
  border-radius: 50%;

  img {
    border-radius: 50%; /* This will make the image circular */
    height: 100%;
    width: 100%;
  }
`;

const ErrorSummary = ({ errors }: { errors: string[] }) => {
  if (errors.length === 0) return null;
  return (
    <div
      style={{
        background: "#fff5f5",
        border: "1px solid #fc8181",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "16px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
        <i className="pi pi-exclamation-circle" style={{ color: "#e53e3e", fontSize: "18px" }} />
        <strong style={{ color: "#c53030", fontSize: "15px" }}>
          Corrija os seguintes erros antes de continuar:
        </strong>
      </div>
      <ul style={{ margin: 0, paddingLeft: "20px" }}>
        {errors.map((error, index) => (
          <li key={index} style={{ color: "#c53030", marginBottom: "4px", fontSize: "14px" }}>
            {error}
          </li>
        ))}
      </ul>
    </div>
  );
};

const FieldError = ({ message }: { message?: string }) => {
  if (!message) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px", color: "#e53e3e", marginTop: "6px", fontSize: "13px" }}>
      <i className="pi pi-times-circle" style={{ fontSize: "13px" }} />
      <span>{message}</span>
    </div>
  );
};

const BeneficiariesEditPage = () => {
  const props = useContext(BeneficiariesEditContext) as BeneficiariesEditType;
  const [visible, setVisible] = useState<any>();
  const [visibleTerm, setVisibleTerm] = useState<any>();
  const [visibleDeleteTerm, setVisibleDeleteTerm] = useState<any>();
  const [visiblePdfViewer, setVisiblePdfViewer] = useState(false);
  const [pdfViewerUrl, setPdfViewerUrl] = useState<string>("");
  const [pdfViewerLoading, setPdfViewerLoading] = useState(false);
  const [pdfViewerError, setPdfViewerError] = useState<string>("");
  const objectUrlRef = useRef<string>("");
  const [submitted, setSubmitted] = useState(false);

  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório"),
    color_race: Yup.object().required("Raça/cor é obrigatório"),
    deficiency: Yup.object().required("Deficiência é obrigatória"),
    cpf: Yup.string()
      .test("cpf-valid", "CPF inválido", (value) => {
        if (value && value.trim() !== "") {
          return validaCPF(value);
        }
        return true;
      })
      .required("CPF é obrigatório"),
    responsable_cpf: Yup.string()
      .nullable()
      .transform((value) => (value === "" || value === null ? undefined : value))
      .test("cpf-valid", "CPF inválido", (value) => {
        if (value && value.trim() !== "") {
          return validaCPF(value);
        }
        return true;
      })
      .when("birthday", {
        is: (birthday: string) => isUnder18ByBirthDate(birthday),
        then: (s) => s.required("CPF do responsável é obrigatório para menores de 18 anos"),
        otherwise: (s) => s.optional(),
      }),
    responsable_name: Yup.string()
      .nullable()
      .transform((value) => (value === "" || value === null ? undefined : value))
      .when("birthday", {
        is: (birthday: string) => isUnder18ByBirthDate(birthday),
        then: (s) => s.required("Nome do responsável é obrigatório para menores de 18 anos"),
        otherwise: (s) => s.optional(),
      }),
    responsable_telephone: Yup.string()
      .nullable()
      .transform((value) => (value === "" || value === null ? undefined : value))
      .when("birthday", {
        is: (birthday: string) => isUnder18ByBirthDate(birthday),
        then: (s) => s.required("Telefone do responsável é obrigatório para menores de 18 anos"),
        otherwise: (s) => s.optional(),
      }),
    responsable_email: Yup.string()
      .nullable()
      .transform((value) => (value === "" || value === null ? undefined : value))
      .email("E-mail do responsável inválido"),
    kinship: Yup.string()
      .nullable()
      .transform((value) => (value === "" || value === null || value === "NAO_DEFINIDO" ? undefined : value))
      .when("birthday", {
        is: (birthday: string) => isUnder18ByBirthDate(birthday),
        then: (s) => s.required("Parentesco é obrigatório para menores de 18 anos"),
        otherwise: (s) => s.optional(),
      }),
    telephone: Yup.string().when("birthday", {
      is: (birthday: string) => shouldRequireBeneficiaryPhone(birthday),
      then: (s) => s.required("Telefone para contato é obrigatório"),
      otherwise: (s) => s.optional(),
    }),
    is_legal_responsible: Yup.boolean().when("birthday", {
      is: (birthday: string) => isUnder18ByBirthDate(birthday),
      then: (s) =>
        s
          .oneOf([true], "É necessário confirmar que é o responsável legal do menor")
          .required("É necessário confirmar que é o responsável legal do menor"),
      otherwise: (s) => s.optional(),
    }),
    birthday: Yup.string().nullable().required("Data de nascimento é obrigatória"),
    zone: Yup.string().nullable().required("Zona é obrigatório"),
    neighborhood: Yup.string().nullable().required("Bairro/Povoado é obrigatória"),
    address: Yup.string().nullable().required("Endereço é obrigatória"),
    state: Yup.string().nullable().required("Estado é obrigatório"),
    city: Yup.string().nullable().required("Cidade é obrigatório"),
    sex: Yup.object().nullable().required("Sexo é obrigatória"),
  });

  const closePdfViewer = () => {
    setVisiblePdfViewer(false);
    setPdfViewerUrl("");
    setPdfViewerLoading(false);
    setPdfViewerError("");

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = "";
    }
  };

  const openPdfViewer = async (url: string) => {
    if (!url) {
      return;
    }

    setVisiblePdfViewer(true);
    setPdfViewerLoading(true);
    setPdfViewerError("");

    try {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = "";
      }

      const response = await fetch(url, {
        headers: {
          Accept: "application/pdf",
        },
      });
      if (!response.ok) {
        throw new Error("Falha ao carregar o arquivo.");
      }

      const buffer = await response.arrayBuffer();
      const pdfBlob = new Blob([buffer], { type: "application/pdf" });
      const blobUrl = URL.createObjectURL(pdfBlob);
      objectUrlRef.current = blobUrl;
      setPdfViewerUrl(blobUrl);
    } catch (error) {
      setPdfViewerUrl(url);
      setPdfViewerError(
        "Não foi possível abrir a pré-visualização agora. Você ainda pode abrir em nova guia."
      );
    } finally {
      setPdfViewerLoading(false);
    }
  };

  const [visibleDelete, setVisibleDelete] = useState<any>();

  if (props.isLoading) return <Loading />;

  const renderHeader = () => {
    return (
      <div
        className="flex justify-content-between"
        style={{ background: color.colorCard }}
      >
        <Button
          label="Nova matricula"
          icon="pi pi-plus"
          onClick={() => setVisible(true)}
        />
      </div>
    );
  };

  const renderHeaderTerm = () => {
    return (
      <div
        className="flex justify-content-between"
        style={{ background: color.colorCard }}
      >
        <Button
          label={"Novo termo"}
          icon="pi pi-plus"
          type="button"
          onClick={() => setVisibleTerm(true)}
        />
      </div>
    );
  };




  const StatusBody = (rowData: any) => {
    return <div>{getStatus(rowData?.status)?.name}</div>;
  };

  const ActionBeneficiariesBody = (rowData: any) => {
    return (
      <Row id="center">
        {/* <Button rounded icon={"pi pi-pencil"} onClick={() => { history(`${rowData.id}`) }} /> */}
        <Button
          severity="danger"
          rounded
          icon={"pi pi-trash"}
          onClick={() => {
            setVisibleDelete(rowData);
          }}
        />
      </Row>
    );
  };

  

  return (
    <Container>
      <h1>Editar Beneficiario</h1>
      <Padding padding="16px" />
      {props.registrations ? (
        <Formik
          initialValues={props.initialValue}
          validationSchema={schema}
          onSubmit={(values) => {
            props.handleUpdateRegistration(
              { ...values },
              props.registrations?.id!
            );
          }}
        >
          {({ values, handleChange, errors, touched, setFieldValue, validateForm }) => {
            const errorArray = submitted ? getErrorsAsArray(errors) : [];
            const fieldError = (field: string) =>
              submitted ? (errors as any)[field] : undefined;

            const handleBirthdayChange = (e: any) => {
              handleChange(e);
              // Re-valida após mudança de birthday para atualizar campos condicionais
              setTimeout(() => validateForm(), 0);
            };
            console.log(values)
            return (
              <Form>
                <div>
                  <Row id="end">
                    <Button
                      label="Salvar"
                      type="submit"
                      loading={props.isLoadingUpdate}
                      onClick={() => setSubmitted(true)}
                      icon="pi pi-save"
                    />
                  </Row>
                </div>
                <Padding padding="8px" />
                <ErrorSummary errors={errorArray} />

                <Padding padding="8px" />
                <Avatar>
                  <img
                    alt=""
                    src={
                      props.file
                        ? URL.createObjectURL(props.file![0]) ?? undefined
                        : props.registrations?.avatar_url
                          ? props.registrations?.avatar_url
                          : avatar
                    }
                  />
                </Avatar>
                <Padding padding="8px" />
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Avatar </label>
                    <Padding />
                    <TextInput
                      // value={props.file}
                      type="file"
                      placeholder="Avatar"
                      onChange={(e) => props.setFile(e.target.files)}
                      name="name"
                    />
                  </div>

                </div>
                <Padding padding="8px" />
                <h3>Dados basicos</h3>
                <Padding />
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Id THP</label>
                    <Padding />
                    <TextInput
                      value={props.registrations?.thp_id}
                      placeholder="Id THP"
                      disabled
                      name="thp_id"
                    />

                  </div>
                  <div className="col-12 md:col-6">
                    <label>Status</label>
                    <Padding />
                    <TextInput
                      value={props.registrations?.status ? StatusRegistrationEnum[props.registrations?.status] : props.registrations?.status}
                      name="status"
                      disabled
                    />
                    {errors.status && touched.status ? (
                      <FieldError message={fieldError("status")} />
                    ) : null}
                  </div>
                </div>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Name</label>
                    <Padding />
                    <TextInput
                      value={values.name}
                      placeholder="name"
                      onChange={handleChange}
                      name="name"
                    />

                    {errors.name && touched.name ? (
                      <FieldError message={fieldError("name")} />
                    ) : null}
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Sexo</label>
                    <Padding />
                    <DropdownComponent
                      value={values.sex}
                      optionsLabel="type"
                      options={typesex}
                      name="sex"
                      onChange={handleChange}
                    />

                    {errors.sex && touched.sex ? (
                      <FieldError message={fieldError("sex")} />
                    ) : null}
                  </div>
                </div>{" "}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Data de Nascimento</label>
                    <Padding />
                    <MaskInput
                      value={values.birthday?.toString()}
                      mask="99/99/9999"
                      placeholder="Data de Nascimento"
                      name="birthday"
                      onChange={handleBirthdayChange}
                    />

                    {errors.birthday && touched.birthday ? (
                      <FieldError message={fieldError("birthday")} />
                    ) : null}
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Cor de raça</label>
                    <Padding />
                    <DropdownComponent
                      value={values.color_race}
                      options={color_race}
                      name="color_race"
                      onChange={handleChange}
                    />{" "}
                    {errors.color_race && touched.color_race ? (
                      <FieldError message={fieldError("color_race")} />
                    ) : null}
                  </div>
                </div>{" "}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>CPF *</label>
                    <Padding />
                    <MaskInput
                      value={values.cpf}
                      mask="999.999.999-99"
                      placeholder="CPF *"
                      onChange={handleChange}
                      name="cpf"
                    />
                    {errors.cpf && touched.cpf ? (
                      <FieldError message={fieldError("cpf")} />
                    ) : null}
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Data de matricula</label>
                    <Padding />
                    <CalendarComponent
                      value={values.date_registration}
                      name="date_registration"
                      dateFormat="dd/mm/yy"
                      onChange={handleChange}
                    />
                    {errors.date_registration && touched.date_registration ? (
                      <FieldError message={fieldError("date_registration")} />
                    ) : null}
                  </div>
                  <div className="col-12 md:col-6">
                    <label>
                      Telefone para contato{shouldRequireBeneficiaryPhone(values.birthday?.toString() ?? "") ? " *" : ""}
                    </label>
                    <Padding />
                    <MaskInput
                      value={values.telephone}
                      mask="(99) 9 9999-9999"
                      name="telephone"
                      onChange={handleChange}
                      placeholder="Telefone para contato"
                    />
                    {errors.telephone && touched.telephone ? (
                      <FieldError message={fieldError("telephone")} />
                    ) : null}
                  </div>
                    <div className="col-12 md:col-6">
                    <label>Deficiente</label>
                    <Padding />
                    <DropdownComponent
                      value={values.deficiency}
                      placerholder="Deficiente"
                      name="deficiency"
                      onChange={handleChange}
                      options={[
                        { id: true, name: "Sim" },
                        { id: false, name: "Não" },
                      ]}
                    />
                    {errors.deficiency && touched.deficiency ? (
                      <FieldError message={fieldError("deficiency")} />
                    ) : null}
                  </div>
                  {values.deficiency?.id && (
                    <div className="col-12 md:col-6">
                      <label>Qual deficiência?</label>
                      <Padding />
                      <TextInput
                        value={values.deficiency_description}
                        name="deficiency_description"
                        onChange={handleChange}
                        placeholder="Qual deficiência ?"
                      />
                    </div>
                  )}
                </div>{" "}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Zona *</label>
                    <Padding />
                    <Row className="gap-2">
                      <RadioButtonComponent
                        value={1}
                        checked={values.zone === 1}
                        onChange={handleChange}
                        name="zone"
                        label="Rural"
                      />
                      <RadioButtonComponent
                        value={2}
                        checked={values.zone === 2}
                        onChange={handleChange}
                        name="zone"
                        label="Urbana"
                      />
                    </Row>
                    {errors.zone && touched.zone ? (
                      <FieldError message={fieldError("zone")} />
                    ) : null}
                  </div>
                </div>
                <Padding padding="8px" />
                <h3>Dados Responsavel (Se for menor de 18 anos)</h3>
                <Padding />
                {isUnder18ByBirthDate(values.birthday?.toString() ?? "") ? (
                  <>
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <label>Nome</label>
                        <Padding />
                        <TextInput
                          value={values.responsable_name}
                          name="responsable_name"
                          onChange={handleChange}
                          placeholder="Nome do Resposável"
                        />
                        {errors.responsable_name && touched.responsable_name ? (
                          <FieldError message={fieldError("responsable_name")} />
                        ) : null}
                      </div>
                      <div className="col-12 md:col-6">
                        <label>CPF Responsavel</label>
                        <Padding />
                        <MaskInput
                          value={values.responsable_cpf}
                          mask="999.999.999-99"
                          name="responsable_cpf"
                          placeholder="CPF do Responsável"
                          onChange={handleChange}
                        />
                        {errors.responsable_cpf && touched.responsable_cpf ? (
                          <FieldError message={fieldError("responsable_cpf")} />
                        ) : null}
                      </div>
                    </div>{" "}
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <label>Parentesco</label>
                        <Padding />
                        <DropdownComponent
                          placerholder="Parantesco"
                          onChange={handleChange}
                          options={kinship}
                          name="kinship"
                          optionsValue="id"
                          optionsLabel="name"
                          value={values.kinship}
                        />
                        {errors.kinship && touched.kinship ? (
                          <FieldError message={fieldError("kinship")} />
                        ) : null}
                      </div>
                      <div className="col-12 md:col-6">
                        <label>
                          Telefone do Responsável{isUnder18ByBirthDate(values.birthday?.toString() ?? "") ? " *" : ""}
                        </label>
                        <Padding />
                        <MaskInput
                          value={values.responsable_telephone}
                          mask="(99) 9 9999-9999"
                          name="responsable_telephone"
                          onChange={handleChange}
                          placeholder="Telefone do Responsável"
                        />
                        {errors.responsable_telephone && touched.responsable_telephone ? (
                          <FieldError message={fieldError("responsable_telephone")} />
                        ) : null}
                      </div>
                      <div className="col-12 md:col-6">
                        <label>
                          E-mail do Responsável
                        </label>
                        <Padding />
                        <TextInput
                          value={values.responsable_email}
                          name="responsable_email"
                          onChange={handleChange}
                          placeholder="E-mail do Responsável"
                        />
                        {errors.responsable_email && touched.responsable_email ? (
                          <FieldError message={fieldError("responsable_email")} />
                        ) : null}
                      </div>
                      {isUnder18ByBirthDate(values.birthday?.toString() ?? "") && (
                        <div className="col-12">
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                            <CheckboxComponent
                              checked={values.is_legal_responsible}
                              onChange={(e) => setFieldValue("is_legal_responsible", e.checked)}
                            />
                            <label style={{ cursor: "pointer", fontWeight: 500 }}>
                              Confirmo que sou o responsável legal deste menor de idade *
                            </label>
                          </div>
                          {errors.is_legal_responsible && touched.is_legal_responsible ? (
                            <FieldError message={fieldError("is_legal_responsible")} />
                          ) : null}
                        </div>
                      )}
                    </div>{" "}
                  </>
                ) : (
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>
                    Beneficiário maior de 18 anos: os dados de responsável legal não são necessários.
                  </div>
                )}
                <Padding />
                <h3>Endereço</h3>
                <Padding padding="8px" />
                <InputAddress
                  errors={errors}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                  touched={touched}
                  values={values}
                />
                <Padding padding="8px" />
                <h3>Termo</h3>
                <Padding padding="8px" />
                <DataTable
                  value={props.registrations?.register_term}
                  tableStyle={{ minWidth: "50rem" }}
                  header={renderHeaderTerm}
                >
                  <Column
                    body={(row) => {
                      return <>{formatarData(row?.dateTerm!)}</>;
                    }}
                    header="Data de assinatura"
                  ></Column>
                  <Column
                    body={(row) => {
                      return <>{formatarData(row?.dateValid ?? "")}</>;
                    }}
                    header="Data de validade"
                  ></Column>
                  <Column
                    body={(row) => {
                      return (

                        <>
                          {TypeTermEnum[row?.type ?? ""] && `${TypeTermEnum[row?.type ?? ""]}`}
                        </>
                      );
                    }}
                    header="Tipo do termo"
                  ></Column>
                  <Column
                    body={(row) => {
                      return (
                        <>
                          {StatusTermEnum[row?.status ?? ""] && `${StatusTermEnum[row?.status ?? ""]}`}
                        </>
                      );
                    }}
                    header="Status"
                  ></Column>
                  <Column
                    body={(row) => {
                      return (
                        <>
                          {row?.observation}
                        </>
                      );
                    }}
                    header="Observações"
                  ></Column>
                  <Column
                    align={"center"}
                    body={(e) => (
                      <RenderActionTerm
                        row={e}
                        setVisibleDeleteTerm={setVisibleDeleteTerm}
                        setVisibleTerm={setVisibleTerm}
                        onOpenPdfViewer={(url: string) => {
                          openPdfViewer(url);
                        }}
                      />
                    )}
                    header="Ações"
                  ></Column>
                </DataTable>
                <Padding padding="8px" />
                <h3>Matriculas</h3>
                <Padding padding="8px" />
                {/* <h3>Endereço</h3>
                <Padding />
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>CEP</label>
                    <Padding />
                    <TextInput
                      value={values.responsable_name}
                      placeholder="name"
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Endereço</label>
                    <Padding />
                    <TextInput value={values.responsable_cpf} />
                  </div>
                </div>{" "}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Complemento</label>
                    <Padding />
                    <TextInput value={values.responsable_cpf} />
                  </div>
                </div>{" "}
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Estado </label>
                    <Padding />
                    <TextInput
                      value={values.responsable_telephone}
                      placeholder="name"
                    />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Cidade </label>
                    <Padding />
                    <TextInput
                      value={values.responsable_telephone}
                      placeholder="name"
                    />
                  </div>
                </div>{" "} */}
              </Form>
            );
          }}
        </Formik>
      ) : null}
      <DataTable
        value={props.registrations?.register_classroom}
        tableStyle={{ minWidth: "50rem" }}
        header={renderHeader}
      >
        <Column
          field="classroom.project.name"
          header="Plano de trabalho"
        ></Column>
        <Column field="classroom.name" header="Turma"></Column>
        <Column body={StatusBody} header="Status"></Column>
        <Column header="Ações" body={ActionBeneficiariesBody}></Column>
      </DataTable>
      <ModalCreateRegisterClassroom
        onHide={() => setVisible(false)}
        visible={visible}
      />
      <ModalAddTerm
        onHide={() => setVisibleTerm(false)}
        visible={visibleTerm}
        id={props.registrations?.id!}
      />
      <Dialog
        header="Visualizar termo"
        visible={visiblePdfViewer}
        onHide={closePdfViewer}
        style={{ width: window.innerWidth > 800 ? "80vw" : "95vw" }}
      >
        <div
          style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "12px",
            color: "#334155",
          }}
        >
          Confira o termo abaixo. Se preferir, você pode abrir em nova guia.
        </div>
        {pdfViewerLoading ? (
          <p>Carregando visualização do termo...</p>
        ) : null}
        {pdfViewerError ? (
          <p style={{ color: "#b91c1c", marginBottom: "12px" }}>{pdfViewerError}</p>
        ) : null}
        {pdfViewerUrl && !pdfViewerLoading ? (
          <div>
            <object
              data={pdfViewerUrl}
              type="application/pdf"
              style={{ width: "100%", height: "75vh", border: "none" }}
            >
              <iframe
                title="Visualizador de termo"
                src={pdfViewerUrl}
                style={{ width: "100%", height: "75vh", border: "none" }}
              />
            </object>
            <Padding padding="8px" />
            <a href={pdfViewerUrl} target="_blank" rel="noreferrer">
              Abrir em nova guia
            </a>
          </div>
        ) : null}
      </Dialog>
      <ConfirmDialog
        visible={visibleDelete}
        onHide={() => setVisibleDelete(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmação"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteRegistration(visibleDelete.id)}
        reject={() => setVisibleDelete(false)}
      />

      <ConfirmDialog
        visible={visibleDeleteTerm}
        onHide={() => setVisibleDeleteTerm(false)}
        message="Tem certeza de que deseja prosseguir?"
        header="Confirmação"
        icon="pi pi-exclamation-triangle"
        accept={() => props.DeleteRegisterTerm(visibleDeleteTerm.id)}
        reject={() => setVisibleDeleteTerm(false)}
      />
    </Container>
  );
};

const RenderActionTerm = ({
  row,
  setVisibleTerm,
  setVisibleDeleteTerm,
  onOpenPdfViewer,
}: {
  row: any,
  setVisibleTerm: any,
  setVisibleDeleteTerm: any,
  onOpenPdfViewer: (url: string) => void
}) => {

  const [isPopoverOpen, setIsPopoverOpen] = useState<any>();

  return (
    <Row id="center" style={{ gap: "8px" }}>
      <Popover
        isOpen={isPopoverOpen}
        positions={["top", "bottom", "left", "right"]} // preferred positions by priority
        onClickOutside={() => setIsPopoverOpen(!isPopoverOpen)}
        content={
          <div
            style={{
              backgroundColor: "white",
              padding: "8px",
              minWidth: "128px",
              boxShadow:
                "rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px",
            }}
          >
            <Row
              onClick={() => {
                onOpenPdfViewer(row?.blob_file?.blob_url);
                setIsPopoverOpen(!isPopoverOpen);
              }}
              id="space-between"
              style={{ cursor: "pointer", padding: "8px", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Icon icon="pi pi-eye" size="16px" />
              </div>
              <p>Visualizar</p>
            </Row>
            <Row
              onClick={() => {
                window.open(row.blob_file.blob_url);
                setIsPopoverOpen(!isPopoverOpen);
              }}
              id="space-between"
              style={{ cursor: "pointer", padding: "8px", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Icon icon="pi pi-download" size="16px" />
              </div>
              <p>Baixar</p>
            </Row>
            <Row
              onClick={() => {
                setVisibleTerm(row);
                setIsPopoverOpen(!isPopoverOpen);
              }}
              id="space-between"
              style={{ cursor: "pointer", padding: "8px", gap: "8px" }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Icon icon="pi pi-pencil" size="16px" />
              </div>
              <p>Editar</p>
            </Row>
            <div className="w-full">
              <Row
                onClick={() => {
                  setVisibleDeleteTerm(row);
                  setIsPopoverOpen(!isPopoverOpen);
                }}
                id="space-between"
                style={{ cursor: "pointer", padding: "8px", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                  }}
                >
                  <Icon icon="pi pi-trash" size="16px" />
                </div>
                <p>Excluir</p>
              </Row>
            </div>
          </div>
        }
      >
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setIsPopoverOpen(!isPopoverOpen)}
        >
          {" "}
          <Icon icon="pi pi-ellipsis-v" />
        </div>
      </Popover>
    </Row>
  );
};
export default BeneficiariesEdit;
