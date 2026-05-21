import { useQuery } from "react-query";
import { requestClassroomRegistration, requestClassroomRegistrationOne, requestProjectsAndClassroom, requestRegistrationOne, requestRegistrationOneCpf } from "./request";

export const useFetchRequestProjectList = () => {
    return useQuery(["useRequestProjectsAndClassroom"], () => requestProjectsAndClassroom());
};

export const useFetchRequestClassroomRegistration = (id: number) => {
    return useQuery(
      ["useRequestsClassroomRegistration", id],
      () => requestClassroomRegistration(id)
    );
  };
  export const useFetchRequestClassroomRegistrationFiltered = (
    id: number,
    statusTerm?: string
  ) => {
    return useQuery(
      ["useRequestsClassroomRegistration", id, statusTerm],
      () => requestClassroomRegistration(id, statusTerm)
    );
  };
  export const useFetchRequestClassroomRegistrationOne = (id: number) => {
    return useQuery(["useRequestsClassroomRegistrationOne", id], () => requestClassroomRegistrationOne(id));
  };
  export const useFetchRequestRegistrationOne = (id: string) => {
    return useQuery(["useRequestsRegistrationOne", id], () => requestRegistrationOne(id));
  };
  export const useFetchRequestRegistrationOneCPF = (cpf?: string) => {
    return useQuery(["useRequestsRegistrationOneCPF", cpf], () => requestRegistrationOneCpf(cpf));
  };
