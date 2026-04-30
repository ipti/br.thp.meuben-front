import { Dispatch, SetStateAction } from "react";

export interface SocialTechnology {
  id: number;
  name: string;
}

export interface ReapplicatorUser {
  id: number;
  name: string;
  username: string;
  role: string;
  active: boolean;
  user_social_technology: Array<{
    usersocialtechnology: SocialTechnology;
  }>;
}

export interface Reapplicator {
  id: number;
  initial_date?: string;
  phone?: string;
  email?: string;
  color_race: number;
  sex: number;
  birthday: string;
  active: boolean;
  users_fk: number;
  users: ReapplicatorUser;
}

export interface ReapplicatorsResponse {
  data: Reapplicator[];
  total: number;
  page: number;
  perPage: number;
}

export interface ReapplicatorsTypes {
  reapplicators?: ReapplicatorsResponse;
  reapplicator?: Reapplicator;
  isLoading: boolean;
  isLoadingOne: boolean;
  page: number;
  perPage: number;
  setPage: Dispatch<SetStateAction<number>>;
  loadOne: (id: number) => void;
}
