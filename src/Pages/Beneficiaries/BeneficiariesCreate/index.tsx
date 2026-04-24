import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import * as Yup from "yup";
import CheckboxComponent from "../../../Components/Checkbox";
import ContentPage from "../../../Components/ContentPage";
import DropdownComponent from "../../../Components/Dropdown";
import MaskInput from "../../../Components/InputMask";
import Loading from "../../../Components/Loading";
import RadioButtonComponent from "../../../Components/RadioButton";
import TextInput from "../../../Components/TextInput";
import BeneficiariesCreateProvider, {
  BeneficiariesCreateContext,
} from "../../../Context/Beneficiaries/BeneficiaresCreate/context";
import { BeneficiariesCreateType } from "../../../Context/Beneficiaries/BeneficiaresCreate/type";
import {
  color_race,
  getErrorsAsArray,
  kinship,
  typesex,
} from "../../../Controller/controllerGlobal";
import { validaCPF } from "../../../Controller/controllerValidCPF";
import { Column, Padding, Row } from "../../../Styles/styles";
import InputAddress from "../../../Components/InputsAddress";
import { useFetchRequestRegistrationOneCPF } from "../../../Services/PreRegistration/query";
import { RegistrationCPF } from "../../../Services/PreRegistration/types";
import CalendarComponent from "../../../Components/Calendar";
import {
  isUnder18ByBirthDate,
  shouldRequireBeneficiaryPhone,
} from "../../../Utils/beneficiaryRules";

const BeneficiariesCreate = () => {
  return (
    <BeneficiariesCreateProvider>
      <RegistrationPage />
    </BeneficiariesCreateProvider>
  );
};

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

const RegistrationPage = () => {
  const props = useContext(BeneficiariesCreateContext) as BeneficiariesCreateType;
  const [cpf, setCpf] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);

  const { data: registrationCpf } = useFetchRequestRegistrationOneCPF(cpf);

  var registraionFind: RegistrationCPF = registrationCpf;

  const schema = Yup.object().shape({
    name: Yup.string().required("Nome é obrigatório"),
    color_race: Yup.string().required("Raça/cor é obrigatório"),
    deficiency: Yup.boolean().required("Deficiência é obrigatória"),
    cpf: Yup.string()
      .test("cpf-valid", "CPF inválido", (value) => {
        if (value && value.trim() !== "") return validaCPF(value);
        return true;
      })
      .required("CPF é obrigatório"),
    responsable_cpf: Yup.string().test("cpf-valid", "CPF inválido", (value) => {
      if (value && value.trim() !== "") return validaCPF(value);
      return true;
    }).when("birthday", {
      is: (birthday: string) => isUnder18ByBirthDate(birthday),
      then: (s) => s.required("CPF do responsável é obrigatório"),
      otherwise: (s) => s.optional(),
    }),
    responsable_name: Yup.string().when("birthday", {
      is: (birthday: string) => isUnder18ByBirthDate(birthday),
      then: (s) => s.required("Nome do responsável é obrigatório para menores de 18 anos"),
      otherwise: (s) => s.optional(),
    }),
    // Telefone de contato: obrigatório apenas para maiores de 18
    telephone: Yup.string().when("birthday", {
      is: (birthday: string) => shouldRequireBeneficiaryPhone(birthday),
      then: (s) => s.required("Telefone para contato é obrigatório"),
      otherwise: (s) => s.optional(),
    }),
    // Telefone do responsável: obrigatório apenas para menores de 18
    responsable_telephone: Yup.string().when("birthday", {
      is: (birthday: string) => isUnder18ByBirthDate(birthday),
      then: (s) => s.required("Telefone do responsável é obrigatório para menores de 18 anos"),
      otherwise: (s) => s.optional(),
    }),
    responsable_email: Yup.string()
      .email("E-mail do responsável inválido"),
    kinship: Yup.string()
      .nullable()
      .when("birthday", {
        is: (birthday: string) => isUnder18ByBirthDate(birthday),
        then: (s) => s.required("Parentesco é obrigatório para menores de 18 anos"),
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
    project: Yup.string().nullable(),
    classroom: Yup.string().nullable(),
    neighborhood: Yup.string().nullable().required("Bairro/Povoado é obrigatória"),
    address: Yup.string().nullable().required("Endereço é obrigatória"),
    state: Yup.string().nullable().required("Estado é obrigatório"),
    city: Yup.string().nullable().required("Cidade é obrigatório"),
    sex: Yup.string().nullable().required("Sexo é obrigatória"),
  });

  if (false) return <Loading />;

  return (
    <ContentPage title="Criar Beneficiario" description="Criar novo beneficiário.">
      <Padding padding="16px" />
      {true ? (
        <Formik
          initialValues={props.initialValue}
          validationSchema={schema}
          onSubmit={(values) => {
            delete values.project;

            // Remove campos com valor string vazia
            const cleaned = Object.fromEntries(
              Object.entries(values).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
            );

            props.CreateRegister(cleaned as typeof values);
          }}
        >
          {({ values, handleChange, errors, touched, setFieldValue, validateForm }) => {
            const errorArray = submitted ? getErrorsAsArray(errors) : [];
            const fieldError = (field: string) =>
              submitted ? (errors as any)[field] : undefined;

            const handleBirthdayChange = (e: any) => {
              handleChange(e);
              setTimeout(() => validateForm(), 0);
            };

            return (
              <Form>
                <Column>
                  <Row id="end">
                    <Button
                      label="Criar"
                      type="submit"
                      icon={"pi pi-plus"}
                      loading={props.isLoadingCreate}
                      onClick={() => setSubmitted(true)}
                    />
                  </Row>
                </Column>
                <Padding padding="8px" />
                <ErrorSummary errors={errorArray} />
                <Padding padding="8px" />
                <h3>Verificar Cadastro</h3>
                <Padding padding="8px" />
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>CPF *</label>
                    <Padding />
                    <MaskInput
                      value={values.cpf}
                      mask="999.999.999-99"
                      placeholder="CPF *"
                      onChange={(e) => {
                        handleChange(e);
                        setCpf(e.target.value ?? "");
                      }}
                      name="cpf"
                    />
                    <FieldError message={fieldError("cpf")} />
                  </div>
                  <div className="col-12 md:col-6">
                    {registraionFind && (
                      <div>
                        <p>Existe um cadastro com esse cpf</p>
                        <p className="mt-3">
                          {registraionFind?.name}{" "}
                          <a href={"/beneficiarios/" + registraionFind.id}>
                            clique aqui para visualizar
                          </a>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                <Padding padding="8px" />
                <h3>Dados basicos</h3>
                <Padding />
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Nome *</label>
                    <Padding />
                    <TextInput
                      value={values.name}
                      placeholder="Nome"
                      onChange={handleChange}
                      name="name"
                    />
                    <FieldError message={fieldError("name")} />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Sexo *</label>
                    <Padding />
                    <DropdownComponent
                      value={values.sex}
                      optionsLabel="type"
                      options={typesex}
                      optionsValue="id"
                      placerholder="Selecione seu sexo"
                      name="sex"
                      onChange={handleChange}
                    />
                    <FieldError message={fieldError("sex")} />
                  </div>
                </div>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Data de Nascimento *</label>
                    <Padding />
                    <CalendarComponent
                      value={values.birthday}
                      dateFormat="dd/mm/yy"
                      placeholder="Data de Nascimento"
                      name="birthday"
                      onChange={handleBirthdayChange}
                    />
                    <FieldError message={fieldError("birthday")} />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>Cor de raça *</label>
                    <Padding />
                    <DropdownComponent
                      value={values.color_race}
                      options={color_race}
                      placerholder="Selecione sua cor de raça"
                      name="color_race"
                      optionsValue="id"
                      onChange={handleChange}
                    />
                    <FieldError message={fieldError("color_race")} />
                  </div>
                </div>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Deficiente *</label>
                    <Padding />
                    <DropdownComponent
                      value={values.deficiency}
                      placerholder="Possui deficiência?"
                      name="deficiency"
                      onChange={handleChange}
                      optionsValue="id"
                      options={[
                        { id: true, name: "Sim" },
                        { id: false, name: "Não" },
                      ]}
                    />
                    <FieldError message={fieldError("deficiency")} />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>
                      Telefone para contato{shouldRequireBeneficiaryPhone(values.birthday) ? " *" : ""}
                    </label>
                    <Padding />
                    <MaskInput
                      value={values.telephone}
                      mask="(99) 9 9999-9999"
                      name="telephone"
                      onChange={handleChange}
                      placeholder="Telefone para contato"
                    />
                    <FieldError message={fieldError("telephone")} />
                  </div>
                  {values.deficiency && (
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
                </div>
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Zona *</label>
                    <Padding />
                    <Column id="end">
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
                    </Column>
                    <FieldError message={fieldError("zone")} />
                  </div>
                </div>
                <Padding padding="8px" />
                <h3>Dados Responsavel (Se for menor de 18 anos)</h3>
                <Padding />
                {isUnder18ByBirthDate(values.birthday) ? (
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
                    <FieldError message={fieldError("responsable_name")} />
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
                    <FieldError message={fieldError("responsable_cpf")} />
                  </div>
                  <div className="col-12 md:col-6">
                    <label>
                      Telefone do Responsável{isUnder18ByBirthDate(values.birthday) ? " *" : ""}
                    </label>
                    <Padding />
                    <MaskInput
                      value={values.responsable_telephone}
                      mask="(99) 9 9999-9999"
                      name="responsable_telephone"
                      onChange={handleChange}
                      placeholder="Telefone do Responsável"
                    />
                    <FieldError message={fieldError("responsable_telephone")} />
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
                    <FieldError message={fieldError("responsable_email")} />
                  </div>
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
                    <FieldError message={fieldError("kinship")} />
                  </div>
                  {isUnder18ByBirthDate(values.birthday) && (
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
                      <FieldError message={fieldError("is_legal_responsible")} />
                    </div>
                  )}
                </div>
                ) : (
                  <div style={{ color: "#6b7280", fontSize: "14px" }}>
                    Beneficiário maior de 18 anos: os dados de responsável legal não são necessários.
                  </div>
                )}
                <Padding padding="8px" />
                <h3>Matricula</h3>
                <Padding padding="8px" />
                <div className="grid">
                  <div className="col-12 md:col-6">
                    <label>Plano de trabalho</label>
                    <Padding />
                    <DropdownComponent
                      value={props.project}
                      placerholder="Selecione o plano de trabalho"
                      name="project"
                      onChange={(e) => {
                        props.setProject(e.target.value);
                        setFieldValue("project", e.target.value);
                      }}
                      options={props.tsOne?.project}
                      optionsLabel="name"
                      optionsValue="id"
                    />
                    <FieldError message={fieldError("project")} />
                  </div>
                  {props.classrooms ? (
                    <div className="col-12 md:col-6">
                      <label>Turma</label>
                      <Padding />
                      <DropdownComponent
                        value={values.classroom}
                        placerholder="Selecione a turma"
                        name="classroom"
                        optionsValue="id"
                        onChange={handleChange}
                        options={props.classrooms}
                      />
                      <FieldError message={fieldError("classroom")} />
                    </div>
                  ) : null}
                  {values.project && (
                    <div className="col-12 md:col-6">
                      <label>Data de matricula</label>
                      <Padding />
                      <CalendarComponent
                        value={values.date_registration}
                        name="date_registration"
                        dateFormat="dd/mm/yy"
                        onChange={handleChange}
                      />
                      <FieldError message={fieldError("date_registration")} />
                    </div>
                  )}
                </div>
                <Padding />
                <h3>Endereço</h3>
                <Padding padding="8px" />
                <InputAddress
                  errors={submitted ? errors : {}}
                  handleChange={handleChange}
                  setFieldValue={setFieldValue}
                  touched={touched}
                  values={values}
                />
              </Form>
            );
          }}
        </Formik>
      ) : null}
    </ContentPage>
  );
};
export default BeneficiariesCreate;
