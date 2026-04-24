export interface CreatePreRegistration {
    id: number;
    classroom_fk: number;
    name: string;
    birthday: string;
    cpf?: string | null;
    sex: number;
    color_race: number;
    deficiency: boolean;
    deficiency_description?: string | null;
    responsable_name?: string | null;
    responsable_cpf?: string | null;
    responsable_telephone?: string | null;
    responsable_email?: string | null;
    telephone?: string | null;
    zone: number;
    classroom: number;
    kinship: string | undefined | null
  }

  export interface CreateRegistrationClassroomType {
    registration: number;
    classroom: number;
  }
  
  export interface CreateRegistrationTermType {
    registration: number;
    dataValid: string | Date;
    dataTerm: string | Date;
  }
  
  export interface RegistrationCPF {
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
    responsable_email?: string
    telephone?: string
    zone: number
    kinship: string
    kinship_description: any
    status: string
    createdAt: string
    updatedAt: string
    date_registration: string
    cep: string
    address: string
    number: any
    complement: string
    neighborhood: string
    city_fk: number
    state_fk: number
  }
  
