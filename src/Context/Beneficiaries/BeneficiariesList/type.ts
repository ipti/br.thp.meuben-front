import { Dispatch, SetStateAction } from "react";

export interface BeneficiariesListType {
  registrations: any;
  setLimite: Dispatch<SetStateAction<number>>;
  setPage: Dispatch<SetStateAction<number>>;
  DeleteRegistration: (id: number) => void
  updateAllFilter: (newFilter: string) => void
  page: number;
  limite: number;
  allFilter: string | undefined
  tsId: number | undefined
  setTsId: Dispatch<SetStateAction<number | undefined>>
  setallFilter: Dispatch<SetStateAction<string | undefined>>
  filter: BeneficiariesFilterType
  setFilter: (newFilter: BeneficiariesFilterType) => void
}

export interface BeneficiariesFilterType {
  idTs?: number;
  idProject?: number;
  idClassroom?: number;
  statusTerm?: string;
  status?: string;
  typeTerm?: string;
}