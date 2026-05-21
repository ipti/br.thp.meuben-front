import { Dispatch, SetStateAction } from "react";
import { Status } from "../../../Controller/controllerGlobal";

export interface RegistrationClassroomTypes {
  registrations?: RegistrationsList;
  DeleteRegistration: (id: number) => void
  isLoading: boolean
  statusTerm?: string
  setStatusTerm: Dispatch<SetStateAction<string | undefined>>
}

export type RegistrationsList = RegistrationType[];



export interface RegistrationType {
  id: number
  registration_fk: number
  classroom_fk: number
  createdAt: string
  updatedAt: string
  registration: Registration,
  status: string
}

export interface Registration {
  thp_id: string
  id: number
  name: string
  birthday: string
  avatar_url: string
  cpf: string
  sex: number
  color_race: number
  deficiency: boolean
  deficiency_description: any
  responsable_name: string
  responsable_cpf: string
  responsable_telephone: string
  zone: number
  status: string
  createdAt: string
  updatedAt: string
}
