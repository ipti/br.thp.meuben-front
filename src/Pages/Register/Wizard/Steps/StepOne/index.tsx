import { Form, Formik } from "formik";
import { Button } from "primereact/button";
import { useContext, useEffect, useRef, useState } from "react";
import * as Yup from "yup";
import DropdownComponent from "../../../../../Components/Dropdown";
import MaskInput from "../../../../../Components/InputMask";
import RadioButtonComponent from "../../../../../Components/RadioButton";
import TextInput from "../../../../../Components/TextInput";
import { RegisterContext } from "../../../../../Context/Register/context";
import { RegisterTypes } from "../../../../../Context/Register/type";
import { validaCPF } from "../../../../../Controller/controllerValidCPF";
import { Column, Padding, Row } from "../../../../../Styles/styles";
import { useFetchRequestRegistrationOneCPF } from "../../../../../Services/PreRegistration/query";
import InputsEquals from "../StepTwo/InputsEquals";
import {
  getDateFromUnknown,
  isUnder18ByBirthDate,
  shouldRequireBeneficiaryPhone,
} from "../../../../../Utils/beneficiaryRules";

const StepOneFormFields = ({
  props,
  values,
  handleChange,
  errors,
  touched,
  setFieldValue,
  registrationCpf,
  setCpfLookup,
}: any) => {
  const hydratedCpfRef = useRef<string>("");

  useEffect(() => {
    const digits = (values.cpf || "").replace(/[^\d]/g, "");
    if (digits.length === 11) {
      setCpfLookup(digits);
    } else {
      setCpfLookup(undefined);
    }
  }, [setCpfLookup, values.cpf]);

  useEffect(() => {
    if (!registrationCpf || hydratedCpfRef.current === registrationCpf.cpf) {
      return;
    }

    hydratedCpfRef.current = registrationCpf.cpf;

    const colorMatch = props.color_race.find(
      (item: any) => item.value === registrationCpf.color_race
    );

    setFieldValue("name", registrationCpf.name || "");
    const birthdayAsDate = getDateFromUnknown(registrationCpf.birthday);
    setFieldValue("birthday", birthdayAsDate || registrationCpf.birthday || "");
    setFieldValue("sex", registrationCpf.sex ?? null);
    setFieldValue(
      "color_race",
      colorMatch?.value ?? registrationCpf.color_race ?? values.color_race ?? ""
    );
    setFieldValue("deficiency", registrationCpf.deficiency ?? null);
    setFieldValue(
      "deficiency_description",
      registrationCpf.deficiency_description || ""
    );
    setFieldValue("zone", registrationCpf.zone ?? null);
    setFieldValue("telephone", registrationCpf.telephone || "");
    setFieldValue("responsable_name", registrationCpf.responsable_name || "");
    setFieldValue("responsable_cpf", registrationCpf.responsable_cpf || "");
    setFieldValue(
      "responsable_telephone",
      registrationCpf.responsable_telephone || ""
    );
    setFieldValue("responsable_email", registrationCpf.responsable_email || "");
    setFieldValue("kinship", registrationCpf.kinship || "");
    setFieldValue(
      "is_legal_responsible",
      Boolean(registrationCpf.is_legal_responsible)
    );
    setFieldValue("state", registrationCpf.state_fk ?? "");
    setFieldValue("city", registrationCpf.city_fk ?? "");
    setFieldValue("cep", registrationCpf.cep ?? "");
    setFieldValue("address", registrationCpf.address ?? "");
    setFieldValue("number", registrationCpf.number ?? "");
    setFieldValue("complement", registrationCpf.complement ?? "");
    setFieldValue("neighborhood", registrationCpf.neighborhood ?? "");
  }, [props.color_race, registrationCpf, setFieldValue, values.color_race]);

  const isUnder18 = isUnder18ByBirthDate(values.birthday);

  return (
    <Form>
      <Column className="contentStart" id="center">
        <Row id="center">
          <div className="col-12 md:col-7">
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <p>
                Preencha os dados do beneficiário.
                Se o CPF já existir no MeuBen, os dados serão carregados para atualização.
              </p>
            </div>
            <Padding padding={props.padding} />
            <div>
              <label>{"CPF *"}</label>
              <Padding />
              <MaskInput
                mask="999.999.999-99"
                placeholder={"CPF *"}
                name="cpf"
                value={values.cpf}
                onChange={handleChange}
              />
            </div>
            {registrationCpf?.id ? (
              <div style={{ color: "#0f766e", marginTop: "8px", fontSize: "13px" }}>
                Cadastro encontrado: os dados foram carregados automaticamente.
              </div>
            ) : null}
            {errors.cpf && touched.cpf ? (
              <div style={{ color: "red", marginTop: "8px" }}>{errors.cpf}</div>
            ) : null}
            <Padding padding={props.padding} />
            <div>
              <label>Nome *</label>
              <Padding />
              <TextInput
                placeholder="Nome *"
                name="name"
                onChange={handleChange}
                value={values.name}
              />
            </div>
            {errors.name && touched.name ? (
              <div style={{ color: "red", marginTop: "8px" }}>{errors.name}</div>
            ) : null}
            <Padding padding={props.padding} />
            <div>
              <label>Cor/Raça *</label>
              <Padding />
              <DropdownComponent
                placerholder="Cor/Raça *"
                value={values.color_race}
                onChange={handleChange}
                name="color_race"
                optionsLabel="label"
                optionsValue="value"
                options={props.color_race}
              />
            </div>
            {errors.color_race && touched.color_race ? (
              <div style={{ color: "red", marginTop: "8px" }}>{String(errors.color_race)}</div>
            ) : null}
            <Padding padding={props.padding} />
            <div>
              <label>Possui Deficiência? *</label>
              <Padding />
              <Row className="gap-2">
                <RadioButtonComponent
                  label="Sim"
                  name="deficiency"
                  value={true}
                  checked={values.deficiency === true}
                  onChange={handleChange}
                />
                <RadioButtonComponent
                  label="Não"
                  name="deficiency"
                  value={false}
                  checked={values.deficiency === false}
                  onChange={handleChange}
                />
              </Row>
            </div>
            {values.deficiency && (
              <>
                <Padding padding={props.padding} />
                <div>
                  <label>Qual deficiência?</label>
                  <Padding />
                  <TextInput
                    placeholder="Qual deficiência?"
                    name="deficiency_description"
                    onChange={handleChange}
                    value={values.deficiency_description}
                  />
                </div>
              </>
            )}
            {errors.deficiency && touched.deficiency ? (
              <div style={{ color: "red", marginTop: "8px" }}>
                {String(errors.deficiency)}
              </div>
            ) : null}
            <Padding padding={props.padding} />
            <div
              style={{
                background: "#fffbeb",
                border: "1px solid #fde68a",
                borderRadius: "8px",
                padding: "12px",
              }}
            >
              <p>
                A maioridade é identificada automaticamente pela data de nascimento.
                {isUnder18
                  ? " Como é menor de 18 anos, no próximo passo pediremos os dados do responsável."
                  : " Como é maior de 18 anos, vamos direto para revisão e finalização."}
              </p>
            </div>
            <InputsEquals
              errors={errors}
              handleChange={handleChange}
              touched={touched}
              values={values}
              setFieldValue={setFieldValue}
            />
          </div>
        </Row>
        <Padding padding={props.padding} />
        <Row id="center" className={"marginTop marginButtom"}>
          <div className="col-12 md:col-5" style={{ maxWidth: "420px" }}>
            <Button type="submit" className="t-button-primary" label="Continuar" />
          </div>
        </Row>
        <Padding padding={props.padding} />
      </Column>
    </Form>
  );
};

const StepOne = () => {
  const props = useContext(RegisterContext) as RegisterTypes;
  const [cpfLookup, setCpfLookup] = useState<string | undefined>(
    props.dataValues.cpf?.replace(/[^\d]/g, "")
  );

  const { data: registrationCpf } = useFetchRequestRegistrationOneCPF(cpfLookup);
  const colorRaceRaw: any = props.dataValues.color_race;

  const colorRaceInitial =
    typeof colorRaceRaw === "object" &&
    colorRaceRaw !== null
      ? colorRaceRaw.value ??
        colorRaceRaw.id ??
        ""
      : colorRaceRaw ?? "";

  const initialValue = {
    cpf: props.dataValues.cpf ?? "",
    name: props.dataValues.name ?? "",
    color_race: colorRaceInitial,
    deficiency: props.dataValues.deficiency ?? null,
    birthday: props.dataValues.birthday ?? "",
    zone: props.dataValues.zone ?? null,
    sex: props.dataValues.sex ?? null,
    deficiency_description: props.dataValues.deficiency_description ?? "",
    city: props.dataValues.city ?? "",
    state: props.dataValues.state ?? "",
    neighborhood: props.dataValues.neighborhood ?? "",
    address: props.dataValues.address ?? "",
    number: props.dataValues.number ?? "",
    complement: props.dataValues.complement ?? "",
    cep: props.dataValues.cep ?? "",
    telephone: props.dataValues.telephone ?? "",
    responsable_name: props.dataValues.responsable_name ?? "",
    responsable_cpf: props.dataValues.responsable_cpf ?? "",
    responsable_telephone: props.dataValues.responsable_telephone ?? "",
    responsable_email: props.dataValues.responsable_email ?? "",
    kinship: props.dataValues.kinship ?? "",
    is_legal_responsible: props.dataValues.is_legal_responsible ?? false,
  };

  const schema = Yup.object().shape({
    cpf: Yup.string()
      .test("cpf-valid", "CPF inválido", (value) => validaCPF(value || ""))
      .required("CPF é obrigatório"),
    name: Yup.string().required("Nome é obrigatório"),
    color_race: Yup.number().required("Raça/cor é obrigatório"),
    deficiency: Yup.boolean().required("Deficiência é obrigatória"),
    birthday: Yup.mixed().required("Data de nascimento é obrigatória"),
    zone: Yup.number().nullable().required("Zona é obrigatória"),
    sex: Yup.number().nullable().required("Sexo é obrigatório"),
    neighborhood: Yup.string().nullable().required("Bairro/Povoado é obrigatório"),
    address: Yup.string().nullable().required("Endereço é obrigatório"),
    state: Yup.number().nullable().required("Estado é obrigatório"),
    city: Yup.number().nullable().required("Cidade é obrigatória"),
    telephone: Yup.string().when("birthday", {
      is: (birthday: unknown) => shouldRequireBeneficiaryPhone(birthday),
      then: (s) => s.required("Telefone para contato é obrigatório para maiores de 18 anos"),
      otherwise: (s) => s.optional(),
    }),
  });

  return (
    <Formik
      initialValues={initialValue}
      validationSchema={schema}
      onSubmit={(values) => props.NextStep(values)}
    >
      {({ values, handleChange, errors, touched, setFieldValue }) => {
        return (
          <StepOneFormFields
            props={props}
            values={values}
            handleChange={handleChange}
            errors={errors}
            touched={touched}
            setFieldValue={setFieldValue}
            registrationCpf={registrationCpf}
            setCpfLookup={setCpfLookup}
          />
        );
      }}
    </Formik>
  );
};

export default StepOne;
