import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { RegistrationType } from "./type";
import { useFetchRequestClassroomRegistrationFiltered } from "../../../Services/PreRegistration/query";
import { ControllerUpdateRegistration } from "../../../Services/PreRegistration/controller";
export const RegistrationClassroomState = () => {
    const {id} = useParams()
    const [statusTerm, setStatusTerm] = useState<string | undefined>(undefined);
    const {data: registrationsRequeset, isLoading} =
      useFetchRequestClassroomRegistrationFiltered(parseInt(id!), statusTerm);
    const {requestDeleteRegistrationClassroomMutation} = ControllerUpdateRegistration()

    const DeleteRegistration = (id: number) => {
        requestDeleteRegistrationClassroomMutation.mutate(id)
    }

    const [registrations, setregistrations] = useState<Array<RegistrationType> | undefined>();

    useEffect(() => {
        if(registrationsRequeset){
            setregistrations(registrationsRequeset)
        }
    }, [registrationsRequeset])

    return {registrations, DeleteRegistration, isLoading, statusTerm, setStatusTerm }
}
