import { Dispatch, SetStateAction } from "react";
import { UpdateRegisterTerm } from "../../../Services/Beneficiaries/type";
import { CreateRegistrationClassroomType } from "../../../Services/PreRegistration/types";
import { UpdateRegister } from "../../Classroom/Registration/type";
import type { RegisterTerm, BlobFile } from "../../../Services/RegisterTerm/type";

export interface BeneficiariesEditType {
  registrations: Registration | undefined;
  initialValue: UpdateRegister;
  isLoading: boolean;
  handleUpdateRegistration: (data: UpdateRegister, id: number) => void;
  DeleteRegistration: (id: number) => void
  UpdateRegisterTerm: (id: number, body: UpdateRegisterTerm) => void
   DeleteRegisterTerm: (id: number) => void
  CreateRegisterClassroom: (data: CreateRegistrationClassroomType) => void
  projectRequet: any
  setProject: Dispatch<any>
  project: any
  classrooms: any
  file: any | undefined
  setFile: Dispatch<SetStateAction<any | undefined>>
  CreateRegisterTerm: (data: FormData) => void
  isLoadingUpdate: boolean
}

export interface Registration {
  thp_id: string
  telephone: string | undefined
  responsable_email: string | undefined
  is_legal_responsible: boolean | undefined
  image_sharing_not_authorized: boolean | undefined
  id: number
  avatar_url: any
  name: string
  birthday: string
  cpf: string
  sex: number
  color_race: number
  deficiency: boolean
  deficiency_description: string
  responsable_name: string
  responsable_cpf: string
  responsable_telephone: string
  zone: number
  kinship: string
  kinship_description: any
  status: string
  createdAt: string
  updatedAt: string
  cep: any
  address: any
  number: any
  complement: any
  neighborhood: any
  city_fk: any
  state_fk: any
  date_registration: any
  register_term: RegisterTerm[]
  register_classroom: RegisterClassroom[]
}

export interface RegisterClassroom {
  id: number
  registration_fk: number
  classroom_fk: number
  status: string
  createdAt: string
  updatedAt: string
  classroom: Classroom
}

export interface Classroom {
  id: number
  project_fk: number
  name: string
  year: number
  active: boolean
  status: string
  createdAt: string
  updatedAt: string
  project: Project
}

export interface Project {
  id: number
  name: string
  active: boolean
  approval_percentage: number
  ruler_url: any
  avartar_url: any
  social_technology_id: number
  createdAt: string
  updatedAt: string
}
