import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useState } from "react";
import * as Yup from "yup";
import CheckboxComponent from "../../../Components/Checkbox";
import ContentPage from "../../../Components/ContentPage";
import ErrorSummary from "../../../Components/ErrorSummary";
import DropdownComponent from "../../../Components/Dropdown";
import FieldError from "../../../Components/FieldError";
import MaskInput from "../../../Components/InputMask";
import RadioButtonComponent from "../../../Components/RadioButton";
import StepsNavigator, { StepItem } from "../../../Components/StepsNavigator";
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
import color from "../../../Styles/colors";
import InputAddress from "../../../Components/InputsAddress";
import { useFetchRequestRegistrationOneCPF } from "../../../Services/PreRegistration/query";
import { RegistrationCPF } from "../../../Services/PreRegistration/types";
import CalendarComponent from "../../../Components/Calendar";
import {
  isUnder18ByBirthDate,
  shouldRequireBeneficiaryPhone,
} from "../../../Utils/beneficiaryRules";

// ─── Schema ───────────────────────────────────────────────────────────────────
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
  responsable_cpf: Yup.string()
    .test("cpf-valid", "CPF inválido", (value) => {
      if (value && value.trim() !== "") return validaCPF(value);
      return true;
    })
    .when("birthday", {
      is: (birthday: string) => isUnder18ByBirthDate(birthday),
      then: (s) => s.required("CPF do responsável é obrigatório"),
      otherwise: (s) => s.optional(),
    }),
  responsable_name: Yup.string().when("birthday", {
    is: (birthday: string) => isUnder18ByBirthDate(birthday),
    then: (s) => s.required("Nome do responsável é obrigatório para menores de 18 anos"),
    otherwise: (s) => s.optional(),
  }),
  telephone: Yup.string().when("birthday", {
    is: (birthday: string) => shouldRequireBeneficiaryPhone(birthday),
    then: (s) => s.required("Telefone para contato é obrigatório"),
    otherwise: (s) => s.optional(),
  }),
  responsable_telephone: Yup.string().when("birthday", {
    is: (birthday: string) => isUnder18ByBirthDate(birthday),
    then: (s) => s.required("Telefone do responsável é obrigatório para menores de 18 anos"),
    otherwise: (s) => s.optional(),
  }),
  responsable_email: Yup.string().email("E-mail do responsável inválido"),
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

// ─── Steps ────────────────────────────────────────────────────────────────────
const STEPS: StepItem[] = [
  { key: "cpf", label: "Verificação de CPF", description: "Confirme se o beneficiário já possui cadastro." },
  { key: "dados_basicos", label: "Dados Básicos", description: "Informações pessoais do beneficiário." },
  { key: "responsavel", label: "Dados do Responsável", description: "Obrigatório para menores de 18 anos." },
  { key: "matricula", label: "Matrícula", description: "Vincule o beneficiário a um plano de trabalho (opcional)." },
  { key: "endereco", label: "Endereço", description: "Localização do beneficiário." },
];

const STEP_FIELDS: Record<number, string[]> = {
  0: ["cpf"],
  1: ["name", "sex", "birthday", "color_race", "deficiency", "telephone", "zone"],
  2: ["responsable_name", "responsable_cpf", "responsable_telephone", "kinship", "is_legal_responsible"],
  3: [],
  4: ["address", "neighborhood", "state", "city"],
};

const LAST_STEP = STEPS.length - 1;

// ─── Page wrapper ─────────────────────────────────────────────────────────────
const BeneficiariesCreate = () => (
  <BeneficiariesCreateProvider>
    <RegistrationPage />
  </BeneficiariesCreateProvider>
);

// ─── Form ─────────────────────────────────────────────────────────────────────
const RegistrationPage = () => {
  const props = useContext(BeneficiariesCreateContext) as BeneficiariesCreateType;
  const [cpf, setCpf] = useState<string | undefined>();
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [stepSubmitted, setStepSubmitted] = useState(false);

  const { data: registrationCpf } = useFetchRequestRegistrationOneCPF(cpf);
  const registrationFind: RegistrationCPF = registrationCpf;

  return (
    <ContentPage title="Criar Beneficiário" description="Criar novo beneficiário.">
      <Padding padding="16px" />
      <Formik
        initialValues={props.initialValue}
        validationSchema={schema}
        onSubmit={(values) => {
          delete values.project;
          const cleaned = Object.fromEntries(
            Object.entries(values).filter(([_, v]) => v !== "" && v !== null && v !== undefined)
          );
          props.CreateRegister(cleaned as typeof values);
        }}
      >
        {({ values, handleChange, errors, touched, setFieldValue, validateForm }) => {
          const isUnder18 = isUnder18ByBirthDate(values.birthday);

          const handleStepChange = async (nextStep: number) => {
            if (nextStep > currentStep) {
              setStepSubmitted(true);
              const errs = await validateForm();
              const hasErrors = (STEP_FIELDS[currentStep] ?? []).some((f) => (errs as any)[f]);
              if (hasErrors) return;
              setStepSubmitted(false);
            }
            setCurrentStep(nextStep);
          };

          const fieldError = (field: string) => {
            if (submitted) return (errors as any)[field];
            if (stepSubmitted && (STEP_FIELDS[currentStep] ?? []).includes(field))
              return (errors as any)[field];
            return undefined;
          };

          const errorArray = submitted
            ? getErrorsAsArray(errors)
            : stepSubmitted
              ? (STEP_FIELDS[currentStep] ?? []).map((f) => (errors as any)[f]).filter(Boolean)
              : [];

          const handleBirthdayChange = (e: any) => {
            handleChange(e);
            setTimeout(() => validateForm(), 0);
          };

          return (
            <Form>
              <StepsNavigator
                steps={STEPS}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                showActions={false}

              />

              <Padding padding="16px" />
              <ErrorSummary errors={errorArray} />
              <Padding padding="8px" />

              {currentStep === 0 && (
                <>
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
                      {registrationFind && (
                        <div>
                          <p>Existe um cadastro com esse CPF</p>
                          <p className="mt-3">
                            {registrationFind?.name}{" "}
                            <a href={"/beneficiarios/" + registrationFind.id}>
                              clique aqui para visualizar
                            </a>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {currentStep === 1 && (
                <>
                  <h3>Dados Básicos</h3>
                  <Padding />
                  <div className="grid">
                    <div className="col-12 md:col-6">
                      <label>Nome *</label>
                      <Padding />
                      <TextInput value={values.name} placeholder="Nome" onChange={handleChange} name="name" />
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
                          placeholder="Qual deficiência?"
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
                          <RadioButtonComponent value={1} checked={values.zone === 1} onChange={handleChange} name="zone" label="Rural" />
                          <RadioButtonComponent value={2} checked={values.zone === 2} onChange={handleChange} name="zone" label="Urbana" />
                        </Row>
                      </Column>
                      <FieldError message={fieldError("zone")} />
                    </div>
                  </div>
                </>
              )}

              {currentStep === 2 && (
                <>
                  <h3>Dados do Responsável</h3>
                  <Padding />
                  {isUnder18 ? (
                    <div className="grid">
                      <div className="col-12 md:col-6">
                        <label>Nome *</label>
                        <Padding />
                        <TextInput value={values.responsable_name} name="responsable_name" onChange={handleChange} placeholder="Nome do Responsável" />
                        <FieldError message={fieldError("responsable_name")} />
                      </div>
                      <div className="col-12 md:col-6">
                        <label>CPF Responsável *</label>
                        <Padding />
                        <MaskInput value={values.responsable_cpf} mask="999.999.999-99" name="responsable_cpf" placeholder="CPF do Responsável" onChange={handleChange} />
                        <FieldError message={fieldError("responsable_cpf")} />
                      </div>
                      <div className="col-12 md:col-6">
                        <label>Telefone do Responsável *</label>
                        <Padding />
                        <MaskInput value={values.responsable_telephone} mask="(99) 9 9999-9999" name="responsable_telephone" onChange={handleChange} placeholder="Telefone do Responsável" />
                        <FieldError message={fieldError("responsable_telephone")} />
                      </div>
                      <div className="col-12 md:col-6">
                        <label>E-mail do Responsável</label>
                        <Padding />
                        <TextInput value={values.responsable_email} name="responsable_email" onChange={handleChange} placeholder="E-mail do Responsável" />
                        <FieldError message={fieldError("responsable_email")} />
                      </div>
                      <div className="col-12 md:col-6">
                        <label>Parentesco *</label>
                        <Padding />
                        <DropdownComponent placerholder="Parentesco" onChange={handleChange} options={kinship} name="kinship" optionsValue="id" optionsLabel="name" value={values.kinship} />
                        <FieldError message={fieldError("kinship")} />
                      </div>
                      <div className="col-12">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                          <CheckboxComponent checked={values.is_legal_responsible} onChange={(e) => setFieldValue("is_legal_responsible", e.checked)} />
                          <label style={{ cursor: "pointer", fontWeight: 500 }}>
                            Confirmo que sou o responsável legal deste menor de idade *
                          </label>
                        </div>
                        <FieldError message={fieldError("is_legal_responsible")} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: color.colorsBaseInkLight, fontSize: "14px" }}>
                      Beneficiário maior de 18 anos: os dados de responsável legal não são necessários.
                    </div>
                  )}
                </>
              )}

              {currentStep === 3 && (
                <>
                  <h3>Matrícula</h3>
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
                    {props.classrooms && (
                      <div className="col-12 md:col-6">
                        <label>Turma</label>
                        <Padding />
                        <DropdownComponent value={values.classroom} placerholder="Selecione a turma" name="classroom" optionsValue="id" onChange={handleChange} options={props.classrooms} />
                        <FieldError message={fieldError("classroom")} />
                      </div>
                    )}
                    {values.project && (
                      <div className="col-12 md:col-6">
                        <label>Data de matrícula</label>
                        <Padding />
                        <CalendarComponent value={values.date_registration} name="date_registration" dateFormat="dd/mm/yy" onChange={handleChange} />
                        <FieldError message={fieldError("date_registration")} />
                      </div>
                    )}
                  </div>
                </>
              )}


              {currentStep === LAST_STEP && (
                <>
                  <h3>Endereço</h3>
                  <Padding padding="8px" />
                  <InputAddress
                    errors={submitted || stepSubmitted ? errors : {}}
                    handleChange={handleChange}
                    setFieldValue={setFieldValue}
                    showRequiredAsterisk
                    touched={touched}
                    values={values}
                  />
                  <Padding padding="16px" />
                  <Row id="end">
                    <Button
                      label="Criar"
                      type="submit"
                      icon="pi pi-plus"
                      loading={props.isLoadingCreate}
                      onClick={() => setSubmitted(true)}
                    />
                  </Row>
                </>
              )}
              <Padding padding="16px" />
              <StepsNavigator
                steps={STEPS}
                currentStep={currentStep}
                onStepChange={handleStepChange}
                showActions={currentStep < LAST_STEP}
                onlyActions
              />

            </Form>
          );
        }}
      </Formik>
    </ContentPage>
  );
};

export default BeneficiariesCreate;
