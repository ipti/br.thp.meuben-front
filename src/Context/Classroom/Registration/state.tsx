import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStatus } from "../../../Controller/controllerGlobal";
import { ControllerUpdateRegistration } from "../../../Services/PreRegistration/controller";
import { useFetchRequestClassroomRegistrationOne } from "../../../Services/PreRegistration/query";
import { RegistrationType, UpdateRegister } from "./type";

export const RegistrationClassroomState = () => {
  const { idRegistration } = useParams();
  const { data: registrationRequest, isLoading } =
    useFetchRequestClassroomRegistrationOne(parseInt(idRegistration!));
  const { requestUpdateRegistrationClassroomMutation } = ControllerUpdateRegistration();
  const [registration, setregistration] = useState<RegistrationType | undefined>();

  useEffect(() => {
    if (registrationRequest) {
      setregistration(registrationRequest);
    }
  }, [registrationRequest]);

  const initialValue = {
    status: getStatus(registration?.status!),
  };

  const handleUpdateRegistration = (data: UpdateRegister) => {
    const payload = {
      status: data.status.id,
    };

    requestUpdateRegistrationClassroomMutation.mutate({
      data: payload,
      id: registration?.id,
    });
  };

  return {
    registration,
    initialValue,
    handleUpdateRegistration,
    isLoading,
  };
};
