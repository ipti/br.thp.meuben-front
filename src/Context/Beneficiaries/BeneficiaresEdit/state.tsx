import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  converterData,
  formatarData,
  getStatus,
  VerifyColor,
  VerifySex,
} from "../../../Controller/controllerGlobal";
import { useFetchRequestClassroom } from "../../../Services/Classroom/query";
import { ControllerUpdateRegistration } from "../../../Services/PreRegistration/controller";
import {
  useFetchRequestProjectList,
  useFetchRequestRegistrationOne,
} from "../../../Services/PreRegistration/query";
import { CreateRegistrationClassroomType } from "../../../Services/PreRegistration/types";
import { UpdateRegister } from "../../Classroom/Registration/type";
import { Registration } from "./type";
import { BeneficiariesController } from "../../../Services/Beneficiaries/controller";
import { UpdateRegisterTerm } from "../../../Services/Beneficiaries/type";

export const BeneficiariesEditState = () => {
  const [project, setProject] = useState<any | undefined>();
  const { data: projectRequet } = useFetchRequestProjectList();
  const { data: classroomsFetch } = useFetchRequestClassroom(project!);
  const [classrooms, setClassrooms] = useState<any>();
  const [file, setFile] = useState<File[] | undefined>();

  const { id } = useParams();
  const {
    requestRegistrationClassroomMutation,
    requestDeleteRegistrationClassroomMutation,
    requestPreRegistrationMutation,
    requestCHangeAvatarRegistrationMutation,
    requestRegisterTermMutation,
  } = ControllerUpdateRegistration();

  const { requestDeleteTermRegisterMutation, requestUpdateTermRegisterMutation } = BeneficiariesController();
  const { data: registrationsRequests, isLoading } =
    useFetchRequestRegistrationOne(id!);
  const [registrations, setRegistrations] = useState<
    Registration | undefined
  >();

  useEffect(() => {
    if (classroomsFetch) {
      setClassrooms(classroomsFetch);
    }
  }, [classroomsFetch, project]);

  useEffect(() => {
    if (registrationsRequests) {
      setRegistrations(registrationsRequests);
    }
  }, [registrationsRequests]);

  const date = new Date(registrations?.birthday!);
  const initialValue = {
    name: registrations?.name,
    sex: VerifySex(registrations?.sex!),
    cpf: registrations?.cpf,
    color_race: VerifyColor(registrations?.color_race!),
    birthday: !isNaN(date.getTime())
      ? formatarData(registrations?.birthday!)
      : registrations?.birthday,
    deficiency: registrations?.deficiency
      ? { name: "Sim", id: true }
      : { name: "Não", id: false },
    responsable_name: registrations?.responsable_name,
    responsable_cpf: registrations?.responsable_cpf,
    responsable_telephone: registrations?.responsable_telephone,
    status: getStatus(registrations?.status!),
    deficiency_description: registrations?.deficiency_description,
    kinship: registrations?.kinship,
    address: registrations?.address ?? "",
    cep: registrations?.cep ?? "",
    neighborhood: registrations?.neighborhood ?? "",
    number: registrations?.number ?? "",
    complement: registrations?.complement ?? "",
    state: registrations?.state_fk ?? "",
    city: registrations?.city_fk ?? "",
    date_registration: registrations?.date_registration
      ? new Date(registrations?.date_registration)
      : null,
      telephone: registrations?.telephone ?? undefined,
      responsable_email: registrations?.responsable_email,
      is_legal_responsible: registrations?.is_legal_responsible,
      image_sharing_not_authorized:
        registrations?.image_sharing_not_authorized ?? false,
      zone: registrations?.zone
  };

  const CreateRegisterClassroom = (data: CreateRegistrationClassroomType) => {
    requestRegistrationClassroomMutation.mutate(data);
  };

  const CreateRegisterTerm = (data: FormData) => {
    requestRegisterTermMutation.mutate({ data: data });
  };

  const DeleteRegistration = (id: number) => {
    requestDeleteRegistrationClassroomMutation.mutate(id);
  };

  const DeleteRegisterTerm = (id: number) => {
    requestDeleteTermRegisterMutation.mutate(id);
  };

   const UpdateRegisterTerm = (id: number, body: UpdateRegisterTerm) => {
    requestUpdateTermRegisterMutation.mutate({body: body, id: id});
  };

  const handleUpdateRegistration = (data: UpdateRegister, id: number) => {
    if (file) {
      requestCHangeAvatarRegistrationMutation.mutate({
        id: id,
        file: file[0],
      });
    }
    requestPreRegistrationMutation.mutate({
      data: {
        ...data,
        birthday: converterData(data?.birthday?.toString()!),
        responsable_telephone: data?.responsable_telephone?.replace(
          /[^a-zA-Z0-9]/g,
          ""
        ),
        telephone: data?.telephone?.replace(/[^a-zA-Z0-9]/g, ""),
        kinship: data.kinship === "" ? "NAO_DEFINIDO" : data.kinship,
        responsable_cpf: data?.responsable_cpf?.replace(/[^a-zA-Z0-9]/g, ""),
        cpf: data?.cpf?.replace(/[^a-zA-Z0-9]/g, ""),
        color_race: data?.color_race?.id,
        sex: data?.sex?.id,
        deficiency: data?.deficiency?.id,
      },
      id: id,
    });
  };
  return {
    registrations,
    initialValue,
    isLoading,
    isLoadingUpdate: requestPreRegistrationMutation.isLoading,
    handleUpdateRegistration,
    DeleteRegistration,
    DeleteRegisterTerm,
    CreateRegisterClassroom,
    projectRequet,
    project,
    setProject,
    classrooms,
    file,
    setFile,
    CreateRegisterTerm,
    UpdateRegisterTerm
  };
};
