export interface RegistrationDetailsTypes {
  registration?: RegistrationType;
  initialValue: UpdateRegister
  handleUpdateRegistration: (data: UpdateRegister) => void
  isLoading: boolean
}


export interface UpdateRegister 
  {
    name?: string | undefined;
    sex?: {
        id: number;
        type: string;
    } | undefined | any;
    cpf?: string | undefined;
    color_race?: {
        id: number;
        name: string;
    } | undefined | any;
    birthday?: string | undefined | Date;
    deficiency?: {
      name: string;
      id: boolean;
    } | undefined | any;
    responsable_name?: string | undefined;
    responsable_cpf?: string | undefined;
    responsable_telephone?: string | undefined;
    responsable_email?: string | undefined;
    is_legal_responsible?: boolean | undefined;
    zone?: number | undefined;
    status?: {id: string, name: string} | undefined | any;
    registration_classroom_id?: number
    deficiency_description?: any
    kinship?: string | undefined | null
    date_registration?: any | undefined
    telephone?: string | undefined | any
}
export interface RegistrationType {
  avatar_url: string
  id: number
  registration_fk: number
  classroom_fk: number
  status: string
  createdAt: string
  updatedAt: string
  registration: Registration
}

export interface Registration {
  thp_id: string
  telephone: string | undefined
  responsable_email: string | undefined
  is_legal_responsible: boolean | undefined
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
  date_registration: string
  cep: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city_fk: number
  state_fk: number
  city: City
  state: State
  register_term: RegisterTerm[]
}

export interface City {
  id: number
  state_fk: number
  name: string
  cep_initial: string
  cep_final: string
  ddd1: number
  ddd2: number
}

export interface State {
  id: number
  acronym: string
  name: string
}

export interface RegisterTerm {
  id: number
  dateTerm: string
  dateValid: string
  observation: string
  createdAt: string
  updatedAt: string
  registration_fk: number
  blob_file_fk: number
}
