import { useMutation } from "react-query";
import { useNavigate } from "react-router";
import Swal from "sweetalert2";
import { UpdateRegister } from "../../Context/Classroom/Registration/type";
import styles from "../../Styles";
import queryClient from "../reactquery";
import {
  requestCreateRegistrationTerm,
  requestDeleteRegistration,
  requestDeleteRegistrationClassroom,
  requestPreRegistration,
  requestRegistrationClassroom,
  requestUpdateAvatarRegistration,
  requestUpdateRegistration,
  requestUpdateRegistrationClassroom,
} from "./request";
import {
  CreatePreRegistration,
  CreateRegistrationClassroomType
} from "./types";

export const ControllerPreRegistration = () => {
  const history = useNavigate();

  const getErrorMessage = (error: any) => {
    const message = error?.response?.data?.message;

    if (Array.isArray(message)) {
      return message.join(" | ");
    }

    if (typeof message === "string" && message.trim()) {
      return message;
    }

    return "Não foi possível finalizar a matrícula. Revise os dados e tente novamente.";
  };

  const requestPreRegistrationMutation = useMutation(
    (data: CreatePreRegistration) => requestPreRegistration(data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: "Erro ao finalizar matrícula",
          text: getErrorMessage(error),
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        })
       },
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: "Registro feito com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            history("/");
          }
        });
      },
    }
  );

  const requestRegistrationMutation = useMutation(
    (data: CreatePreRegistration) => requestPreRegistration(data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response.data.message,
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        })
       },
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: "Registro feito com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            if (data?.user?.id) {
              history("/beneficiarios/" + data?.user?.id);
            } else {
              history("/beneficiarios");
            }
          }
        });
      },
    }
  );

  return { requestPreRegistrationMutation, requestRegistrationMutation };
};

export const ControllerUpdateRegistration = () => {

  const requestPreRegistrationMutation = useMutation(
    ({ data, id }: { data: UpdateRegister; id: number }) =>
      requestUpdateRegistration(data, id),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response.data.message,
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        })
       },
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: "Alteração realizada com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });

        queryClient.refetchQueries("useRequestsRegistrationOne")
      },
    }
  );

  const requestRegisterTermMutation = useMutation(
    ({ data}: { data: FormData}) =>
      requestCreateRegistrationTerm(data),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response.data.message,
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        })
       },
      onSuccess: (data) => {

        queryClient.refetchQueries("useRequestsClassroomRegistrationOne")
        queryClient.refetchQueries("useRequestsRegistrationOne")
        Swal.fire({
          icon: "success",
          title: "Termo adicionado com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
    }
  );

  const requestUpdateRegistrationClassroomMutation = useMutation(
    ({ data, id }: { data: { status: string; registration_classroom_id?: number }; id?: number }) =>
      requestUpdateRegistrationClassroom(data, id),
    {
      onError: (error: any) => {
        Swal.fire({
          icon: 'error',
          title: error.response.data.message,
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        })
       },
      onSuccess: () => {
        Swal.fire({
          icon: "success",
          title: "Status da matrícula alterado com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });

        queryClient.refetchQueries("useRequestsClassroomRegistrationOne");
        queryClient.refetchQueries("useRequestsClassroomRegistration");
      },
    }
  );

  const requestCHangeAvatarRegistrationMutation = useMutation(
    ({  id, file }: { id: number, file: File }) =>
      requestUpdateAvatarRegistration(id, file),
    {
      onError: (error) => { },
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: "Alteração realizada com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        });
      },
    }
  );

  const requestRegistrationClassroomMutation = useMutation(
    (data: CreateRegistrationClassroomType) =>
      requestRegistrationClassroom(data),
    {
      onError: (error) => { },
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: "Registro feito com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            // history("/");
            queryClient.refetchQueries("useRequestsRegistrationOne");
          }
        });
      },
    }
  );

  const requestDeleteRegistrationClassroomMutation = useMutation(
    (id: number) => requestDeleteRegistrationClassroom(id),
    {
      onError: (error) => { },
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: " Matricula excluida com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            // history("/");
            queryClient.refetchQueries("useRequestsClassroomRegistration");
            queryClient.refetchQueries("useRequestsRegistrationOne");
          }
        });
      },
    }
  );

  const requestDeleteRegistrationMutation = useMutation(
    (id: number) => requestDeleteRegistration(id),
    {
      onError: (error) => { },
      onSuccess: (data) => {
        Swal.fire({
          icon: "success",
          title: " Beneficiario excluido com sucesso!",
          confirmButtonColor: styles.colors.colorsBaseProductNormal,
        }).then((result) => {
          if (result.isConfirmed) {
            // history("/");
            queryClient.refetchQueries("useRequestAllRegistration");
          }
        });
      },
    }
  );

  return {
    requestPreRegistrationMutation,
    requestDeleteRegistrationClassroomMutation,
    requestRegistrationClassroomMutation,
    requestDeleteRegistrationMutation,
    requestCHangeAvatarRegistrationMutation,
    requestRegisterTermMutation,
    requestUpdateRegistrationClassroomMutation
  };
};
