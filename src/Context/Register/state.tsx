// import { Controller } from "../../../controller/registration";
// import { useFetchRequestQuiz } from "../../../query/quiz";

import { useEffect, useState } from "react";
import { useFetchRequestProjectList, useFetchRequestRegistrationOneCPF } from "../../Services/PreRegistration/query";
import { Project, Projects, Registration } from "./type";
import { ControllerPreRegistration } from "../../Services/PreRegistration/controller";
import { useNavigate } from "react-router-dom";
import { RegistrationCPF } from "../../Services/PreRegistration/types";
import { sanitizeDigits } from "../../Utils/beneficiaryRules";

export const RegisterState = () => {
  const padding = "16px";
  const history = useNavigate()
  const [step, setStep] = useState(0);
  const [isOverAge, setIsOverAge] = useState<boolean | undefined>();
  const [project, setproject] = useState<Projects | undefined>()
  const { data: projectRequet } = useFetchRequestProjectList();
  const [classroom, setClassroom] = useState<Project | undefined>();
  const [dataValues, setDataValues] = useState<Registration | any>({});
  const props = ControllerPreRegistration()

  const NextStep = (values: any) => {
    setStep(step + 1);
    let data = Object.assign(dataValues, values);
    setDataValues(data);
  };

  const backStep = () => {
    if (step !== 0) {
      setStep(step - 1);
    }
    if (step === 0) {
      history("/register")
    }
  }

  useEffect(() => {
    if (projectRequet) {
      setproject(projectRequet)
    }
  }, [projectRequet])


  const color_race = [
    { value: 0, label: 'Não Declarada' },
    { value: 1, label: 'Branca' },
    { value: 2, label: 'Preta' },
    { value: 3, label: 'Parda' },
    { value: 4, label: 'Amarela' },
    { value: 5, label: 'Indígena' }
  ];

  const sex = [
    { value: 1, label: 'Masculino' },
    { value: 2, label: 'Feminino' },
  ];

    const { data: registrationCpf } = useFetchRequestRegistrationOneCPF(dataValues?.cpf?.replace(/[^a-zA-Z0-9]/g, ''));
  
    var registraionFind: RegistrationCPF = registrationCpf;
  

  const CreateRegister = () => {
    const data = new Date(dataValues?.birthday);
    const dataFormatada = data?.toISOString()?.split('T')[0];

    props.requestPreRegistrationMutation.mutate({
      ...dataValues,
      cpf: sanitizeDigits(dataValues.cpf),
      kinship: dataValues.kinship === "" ? "NAO_DEFINIDO" : dataValues.kinship,
      telephone: sanitizeDigits(dataValues.telephone),
      responsable_telephone: sanitizeDigits(dataValues.responsable_telephone),
      birthday: dataFormatada,
      responsable_cpf: sanitizeDigits(dataValues?.responsable_cpf),
    })
  }

  const initialState: Registration = {
    birthday: "",
    classroom: null,
    color_race: null,
    deficiency: null,
    name: "",
    sex: null,
    zone: null,
    cpf: "",
    deficiency_description: "",
    responsable_cpf: "",
    responsable_name: "",
    responsable_telephone: "",
    telephone: "",
    responsable_email: "",
    cep: "",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: null,
    state: null,
    is_legal_responsible: false,
  };

  return {
    padding,
    NextStep,
    initialState,
    isOverAge,
    setIsOverAge,
    step,
    project,
    dataValues,
    classroom, setClassroom, color_race, backStep, sex, CreateRegister,registraionFind
  };
};
